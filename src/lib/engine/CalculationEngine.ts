import { 
  CalculationInputs, 
  CalculationResults, 
  ManufacturerProduct, 
  TechnicalReference 
} from '../../types';
import { findCompatibleProduct } from '../catalog';

export class CalculationEngine {
  // Constantes físicas (Referência: NBR 5410)
  private static readonly RHO_COPPER = 0.0178; // Ω·mm²/m a 20°C
  private static readonly COS_PHI_DEFAULT = 0.85;
  private static readonly EFFICIENCY_DEFAULT = 0.90;
  private static readonly SECAO_MINIMA_FORCA = 2.5;

  // Tabelas de Fatores NBR 5410
  static readonly TEMPERATURE_FACTORS: Record<string, number> = {
    '10': 1.22,
    '15': 1.17,
    '20': 1.12,
    '25': 1.06,
    '30': 1.00,
    '35': 0.94,
    '40': 0.87,
    '45': 0.79,
    '50': 0.71,
    '55': 0.61,
    '60': 0.50
  };

  static readonly GROUPING_TYPES: Record<string, number> = {
    'bundle': 1.00,
    'layer_wall': 1.00,
    'layer_floor': 0.85,
    'tray_perforated': 0.88,
    'tray_unperforated': 0.81
  };

  static readonly GROUPING_COUNT_FACTORS: Record<string, number> = {
    '1': 1.00,
    '2': 0.80,
    '3': 0.70,
    '4': 0.65,
    '5': 0.60,
    '6': 0.57,
    '7': 0.54,
    '8': 0.52,
    '9': 0.50
  };

  /**
   * Calcula a corrente nominal (In) do motor
   * Baseado nos fatores do arquivo de referência
   */
  static calculateNominalCurrent(
    power: number, 
    unit: string, 
    voltage: number, 
    phase: string = 'trifasico',
    pf: number = 0.86,
    eff: number = 0.85
  ): number {
    let powerKW = power;
    if (unit === 'cv') powerKW = power * 0.7355;
    if (unit === 'hp') powerKW = power * 0.7457;

    let In: number;
    if (phase === 'trifasico') {
      // In = P(kW) * 1000 / (sqrt(3) * V * cosphi * rendimento)
      In = (powerKW * 1000) / (Math.sqrt(3) * voltage * pf * eff);
    } else {
      // Monofásico
      In = (powerKW * 1000) / (voltage * pf * eff);
    }

    return In;
  }

  /**
   * Critério 1: Capacidade de Corrente (Ampacidade)
   * Baseado na tabela do arquivo de referência
   */
  static getSectionByAmpacity(current: number): number {
    const cabos = [
      { mm: 1.5, amp: 17.5 },
      { mm: 2.5, amp: 24 },
      { mm: 4, amp: 32 },
      { mm: 6, amp: 41 },
      { mm: 10, amp: 57 },
      { mm: 16, amp: 76 },
      { mm: 25, amp: 101 },
      { mm: 35, amp: 125 },
      { mm: 50, amp: 151 },
      { mm: 70, amp: 192 },
      { mm: 95, amp: 232 },
      { mm: 120, amp: 269 },
      { mm: 150, amp: 309 }
    ];

    const result = cabos.find(c => c.amp >= current);
    return result ? result.mm : 95;
  }

  /**
   * Critério 2: Queda de Tensão
   * Baseado na fórmula do arquivo de referência
   */
  static getSectionByVoltageDrop(
    current: number, 
    distance: number, 
    voltage: number, 
    maxDropPercent: number,
    pf: number = 0.85,
    phase: string = 'trifasico'
  ): { section: number; actualDrop: number } {
    const k = phase === 'trifasico' ? Math.sqrt(3) : 2;
    const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150];
    
    // Iteramos pelas bitolas padrão para encontrar a primeira que atenda à queda máxima
    // O critério é encontrar a bitola que resulte em uma queda <= maxDropPercent
    let selectedSection = standardSections[0];
    let actualDrop = 100;

    for (const section of standardSections) {
      const actualDropVolts = (k * this.RHO_COPPER * distance * current * pf) / section;
      const actualDropPercent = (actualDropVolts / voltage) * 100;
      
      if (actualDropPercent <= maxDropPercent) {
        return { section, actualDrop: actualDropPercent };
      }
      
      // Armazenamos a melhor tentativa (última) caso nenhuma atenda (embora 150mm² geralmente atenda)
      selectedSection = section;
      actualDrop = actualDropPercent;
    }

    return { section: selectedSection, actualDrop };
  }

  static performFullCalculation(inputs: CalculationInputs): CalculationResults {
    const pf = inputs.powerFactor || this.COS_PHI_DEFAULT;
    const eff = inputs.efficiency || this.EFFICIENCY_DEFAULT;
    const fs = (inputs.serviceFactor !== undefined && inputs.serviceFactor !== null) ? inputs.serviceFactor : 1.0;

    let In: number;
    
    if (inputs.dataSource === 'catalog' && inputs.motorCatalogData) {
      In = inputs.motorCatalogData.nominalCurrent;
    } else {
      In = this.calculateNominalCurrent(
        inputs.power, 
        inputs.powerUnit, 
        inputs.voltage, 
        inputs.phase,
        pf,
        eff
      );
    }
    
    // Fatores de correção (Default 1.0 se não informados)
    const typeFactor = CalculationEngine.GROUPING_TYPES[inputs.groupingType || ''] || 1.0;
    const countFactor = CalculationEngine.GROUPING_COUNT_FACTORS[inputs.groupingCount?.toString() || '1'] || 1.0;
    const fGroup = typeFactor * countFactor;
    const fTemp = inputs.ambientTempFactor || 1.0;
    
    // Corrente de projeto corrigida (Ib) para dimensionamento de cabos
    // Ib = (In * 1.25 * FS) / (f1 * f2)
    const correctedCurrent = (In * 1.25 * fs) / (fGroup * fTemp);

    const secAmp = this.getSectionByAmpacity(correctedCurrent);
    const dropResult = this.getSectionByVoltageDrop(In, inputs.distance, inputs.voltage, inputs.maxVoltageDrop, pf, inputs.phase);
    
    // O dimensionamento final DEVE ser a maior bitola entre ampacidade e queda de tensão
    const finalSection = Math.max(secAmp, dropResult.section, this.SECAO_MINIMA_FORCA);
    
    const limitingCriterion = dropResult.section > secAmp ? 'voltageDrop' : 'ampacity';

    const mfr = inputs.preferredManufacturer === 'any' ? undefined : inputs.preferredManufacturer;
    // Dimensionamento dos dispositivos:
    // Disjuntor: In * 1.25 (proteção contra sobrecarga/partida)
    // Contator: In (corrente nominal do motor em AC-3)
    // Relé Térmico: In (ajuste na corrente nominal)
    // Dimensionamento dos dispositivos:
    const breaker = findCompatibleProduct('disjuntor', In * 1.25 * fs, mfr) || null;
    
    // Lista de contatores dependendo do tipo de partida
    let contactors: ManufacturerProduct[] = [];
    if (inputs.starterType === 'direta') {
      const c = findCompatibleProduct('contator', In * fs, mfr);
      if (c) contactors.push(c);
    } else if (inputs.starterType === 'reversao') {
      const c = findCompatibleProduct('contator', In * fs, mfr);
      if (c) contactors.push(c, { ...c, id: c.id + '-2', description: c.description + ' (K2)' });
    } else if (inputs.starterType === 'estrelaTriangulo') {
      // Dimensionamento simplificado para estrela-triângulo (In * 0.58)
      const c = findCompatibleProduct('contator', In * fs * 0.58, mfr);
      if (c) {
        contactors.push(
          { ...c, id: c.id + '-K1', description: c.description + ' (K1)' },
          { ...c, id: c.id + '-K2', description: c.description + ' (K2)' },
          { ...c, id: c.id + '-K3', description: c.description + ' (K3)' }
        );
      }
    } else {
      // Soft-starter ou Inversor
      const c = findCompatibleProduct('contator', In * fs, mfr);
      if (c) contactors.push(c);
    }

    const thermalRelay = findCompatibleProduct('releTermico', In * fs, mfr) || null;

    const refs: TechnicalReference[] = [
      {
        id: 'ref1',
        standardName: 'ABNT NBR 5410',
        version: '2004',
        section: '6.2.5',
        description: 'Dimensionamento de condutores pela queda de tensão admissível.'
      },
      {
        id: 'ref2',
        standardName: 'ABNT NBR 5410',
        version: '2004',
        section: 'Tabela 6.1',
        description: 'Seção mínima para circuitos de força: 2,5 mm².'
      },
      {
        id: 'ref3',
        standardName: 'ABNT NBR 5410',
        version: '2004',
        section: '6.2.5.5',
        description: `Fatores de correção aplicados: Agrupamento de Circuitos (${fGroup}) e Temperatura (${fTemp}).`
      }
    ];

    // Componentes adicionais: Relé de tempo para Estrela-Triângulo
    let timerRelay: ManufacturerProduct | null = null;
    if (inputs.starterType === 'estrelaTriangulo') {
      timerRelay = findCompatibleProduct('releTempo', 0, mfr) || null;
    }

    return {
      nominalCurrent: In,
      cableByAmpacity: secAmp,
      cableByVoltageDrop: dropResult.section,
      finalCableSection: finalSection,
      voltageDropCalculated: dropResult.actualDrop,
      limitingCriterion,
      protections: {
        breaker,
        contactor: contactors.length > 0 ? contactors : null,
        thermalRelay,
        timerRelay
      },
      references: refs
    };
  }
}