import { 
  CalculationInputs, 
  CalculationResults, 
  ManufacturerProduct, 
  TechnicalReference,
  TechnicalRequirement
} from '../../types';
import { findCompatibleProduct, findCompatibleProducts } from '../catalog';
import { AMPACITY_TABLES_NBR5410 } from './ampacity-tables';

export class CalculationEngine {
  // Constantes físicas (Referência: NBR 5410)
  private static readonly RHO_COPPER = 0.0178; // Ω·mm²/m a 20°C
  private static readonly COS_PHI_DEFAULT = 0.85;
  private static readonly EFFICIENCY_DEFAULT = 0.90;
  private static readonly SECAO_MINIMA_FORCA = 2.5;

  static readonly TEMPERATURE_FACTORS: Record<string, number> = {
    '10': 1.22, '15': 1.17, '20': 1.12, '25': 1.06, '30': 1.00,
    '35': 0.94, '40': 0.87, '45': 0.79, '50': 0.71, '55': 0.61, '60': 0.50
  };

  static readonly GROUPING_COUNT_FACTORS: Record<string, number> = {
    '1': 1.00, '2': 0.80, '3': 0.70, '4': 0.65, '5': 0.60,
    '6': 0.57, '7': 0.54, '8': 0.52, '9': 0.50
  };

  /**
   * Calcula a corrente nominal (In) do motor
   */
  static calculateNominalCurrent(
    power: number, 
    unit: string, 
    voltage: number, 
    phase: string = 'trifasico',
    pf: number = 0.85,
    eff: number = 0.90
  ): number {
    let powerKW = power;
    if (unit === 'cv') powerKW = power * 0.7355;
    if (unit === 'hp') powerKW = power * 0.7457;

    if (phase === 'trifasico') {
      return (powerKW * 1000) / (Math.sqrt(3) * voltage * pf * eff);
    } else {
      return (powerKW * 1000) / (voltage * pf * eff);
    }
  }

  /**
   * Critério 1: Capacidade de Corrente (Ampacidade)
   * Retorna a seção comercial que suporta a corrente Ib após correções.
   */
  static getSectionByAmpacity(current: number, breakerCurrent: number, method: string = 'B1', conductors: number = 3): number {
    const tableData = AMPACITY_TABLES_NBR5410.find(t => t.method === method && t.conductors === conductors);
    
    if (!tableData) {
      throw new Error(`Tabela técnica não encontrada para o método ${method} com ${conductors} condutores carregados.`);
    }

    const sortedSections = Object.keys(tableData.table)
      .map(Number)
      .sort((a, b) => a - b);

    for (const section of sortedSections) {
      const ampacity = tableData.table[section];
      // Regra NBR 5410: Ib <= In_disjuntor <= Iz
      if (ampacity !== undefined && ampacity >= current && ampacity >= breakerCurrent) {
        return section;
      }
    }

    const maxSection = sortedSections[sortedSections.length - 1];
    const maxAmpacity = tableData.table[maxSection!];
    throw new Error(`Corrente de projeto (${current.toFixed(2)} A) ou do disjuntor (${breakerCurrent.toFixed(2)} A) excede a capacidade máxima da tabela para o método ${method} (${maxAmpacity} A).`);
  }

  /**
   * Critério 2: Queda de Tensão
   */
  static getSectionByVoltageDrop(
    current: number, 
    distance: number, 
    voltage: number, 
    maxDropPercent: number,
    pf: number = 0.85,
    phase: string = 'trifasico'
  ): { requiredSection: number; selectedSection: number; actualDrop: number } {
    const k = phase === 'trifasico' ? Math.sqrt(3) : 2;
    const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];
    
    // S = (100 * k * rho * L * In * cosphi) / (deltaV% * V)
    const requiredSection = (100 * k * CalculationEngine.RHO_COPPER * distance * current * pf) / (maxDropPercent * voltage);
    
    let selectedSection: number = standardSections[standardSections.length - 1]!;
    let found = false;
    for (const s of standardSections) {
      if (s >= requiredSection) {
        selectedSection = s;
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(`Seção teórica necessária (${requiredSection.toFixed(2)} mm²) excede o limite do catálogo.`);
    }

    const actualDropPercent = (k * CalculationEngine.RHO_COPPER * distance * current * pf * 100) / (selectedSection * voltage);

    return { requiredSection, selectedSection, actualDrop: actualDropPercent };
  }

  static performFullCalculation(inputs: CalculationInputs): CalculationResults {
    const pf = inputs.powerFactor || this.COS_PHI_DEFAULT;
    const eff = inputs.efficiency || this.EFFICIENCY_DEFAULT;
    const fs = inputs.serviceFactor || 1.0;

    // 1. Corrente Nominal (In)
    let In: number;
    if (inputs.dataSource === 'catalog' && inputs.motorCatalogData) {
      In = inputs.motorCatalogData.nominalCurrent;
    } else {
      In = this.calculateNominalCurrent(inputs.power, inputs.powerUnit, inputs.voltage, inputs.phase, pf, eff);
    }
    
    // 2. Fatores de Correção
    const fGroup = CalculationEngine.GROUPING_COUNT_FACTORS[inputs.groupingCount?.toString() || '1'] || 1.0;
    const fTemp = inputs.ambientTempFactor || 1.0;
    
    // 3. Corrente de Projeto (Ib) e Corrente Corrigida para Tabela
    // NBR 5410: Ib = In * FS (conforme solicitado pelo usuário)
    const Ib = In * fs;
    const correctedCurrentForTable = Ib / (fGroup * fTemp);
    
    // 4. Dimensionamento do Disjuntor (Primeiro passo para o critério Ib <= Idisj <= Iz)
    // O disjuntor deve ser >= Ib. Usamos In * fs como referência para encontrar o disjuntor comercial.
    const mfr = inputs.preferredManufacturer === 'any' ? undefined : inputs.preferredManufacturer;
    const compatibleBreaker = findCompatibleProduct('disjuntor', Ib, mfr);
    const breakerNominalCurrent = compatibleBreaker ? parseFloat(compatibleBreaker.model.match(/\d+/)?.[0] || Ib.toString()) : Ib;

    // 5. Dimensionamento Independente do Condutor
    const method = inputs.installationMethod;
    if (!method) {
      throw new Error("Método de instalação não especificado.");
    }
    const numConductors = inputs.phase === 'trifasico' ? 3 : 2;
    
    // NBR 5410: Iz deve ser >= Idisjuntor (que por sua vez é >= Ib)
    const secAmp = this.getSectionByAmpacity(correctedCurrentForTable, breakerNominalCurrent / (fGroup * fTemp), method, numConductors);
    const dropResult = this.getSectionByVoltageDrop(Ib, inputs.distance, inputs.voltage, inputs.maxVoltageDrop, pf, inputs.phase);
    
    // 6. Seleção Final (Maior entre os critérios)
    const finalSection = Math.max(secAmp, dropResult.selectedSection, this.SECAO_MINIMA_FORCA);
    const limitingCriterion = finalSection === secAmp ? 'ampacity' : 'voltageDrop';

    // Proteções
    const requirements: TechnicalRequirement[] = [
      { category: 'disjuntor', current: Ib, quantity: 1, label: 'Disjuntor do Circuito Principal (Força)' },
      { category: 'disjuntor', current: 6, quantity: 1, label: 'Disjuntor do Circuito Auxiliar (Comando)' },
      { category: 'fusivel', current: In * 1.5, quantity: 3, label: 'Fusíveis do Circuito Principal (Força)' },
      { category: 'disjuntorMotor', current: In * fs, quantity: 1, label: 'Disjuntor Motor' }
    ];

    if (inputs.starterType === 'direta') {
      requirements.push({ category: 'contator', current: In * fs, quantity: 1, label: 'Contator de Potência (K1)' });
      requirements.push({ category: 'releTermico', current: In * fs, quantity: 1, label: 'Relé Térmico' });
    } else if (inputs.starterType === 'reversao') {
      requirements.push({ category: 'contator', current: In * fs, quantity: 2, label: 'Contatores de Potência (K1, K2)' });
      requirements.push({ category: 'releTermico', current: In * fs, quantity: 1, label: 'Relé Térmico' });
    } else if (inputs.starterType === 'estrelaTriangulo') {
      requirements.push({ category: 'contator', current: In * fs * 0.58, quantity: 2, label: 'Contatores de Potência (K1, K2)' });
      requirements.push({ category: 'contator', current: In * fs * 0.33, quantity: 1, label: 'Contator de Estrela (K3)' });
      requirements.push({ category: 'releTermico', current: In * fs * 0.58, quantity: 1, label: 'Relé Térmico' });
      requirements.push({ category: 'releTempo', quantity: 1, label: 'Relé de Tempo Estrela-Triângulo' });
    } else if (inputs.starterType === 'softStarter') {
      requirements.push({ category: 'softStarter', current: In * fs, quantity: 1, label: 'Soft-Starter' });
    } else if (inputs.starterType === 'inversor') {
      requirements.push({ category: 'inverter', current: In * fs, quantity: 1, label: 'Inversor de Frequência' });
    }

    const compatibleProducts: Record<string, Record<string, ManufacturerProduct[]>> = {};
    requirements.forEach(req => {
      const brandMap: Record<string, ManufacturerProduct[]> = {};
      ['WEG', 'Siemens', 'Schneider'].forEach(brand => {
        brandMap[brand] = findCompatibleProducts(req.category, req.current || 0, brand);
      });
      compatibleProducts[req.label] = brandMap;
    });

    // Compatibilidade Legada (Mapeamento direto de proteções)
    const protections: CalculationResults['protections'] = {
      breaker: findCompatibleProduct('disjuntor', Ib, mfr) || null,
      motorBreaker: findCompatibleProduct('disjuntorMotor', In * fs, mfr) || null,
      diazedFuse: findCompatibleProduct('fusivel', In * 1.5, mfr) || null,
      nhFuse: findCompatibleProduct('fusivel', In * 1.5, mfr) || null,
      thermalRelay: findCompatibleProduct('releTermico', In * (inputs.starterType === 'estrelaTriangulo' ? 0.58 : 1.0) * fs, mfr) || null,
      contactor: findCompatibleProducts('contator', In * (inputs.starterType === 'estrelaTriangulo' ? 0.58 : 1.0) * fs, mfr),
      timerRelay: inputs.starterType === 'estrelaTriangulo' ? (findCompatibleProduct('releTempo', 0, mfr) || null) : null,
      softStarter: inputs.starterType === 'softStarter' ? (findCompatibleProduct('softStarter', In * fs, mfr) || null) : null,
      inverter: inputs.starterType === 'inversor' ? (findCompatibleProduct('inverter', In * fs, mfr) || null) : null,
    };

    return {
      nominalCurrent: In,
      cableByAmpacity: secAmp,
      cableByVoltageDrop: dropResult.selectedSection,
      finalCableSection: finalSection,
      voltageDropCalculated: dropResult.actualDrop,
      limitingCriterion,
      technicalRequirements: requirements,
      compatibleProducts,
      protections,
      references: [
        { id: 'ref1', standardName: 'ABNT NBR 5410', version: '2004', section: '6.2.5', description: 'Dimensionamento por queda de tensão.' },
        { id: 'ref2', standardName: 'ABNT NBR 5410', version: '2004', section: 'Tabela 6.1', description: 'Seção mínima para circuitos de força: 2,5 mm².' },
        { id: 'ref3', standardName: 'ABNT NBR 5410', version: '2004', section: 'Tabelas 36-39', description: 'Capacidade de condução de corrente (Ampacidade).' }
      ]
    };
  }
}
