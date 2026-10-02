import {
  CalculationInputs,
  CalculationResults,
  ManufacturerProduct,
  TechnicalRequirement,
} from "../../types";
import { findCompatibleProduct, findCompatibleProducts } from "../catalog";
import { AMPACITY_TABLES_NBR5410 } from "./ampacity-tables";
import {
  AIR_TEMPERATURE_FACTORS_PVC,
  getGroupingFactor,
  getSoilResistivityFactor,
  getTemperatureFactor,
} from "./correction-factors";
import {
  getCableImpedance,
  inferVoltageDropArrangement,
  STANDARD_CABLE_SECTIONS,
  VoltageDropArrangement,
} from "./voltage-drop-data";

export class CalculationEngine {
  private static readonly RHO_COPPER_70 = 0.0213;
  private static readonly COS_PHI_DEFAULT = 0.85;
  private static readonly EFFICIENCY_DEFAULT = 0.9;
  private static readonly SECAO_MINIMA_FORCA = 2.5;

  static readonly TEMPERATURE_FACTORS: Record<string, number> = Object.fromEntries(
    Object.entries(AIR_TEMPERATURE_FACTORS_PVC).map(([k, v]) => [String(k), v]),
  );

  static readonly GROUPING_COUNT_FACTORS: Record<string, number> = {
    "1": 1.0,
    "2": 0.8,
    "3": 0.7,
    "4": 0.65,
    "5": 0.6,
    "6": 0.57,
    "7": 0.54,
    "8": 0.52,
    "9": 0.5,
  };

  static calculateNominalCurrent(
    power: number,
    unit: string,
    voltage: number,
    phase: string = "trifasico",
    pf: number = 0.85,
    eff: number = 0.9,
  ): number {
    let powerKW = power;
    if (unit === "cv") powerKW = power * 0.7355;
    if (unit === "hp") powerKW = power * 0.7457;

    if (phase === "trifasico") {
      return (powerKW * 1000) / (Math.sqrt(3) * voltage * pf * eff);
    }
    return (powerKW * 1000) / (voltage * pf * eff);
  }

  private static validateInputs(inputs: CalculationInputs): void {
    if (!["manual", "catalog"].includes(inputs.dataSource))
      throw new Error("Origem dos dados inválida.");
    if (!["cv", "hp", "kW"].includes(inputs.powerUnit))
      throw new Error("Unidade de potência inválida.");
    if (!["monofasico", "trifasico"].includes(inputs.phase))
      throw new Error("Sistema elétrico inválido.");
    if (
      !["direta", "reversao", "estrelaTriangulo", "softStarter", "inversor"].includes(
        inputs.starterType,
      )
    )
      throw new Error("Tipo de partida inválido.");
    if (inputs.quantity !== 1) throw new Error("Esta versão dimensiona um motor por circuito.");
    if (inputs.dataSource === "catalog" && !inputs.motorCatalogData)
      throw new Error("Dados do motor de catálogo não informados.");
    if (!Number.isFinite(inputs.power) || inputs.power <= 0)
      throw new Error("Potência do motor inválida.");
    if (!Number.isFinite(inputs.voltage) || inputs.voltage <= 0)
      throw new Error("Tensão de operação inválida.");
    if (!Number.isFinite(inputs.distance) || inputs.distance <= 0)
      throw new Error("Distância do circuito inválida.");
    if (
      !Number.isFinite(inputs.maxVoltageDrop) ||
      inputs.maxVoltageDrop <= 0 ||
      inputs.maxVoltageDrop > 4
    ) {
      throw new Error("A queda de tensão admissível deve estar entre 0 e 4%.");
    }

    if (inputs.phase === "monofasico" && ["softStarter", "inversor"].includes(inputs.starterType)) {
      throw new Error(
        "Nesta versão, soft-starter e inversor são suportados apenas para motores trifásicos. Alimentação monofásica com motor trifásico exige seleção específica e não é suportada neste cálculo.",
      );
    }

    const pf = inputs.powerFactor ?? this.COS_PHI_DEFAULT;
    const eff = inputs.efficiency ?? this.EFFICIENCY_DEFAULT;
    const fs = inputs.serviceFactor ?? 1;

    if (!Number.isFinite(pf) || pf <= 0 || pf > 1)
      throw new Error("Fator de potência deve estar entre 0 e 1.");
    if (!Number.isFinite(eff) || eff <= 0 || eff > 1)
      throw new Error("Rendimento deve estar entre 0 e 1.");
    if (!Number.isFinite(fs) || fs <= 0 || fs > 2) throw new Error("Fator de serviço inválido.");

    const groupingCount = inputs.groupingCount ?? 1;
    if (!Number.isInteger(groupingCount) || groupingCount < 1 || groupingCount > 20) {
      throw new Error("Número de circuitos agrupados deve estar entre 1 e 20.");
    }

    if (inputs.phase === "monofasico" && inputs.starterType === "estrelaTriangulo") {
      throw new Error("Partida estrela-triângulo não é aplicável a motor monofásico.");
    }

    const hasIcc = inputs.shortCircuitCurrentKA !== undefined;
    const hasTime = inputs.shortCircuitDurationSeconds !== undefined;
    if (hasIcc !== hasTime) {
      throw new Error("Para verificar curto-circuito, informe Icc e tempo de atuação.");
    }
    if (hasIcc && hasTime) {
      if (
        !Number.isFinite(inputs.shortCircuitCurrentKA) ||
        (inputs.shortCircuitCurrentKA ?? 0) <= 0
      ) {
        throw new Error("Corrente de curto-circuito deve ser maior que zero.");
      }
      if (
        !Number.isFinite(inputs.shortCircuitDurationSeconds) ||
        (inputs.shortCircuitDurationSeconds ?? 0) <= 0 ||
        (inputs.shortCircuitDurationSeconds ?? 0) > 5
      ) {
        throw new Error(
          "Tempo de atuação do curto-circuito deve ser maior que zero e no máximo 5 s.",
        );
      }
    }

    if (!inputs.installationMethod) throw new Error("Método de instalação não especificado.");
  }

  static getSectionByShortCircuit(
    shortCircuitCurrentKA: number,
    durationSeconds: number,
  ): { selectedSection: number; withstandCurrentKA: number } {
    const standardSections = [
      1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500,
    ];
    const currentA = shortCircuitCurrentKA * 1000;

    for (const section of standardSections) {
      // Cobre/PVC: k=115 até 300 mm² e k=103 acima de 300 mm².
      const k = section <= 300 ? 115 : 103;
      const withstandA = (k * section) / Math.sqrt(durationSeconds);
      if (withstandA >= currentA) {
        return { selectedSection: section, withstandCurrentKA: withstandA / 1000 };
      }
    }

    throw new Error("A seção necessária pelo critério térmico de curto-circuito excede 500 mm².");
  }

  private static normalizeInstallationMethod(method: string, phase: string): string {
    if (method === "F_G") return phase === "trifasico" ? "F3_TREFOIL" : "F2";
    return method;
  }

  private static validateMethodForPhase(method: string, phase: string): void {
    if (
      phase === "monofasico" &&
      ["F3_TREFOIL", "F3_FLAT", "G_HORIZONTAL", "G_VERTICAL"].includes(method)
    ) {
      throw new Error(
        "A disposição selecionada exige três condutores carregados e não é compatível com circuito monofásico.",
      );
    }
    if (phase === "trifasico" && method === "F2") {
      throw new Error(
        "O método F com dois condutores carregados não é compatível com circuito trifásico.",
      );
    }
  }

  static getSectionByAmpacity(
    correctedLoadCurrent: number,
    correctedBreakerCurrent: number,
    method: string = "B1",
    conductors: 2 | 3 = 3,
  ): number {
    const tableData = AMPACITY_TABLES_NBR5410.find(
      (entry) => entry.method === method && entry.conductors === conductors,
    );

    if (!tableData) {
      throw new Error(
        `Tabela técnica não encontrada para ${method} com ${conductors} condutores carregados.`,
      );
    }

    const requiredAmpacity = Math.max(correctedLoadCurrent, correctedBreakerCurrent);
    const sortedSections = Object.keys(tableData.table)
      .map(Number)
      .sort((a, b) => a - b);

    for (const section of sortedSections) {
      const ampacity = tableData.table[section];
      if (ampacity !== undefined && ampacity >= requiredAmpacity) return section;
    }

    const maxSection = sortedSections[sortedSections.length - 1]!;
    const maxAmpacity = tableData.table[maxSection]!;
    throw new Error(
      `Corrente corrigida necessária (${requiredAmpacity.toFixed(2)} A) excede a capacidade máxima da tabela ${method} (${maxAmpacity} A em ${maxSection} mm²).`,
    );
  }

  static calculateVoltageDropForSection(
    current: number,
    distance: number,
    voltage: number,
    pf: number,
    phase: "monofasico" | "trifasico",
    section: number,
    arrangement: VoltageDropArrangement,
  ): { percent: number; volts: number; resistance: number; reactance: number } {
    const impedance = getCableImpedance(phase, arrangement, section);
    if (!impedance) {
      throw new Error(`Não há dados R/X disponíveis para ${section} mm² no arranjo selecionado.`);
    }

    const sinPhi = Math.sqrt(Math.max(0, 1 - pf * pf));
    const lengthKm = distance / 1000;
    const phaseFactor = phase === "trifasico" ? Math.sqrt(3) : 2;
    const volts = phaseFactor * (impedance.rca * pf + impedance.xl * sinPhi) * current * lengthKm;
    const percent = (volts / voltage) * 100;

    return {
      percent,
      volts,
      resistance: impedance.rca,
      reactance: impedance.xl,
    };
  }

  static getSectionByVoltageDrop(
    current: number,
    distance: number,
    voltage: number,
    maxDropPercent: number,
    pf: number = 0.85,
    phase: "monofasico" | "trifasico" = "trifasico",
    arrangement: VoltageDropArrangement = "adjacent",
  ): {
    requiredSectionTheoretical: number;
    preliminaryCommercialSection: number;
    selectedSection: number;
    actualDrop: number;
    resistance: number;
    reactance: number;
  } {
    const sectionFactor = phase === "trifasico" ? Math.sqrt(3) : 2;

    // 1) Estimativa da seção transversal pelo modelo resistivo:
    // trifásico: S = 100√3·ρ·L·I·cosφ / (ΔV%·V)
    // monofásico: S = 200·ρ·L·I·cosφ / (ΔV%·V)
    const requiredSectionTheoretical =
      (100 * sectionFactor * this.RHO_COPPER_70 * distance * current * pf) /
      (maxDropPercent * voltage);

    const preliminaryCommercialSection = STANDARD_CABLE_SECTIONS.find(
      (section) => section >= requiredSectionTheoretical,
    );

    if (!preliminaryCommercialSection) {
      throw new Error(
        `A seção teórica por queda de tensão (${requiredSectionTheoretical.toFixed(2)} mm²) excede 500 mm².`,
      );
    }

    // 2) Verificação da queda real da seção comercial usando Rca + XL.
    // Se não atender, sobe para a próxima seção comercial disponível.
    const startIndex = STANDARD_CABLE_SECTIONS.indexOf(preliminaryCommercialSection);
    let lastSupportedSection = 0;

    for (const section of STANDARD_CABLE_SECTIONS.slice(startIndex)) {
      const impedance = getCableImpedance(phase, arrangement, section);
      if (!impedance) continue;
      lastSupportedSection = section;

      const result = this.calculateVoltageDropForSection(
        current,
        distance,
        voltage,
        pf,
        phase,
        section,
        arrangement,
      );

      if (result.percent <= maxDropPercent) {
        return {
          requiredSectionTheoretical,
          preliminaryCommercialSection,
          selectedSection: section,
          actualDrop: result.percent,
          resistance: result.resistance,
          reactance: result.reactance,
        };
      }
    }

    throw new Error(
      `A queda de tensão excede ${maxDropPercent}% mesmo após verificar as seções comerciais disponíveis no arranjo ${arrangement} (até ${lastSupportedSection || "nenhuma"} mm²).`,
    );
  }

  static performFullCalculation(inputs: CalculationInputs): CalculationResults {
    this.validateInputs(inputs);

    const pf = inputs.powerFactor ?? this.COS_PHI_DEFAULT;
    const eff = inputs.efficiency ?? this.EFFICIENCY_DEFAULT;
    const fs = inputs.serviceFactor ?? 1.0;
    const method = this.normalizeInstallationMethod(inputs.installationMethod!, inputs.phase);
    this.validateMethodForPhase(method, inputs.phase);

    let In: number;
    if (inputs.dataSource === "catalog" && inputs.motorCatalogData) {
      In = inputs.motorCatalogData.nominalCurrent;
      if (!Number.isFinite(In) || In <= 0)
        throw new Error("Corrente nominal do motor de catálogo inválida.");
    } else {
      In = this.calculateNominalCurrent(
        inputs.power,
        inputs.powerUnit,
        inputs.voltage,
        inputs.phase,
        pf,
        eff,
      );
    }

    const Ib = In * fs;

    const ambientTemperature = inputs.ambientTemperature ?? (method === "D" ? 20 : 30);
    const fTemp =
      inputs.ambientTemperature !== undefined
        ? getTemperatureFactor(method, ambientTemperature)
        : (inputs.ambientTempFactor ?? getTemperatureFactor(method, ambientTemperature));
    const fGroup = getGroupingFactor(
      method,
      inputs.groupingCount ?? 1,
      inputs.buriedCableConfiguration ?? "unipolarDuct",
    );
    const fSoil = getSoilResistivityFactor(method, inputs.soilThermalResistivity ?? 2.5);
    const combinedCorrectionFactor = fTemp * fGroup * fSoil;

    if (!Number.isFinite(combinedCorrectionFactor) || combinedCorrectionFactor <= 0) {
      throw new Error("Fatores de correção inválidos.");
    }

    const correctedCurrentForTable = Ib / combinedCorrectionFactor;

    const mfr = inputs.preferredManufacturer === "any" ? undefined : inputs.preferredManufacturer;

    const numConductors: 2 | 3 = inputs.phase === "trifasico" ? 3 : 2;
    // O cabo é dimensionado pela corrente de projeto corrigida. A proteção
    // principal exige coordenação própria (Icc/Icu/curva/partida) e não é
    // escolhida automaticamente sem esses dados.
    const secAmp = this.getSectionByAmpacity(
      correctedCurrentForTable,
      correctedCurrentForTable,
      method,
      numConductors,
    );

    const voltageDropArrangement =
      inputs.voltageDropArrangement && inputs.voltageDropArrangement !== "auto"
        ? inputs.voltageDropArrangement
        : inferVoltageDropArrangement(inputs.phase, method, inputs.buriedCableConfiguration);

    if (inputs.phase === "monofasico" && voltageDropArrangement === "trefoil") {
      throw new Error("Arranjo em trifólio não é compatível com circuito monofásico.");
    }

    const dropResult = this.getSectionByVoltageDrop(
      Ib,
      inputs.distance,
      inputs.voltage,
      inputs.maxVoltageDrop,
      pf,
      inputs.phase,
      voltageDropArrangement,
    );

    const shortCircuitResult =
      inputs.shortCircuitCurrentKA !== undefined && inputs.shortCircuitDurationSeconds !== undefined
        ? this.getSectionByShortCircuit(
            inputs.shortCircuitCurrentKA,
            inputs.shortCircuitDurationSeconds,
          )
        : null;

    const shortCircuitSection = shortCircuitResult?.selectedSection ?? 0;
    const finalSection = Math.max(
      secAmp,
      dropResult.selectedSection,
      this.SECAO_MINIMA_FORCA,
      shortCircuitSection,
    );
    const finalDrop = this.calculateVoltageDropForSection(
      Ib,
      inputs.distance,
      inputs.voltage,
      pf,
      inputs.phase,
      finalSection,
      voltageDropArrangement,
    );
    let limitingCriterion: CalculationResults["limitingCriterion"];
    if (
      shortCircuitResult &&
      shortCircuitSection > secAmp &&
      shortCircuitSection > dropResult.selectedSection &&
      shortCircuitSection > this.SECAO_MINIMA_FORCA
    ) {
      limitingCriterion = "shortCircuit";
    } else if (
      finalSection === this.SECAO_MINIMA_FORCA &&
      finalSection > secAmp &&
      finalSection > dropResult.selectedSection
    ) {
      limitingCriterion = "minimumSection";
    } else if (secAmp >= dropResult.selectedSection && secAmp >= this.SECAO_MINIMA_FORCA) {
      limitingCriterion = "ampacity";
    } else if (
      dropResult.selectedSection >= secAmp &&
      dropResult.selectedSection >= this.SECAO_MINIMA_FORCA
    ) {
      limitingCriterion = "voltageDrop";
    } else {
      limitingCriterion = shortCircuitResult ? "shortCircuit" : "minimumSection";
    }

    const requirements: TechnicalRequirement[] = [
      {
        category: "disjuntor",
        current: 6,
        quantity: 1,
        label: "Disjuntor do Circuito Auxiliar (Comando)",
      },
    ];

    if (inputs.starterType === "direta") {
      requirements.push({
        category: "contator",
        current: Ib,
        quantity: 1,
        label: "Contator de Potência (K1)",
      });
      requirements.push({
        category: "releTermico",
        current: Ib,
        quantity: 1,
        label: "Relé Térmico",
      });
    } else if (inputs.starterType === "reversao") {
      requirements.push({
        category: "contator",
        current: Ib,
        quantity: 2,
        label: "Contatores de Potência (K1, K2)",
      });
      requirements.push({
        category: "releTermico",
        current: Ib,
        quantity: 1,
        label: "Relé Térmico",
      });
    } else if (inputs.starterType === "estrelaTriangulo") {
      requirements.push({
        category: "contator",
        current: Ib * 0.58,
        quantity: 2,
        label: "Contatores de Potência (K1, K2)",
      });
      requirements.push({
        category: "contator",
        current: Ib * 0.33,
        quantity: 1,
        label: "Contator de Estrela (K3)",
      });
      requirements.push({
        category: "releTermico",
        current: Ib * 0.58,
        quantity: 1,
        label: "Relé Térmico",
      });
      requirements.push({
        category: "releTempo",
        quantity: 1,
        label: "Relé de Tempo Estrela-Triângulo",
      });
    } else if (inputs.starterType === "softStarter") {
      requirements.push({
        category: "softStarter",
        current: Ib,
        quantity: 1,
        label: "Soft-Starter",
      });
    } else if (inputs.starterType === "inversor") {
      requirements.push({
        category: "inverter",
        current: Ib,
        quantity: 1,
        label: "Inversor de Frequência",
      });
    }

    const compatibleProducts: Record<string, Record<string, ManufacturerProduct[]>> = {};
    requirements.forEach((req) => {
      const brandMap: Record<string, ManufacturerProduct[]> = {};
      ["WEG", "Siemens", "Schneider"].forEach((brand) => {
        brandMap[brand] = findCompatibleProducts(
          req.category,
          req.current ?? 0,
          brand,
          inputs.voltage,
        );
      });
      compatibleProducts[req.label] = brandMap;
    });

    const protections: CalculationResults["protections"] = {
      breaker: null,
      motorBreaker: null,
      diazedFuse: null,
      nhFuse: null,
      thermalRelay:
        findCompatibleProduct(
          "releTermico",
          inputs.starterType === "estrelaTriangulo" ? Ib * 0.58 : Ib,
          mfr,
          inputs.voltage,
        ) ?? null,
      contactor: findCompatibleProducts(
        "contator",
        inputs.starterType === "estrelaTriangulo" ? Ib * 0.58 : Ib,
        mfr,
        inputs.voltage,
      ),
      timerRelay:
        inputs.starterType === "estrelaTriangulo"
          ? (findCompatibleProduct("releTempo", 0, mfr, inputs.voltage) ?? null)
          : null,
      softStarter:
        inputs.starterType === "softStarter"
          ? (findCompatibleProduct("softStarter", Ib, mfr, inputs.voltage) ?? null)
          : null,
      inverter:
        inputs.starterType === "inversor"
          ? (findCompatibleProduct("inverter", Ib, mfr, inputs.voltage) ?? null)
          : null,
    };

    return {
      nominalCurrent: In,
      nominalCurrentSource: inputs.dataSource === "catalog" ? "catalog" : "estimated",
      cableByAmpacity: secAmp,
      cableByVoltageDrop: dropResult.selectedSection,
      finalCableSection: finalSection,
      voltageDropCalculated: finalDrop.percent,
      limitingCriterion,
      correctionFactors: {
        temperature: fTemp,
        grouping: fGroup,
        soilResistivity: fSoil,
        combined: combinedCorrectionFactor,
      },
      voltageDropModel: "acImpedanceRX",
      voltageDropRequiredSectionTheoretical: dropResult.requiredSectionTheoretical,
      voltageDropPreliminaryCommercialSection: dropResult.preliminaryCommercialSection,
      voltageDropArrangementUsed: voltageDropArrangement,
      voltageDropResistanceOhmKm: finalDrop.resistance,
      voltageDropReactanceOhmKm: finalDrop.reactance,
      ...(shortCircuitResult
        ? {
            cableByShortCircuit: shortCircuitResult.selectedSection,
            shortCircuitWithstandCurrentKA: shortCircuitResult.withstandCurrentKA,
          }
        : {}),
      shortCircuitCheckPerformed: !!shortCircuitResult,
      technicalLimitations: [
        ...(!shortCircuitResult
          ? [
              "A verificação térmica de curto-circuito do condutor não foi realizada porque Icc e tempo de atuação não foram informados.",
            ]
          : []),
        "A capacidade de interrupção (Icu/Icn) e a coordenação da proteção principal ainda devem ser verificadas no dispositivo selecionado.",
        "A queda de tensão usa Rca + XL de referência para cabo de cobre/PVC 70 °C a 60 Hz; confirme se o arranjo físico informado corresponde à instalação real.",
        "Os valores de Rca/XL usados na queda de tensão não se aplicam a conduto metálico fechado ferromagnético.",
        "Modelos e códigos comerciais de fabricantes devem ser confirmados no catálogo vigente antes da compra.",
      ],
      technicalRequirements: requirements,
      compatibleProducts,
      protections,
      references: [
        {
          id: "ref1",
          standardName: "ABNT NBR 5410",
          version: "2004 (Versão Corrigida: 2008)",
          section: "6.2.7",
          description: "Critério de queda de tensão.",
        },
        {
          id: "ref2",
          standardName: "ABNT NBR 5410",
          version: "2004 (Versão Corrigida: 2008)",
          section: "Tabela 47",
          description: "Seção mínima de 2,5 mm² Cu para circuitos de força em instalações fixas.",
        },
        {
          id: "ref3",
          standardName: "ABNT NBR 5410",
          version: "2004 (Versão Corrigida: 2008)",
          section: "Tabelas 36 e 38",
          description: "Capacidade de condução de corrente.",
        },
        {
          id: "ref4",
          standardName: "ABNT NBR 5410",
          version: "2004 (Versão Corrigida: 2008)",
          section: "Tabelas 40 a 45",
          description: "Fatores de correção de temperatura, solo e agrupamento.",
        },
        {
          id: "ref5",
          standardName: "ABNT NBR 5410",
          version: "2004 (Versão Corrigida: 2008)",
          section: "5.3.5",
          description:
            "Verificação térmica dos condutores sob curto-circuito, quando Icc e tempo são informados.",
        },
        {
          id: "ref6",
          standardName: "Prysmian — Guia de Dimensionamento BT Rev.10",
          version: "Rev.10",
          section: "6.2 e Tabela 31",
          description:
            "Fórmula de queda de tensão em CA e valores Rca/XL do cabo Sintenax Flex (cobre/PVC 70 °C, 60 Hz).",
        },
      ],
    };
  }
}
