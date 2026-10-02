import type { CalculationInputs, CalculationResults } from "@/types";
export const technicalNumber = (value: number | undefined, digits = 2): string =>
  value === undefined || !Number.isFinite(value)
    ? "Não registrado"
    : value.toLocaleString("pt-BR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
export const starterName = (starter: CalculationInputs["starterType"]): string =>
  ({
    direta: "Partida direta",
    reversao: "Partida com reversão",
    estrelaTriangulo: "Partida estrela-triângulo",
    softStarter: "Partida por soft-starter",
    inversor: "Acionamento por inversor de frequência",
  })[starter];
export function serviceTechnicalRows(i: CalculationInputs, r: CalculationResults): string[][] {
  const motor = i.motorCatalogData;
  const rows = [
    [
      "Motor / origem dos dados",
      i.dataSource === "catalog" && motor
        ? `${motor.manufacturer} ${motor.model} | Linha ${motor.line}`
        : "Motor com dados informados manualmente",
    ],
    [
      "Potência / quantidade",
      `${technicalNumber(i.power)} ${i.powerUnit} | ${i.quantity} motor por circuito`,
    ],
    [
      "Alimentação",
      `${technicalNumber(i.voltage, 0)} V | ${i.phase === "trifasico" ? "Trifásica" : "Monofásica"}`,
    ],
    ["Chave de partida / acionamento", starterName(i.starterType)],
    [
      "Corrente nominal (In)",
      `${technicalNumber(r.nominalCurrent)} A | ${r.nominalCurrentSource === "plate" ? "Dado registrado no cálculo" : i.dataSource === "catalog" ? "Catálogo do motor" : "Calculada pela potência"}`,
    ],
    [
      "Fator de potência / rendimento / FS",
      `${technicalNumber(i.powerFactor ?? 0.85)} / ${technicalNumber(i.efficiency ?? 0.9)} / ${technicalNumber(i.serviceFactor ?? 1)}`,
    ],
    ["Corrente de projeto (Ib)", `${technicalNumber(r.nominalCurrent * (i.serviceFactor ?? 1))} A`],
    [
      "Comprimento / método de instalação",
      `${technicalNumber(i.distance)} m | ${i.installationMethod || "Não registrado"}`,
    ],
    [
      "Condutores de fase",
      `Cobre / PVC 70 °C | ${technicalNumber(r.finalCableSection, 1)} mm² | ${i.phase === "trifasico" ? 3 : 2} condutores carregados`,
    ],
    [
      "Disjuntor principal / capacidade do cabo",
      `${technicalNumber(r.principalBreakerCurrent)} A / ${technicalNumber(r.cableCurrentCapacity)} A`,
    ],
    [
      "Queda de tensão / limite",
      `${technicalNumber(r.voltageDropCalculated)}% / ${technicalNumber(i.maxVoltageDrop)}%`,
    ],
  ];
  if (motor && i.dataSource === "catalog") {
    rows.splice(2, 0, [
      "Polos / rotação / carcaça",
      `${motor.poles} | ${motor.rpm ? `${motor.rpm} rpm` : "Rotação não informada"} | ${motor.frame || "Carcaça não informada"}`,
    ]);
    if (motor.catalogReference) rows.push(["Referência do motor", motor.catalogReference]);
  }
  return rows;
}
export interface MemorySection {
  title: string;
  lines: string[];
}
export function buildCalculationMemory(
  i: CalculationInputs,
  r: CalculationResults,
): MemorySection[] {
  const n = technicalNumber;
  const pf = i.powerFactor ?? 0.85,
    eff = i.efficiency ?? 0.9,
    fs = i.serviceFactor ?? 1;
  const watts = i.power * (i.powerUnit === "cv" ? 735.5 : i.powerUnit === "hp" ? 745.7 : 1000);
  const ib = r.nominalCurrent * fs,
    factors = r.correctionFactors;
  const f = factors?.combined ?? 1,
    inBreak = r.principalBreakerCurrent;
  const phase = i.phase === "trifasico" ? "sqrt(3)" : "2";
  const arrangement = {
    adjacent: "condutores justapostos",
    multipolar: "cabo multipolar",
    spaced2D: "condutores no mesmo plano, espaçados",
    spaced13cm: "condutores no mesmo plano, espaçados",
    spaced20cm: "condutores no mesmo plano, espaçados",
    trefoil: "três condutores em trifólio",
  };
  const k = (r.cableByShortCircuit ?? 0) <= 300 ? 115 : 103;
  const sections: MemorySection[] = [
    {
      title: "1. Dados de entrada e hipóteses",
      lines: [
        `Motor: ${i.dataSource === "catalog" ? "dados de catálogo" : "dados manuais"}; ${n(i.power)} ${i.powerUnit}; ${n(i.voltage, 0)} V; ${i.phase === "trifasico" ? "trifásico" : "monofásico"}. ${starterName(i.starterType)}.`,
        `L = ${n(i.distance)} m; queda admissível = ${n(i.maxVoltageDrop)}%; método ${i.installationMethod}; ${i.phase === "trifasico" ? 3 : 2} condutores carregados. Cobre / PVC 70 °C.`,
        `Temperatura: ${n(i.ambientTemperature ?? (i.installationMethod === "D" ? 20 : 30), 0)} °C; circuitos agrupados: ${i.groupingCount ?? 1}. ${i.installationMethod === "D" ? `Resistividade térmica do solo: ${n(i.soilThermalResistivity ?? 2.5)} K.m/W; configuração ${i.buriedCableConfiguration === "multipolarDuct" ? "cabo multipolar em eletroduto" : "cabos unipolares em eletroduto"}.` : "Fator do solo não aplicável ao método informado."}`,
        `cos(phi) = ${n(pf)}; eta = ${n(eff)}; FS = ${n(fs)}. phi: ângulo do fator de potência; eta: rendimento; FS: fator de serviço.`,
      ],
    },
    {
      title: "2. Corrente nominal e corrente de projeto",
      lines: [
        `Conversão: 1 cv = 735,5 W; 1 hp = 745,7 W; 1 kW = 1.000 W. P = ${n(watts)} W.`,
        i.dataSource === "catalog" || r.nominalCurrentSource === "plate"
          ? `In = ${n(r.nominalCurrent)} A, conforme dado de ${i.dataSource === "catalog" ? "catálogo" : "origem registrado"}. A fórmula por potência é uma referência didática e não substitui a corrente utilizada.`
          : `In = P / (${i.phase === "trifasico" ? "sqrt(3) x " : ""}V x cos(phi) x eta) = ${n(watts)} / (${i.phase === "trifasico" ? "sqrt(3) x " : ""}${n(i.voltage, 0)} x ${n(pf)} x ${n(eff)}) = ${n(r.nominalCurrent)} A.`,
        `Ib = In x FS = ${n(r.nominalCurrent)} x ${n(fs)} = ${n(ib)} A. In: corrente nominal do motor; Ib: corrente de projeto.`,
      ],
    },
    {
      title: "3. Correções e capacidade de condução",
      lines: [
        `F = Ftemp x Fagrup x Fsolo = ${n(factors?.temperature)} x ${n(factors?.grouping)} x ${n(factors?.soilResistivity)} = ${n(factors?.combined, 4)}. Ftemp: temperatura; Fagrup: agrupamento; Fsolo: resistividade térmica do solo.`,
        `Icorr = Ib / F = ${n(ib)} / ${n(f, 4)} = ${n(ib / f)} A.`,
        `Iz,tabela >= max(Ib, Idisj) / F = max(${n(ib)}, ${n(inBreak)}) / ${n(f, 4)} = ${n(Math.max(ib, inBreak ?? ib) / f)} A.`,
        `Primeira seção que atende à ampacidade: Samp = ${n(r.cableByAmpacity, 1)} mm². Idisj: corrente nominal pré-selecionada do disjuntor principal; Iz,tabela: capacidade tabelada.`,
        `Na seção final: Iz,corr = Iz,tabela x F = ${n(r.cableCurrentCapacity === undefined ? undefined : r.cableCurrentCapacity / f)} x ${n(f, 4)} = ${n(r.cableCurrentCapacity)} A.`,
      ],
    },
    {
      title: "4. Queda de tensão e seção transversal",
      lines: [
        `Disposição usada no modelo R + X: ${r.voltageDropArrangementUsed ? arrangement[r.voltageDropArrangementUsed] : "não registrada"}.`,
        `Estimativa resistiva: Sdv = (100 x ${phase} x rho x L x Ib x cos(phi)) / (dv% x V). rho = 0,0213 ohm.mm²/m (cobre a 70 °C); L em metros.`,
        `Sdv = (100 x ${phase} x 0,0213 x ${n(i.distance)} x ${n(ib)} x ${n(pf)}) / (${n(i.maxVoltageDrop)} x ${n(i.voltage, 0)}) = ${n(r.voltageDropRequiredSectionTheoretical)} mm².`,
        `Primeira seção comercial da estimativa: ${n(r.voltageDropPreliminaryCommercialSection, 1)} mm². Seção aprovada após verificação R + X: ${n(r.cableByVoltageDrop, 1)} mm².`,
        `Verificação da seção final: dv = ${phase} x (R x cos(phi) + XL x sen(phi)) x Ib x Lkm. R e XL em ohm/km; Lkm = L / 1.000; sen(phi) = sqrt(1 - cos²(phi)).`,
        `R = ${n(r.voltageDropResistanceOhmKm, 4)} ohm/km; XL = ${n(r.voltageDropReactanceOhmKm, 4)} ohm/km; sen(phi) = ${n(Math.sqrt(1 - pf * pf), 4)}; Lkm = ${n(i.distance / 1000, 4)} km.`,
        `dv = ${phase} x (${n(r.voltageDropResistanceOhmKm, 4)} x ${n(pf)} + ${n(r.voltageDropReactanceOhmKm, 4)} x ${n(Math.sqrt(1 - pf * pf), 4)}) x ${n(ib)} x ${n(i.distance / 1000, 4)} = ${n((r.voltageDropCalculated * i.voltage) / 100)} V.`,
        `dv% = 100 x dv / V = 100 x ${n((r.voltageDropCalculated * i.voltage) / 100)} / ${n(i.voltage, 0)} = ${n(r.voltageDropCalculated)}%. Limite: ${n(i.maxVoltageDrop)}%. Valores exibidos arredondados; cálculo realizado com precisão integral.`,
      ],
    },
    {
      title: "5. Critério térmico de curto-circuito",
      lines: r.shortCircuitCheckPerformed
        ? [
            `Icc = ${n(i.shortCircuitCurrentKA)} kA; t = ${n(i.shortCircuitDurationSeconds, 3)} s. Icc: corrente de falta presumida; t: tempo de eliminação.`,
            "Scc >= Icc x sqrt(t) / k, com Icc em amperes e Scc em mm². Cobre/PVC: k = 115 até 300 mm²; k = 103 acima de 300 mm².",
            `Com k = ${k}: Scc >= (${n((i.shortCircuitCurrentKA ?? 0) * 1000)} x sqrt(${n(i.shortCircuitDurationSeconds, 3)})) / ${k} = ${n(((i.shortCircuitCurrentKA ?? 0) * 1000 * Math.sqrt(i.shortCircuitDurationSeconds ?? 0)) / k)} mm².`,
            `Seção comercial selecionada: Scc = ${n(r.cableByShortCircuit, 1)} mm². Corrente suportável nessa seção: Iadm = k x Scc / sqrt(t) = ${n(r.shortCircuitWithstandCurrentKA)} kA.`,
          ]
        : [
            "Não realizada: Icc e tempo de atuação não foram informados. Nenhum resultado de curto-circuito é presumido.",
            "Fórmula do critério, quando os dados forem informados: Scc >= Icc x sqrt(t) / k.",
          ],
    },
    {
      title: "6. Seção final e verificação da proteção",
      lines: [
        `Sfinal = max(Samp, Sdv, Smin${r.shortCircuitCheckPerformed ? ", Scc" : ""}) = max(${n(r.cableByAmpacity, 1)}, ${n(r.cableByVoltageDrop, 1)}, 2,5${r.shortCircuitCheckPerformed ? `, ${n(r.cableByShortCircuit, 1)}` : ""}) = ${n(r.finalCableSection, 1)} mm².`,
        `Critério limitante: ${{ ampacity: "capacidade de condução", voltageDrop: "queda de tensão", minimumSection: "seção mínima", shortCircuit: "curto-circuito" }[r.limitingCriterion]}.`,
        `Verificação por corrente: Ib <= Idisj <= Iz,corr: ${n(ib)} A <= ${n(inBreak)} A <= ${n(r.cableCurrentCapacity)} A. Esta relação não substitui a verificação de atuação, curva, capacidade de interrupção e coordenação.`,
      ],
    },
    {
      title: "7. Dimensionamento de manobra e sobrecarga",
      lines: [
        ...(i.starterType === "estrelaTriangulo"
          ? [
              `K1 e K2: Iref = 0,58 x Ib = 0,58 x ${n(ib)} = ${n(0.58 * ib)} A (2 contatores).`,
              `K3 (estrela): Iref = 0,33 x Ib = 0,33 x ${n(ib)} = ${n(0.33 * ib)} A.`,
              `Relé térmico dentro do triângulo: Iajuste = In / sqrt(3) = ${n(r.nominalCurrent)} / sqrt(3) = ${n(r.nominalCurrent / Math.sqrt(3))} A. Na linha, selecionar faixa para In = ${n(r.nominalCurrent)} A.`,
            ]
          : i.starterType === "direta" || i.starterType === "reversao"
            ? [
                `Contator(es): Iref >= Ib = ${n(ib)} A; quantidade ${i.starterType === "reversao" ? 2 : 1}.`,
                `Relé térmico: faixa cobrindo In = ${n(r.nominalCurrent)} A. Ajuste não é elevado automaticamente pelo fator de serviço.`,
              ]
            : [
                `${starterName(i.starterType)}: corrente nominal de referência >= Ib = ${n(ib)} A; confirmar alimentação, carga e coordenação no manual do fabricante.`,
              ]),
        ...r.technicalRequirements.map(
          (q) =>
            `${q.label}${q.isOptional ? " (alternativa opcional)" : ""}: ${q.current === undefined ? "" : `${n(q.current)} A; `}${q.poles ? `${q.poles} polos; ` : ""}quantidade ${q.quantity}.${q.note ? ` ${q.note}` : ""}`,
        ),
      ],
    },
    {
      title: "8. Referências e verificações complementares",
      lines: [
        ...r.references.map(
          (ref) =>
            `${ref.standardName} ${ref.version}; ${ref.section}: ${ref.description}${ref.sourceDocument ? ` Fonte: ${ref.sourceDocument}` : ""}`,
        ),
        ...(r.technicalLimitations ?? []),
      ],
    },
  ];
  return sections;
}
