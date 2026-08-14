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
  private static readonly COS_PHI = 0.86;
  private static readonly SECAO_MINIMA_FORCA = 2.5;

  /**
   * Calcula a corrente nominal (In) do motor
   * Baseado nos fatores do arquivo de referência
   */
  static calculateNominalCurrent(power: number, unit: string, voltage: number): number {
    let powerCV = power;
    if (unit === 'hp') powerCV = power * 1.0138; // 1 HP = 1.0138 CV aprox.
    if (unit === 'kW') powerCV = power / 0.7355;

    // Fatores de referência do arquivo para motor trifásico
    const fatores: Record<number, number> = { 220: 2.639, 380: 1.529, 440: 1.320 };
    const fator = fatores[voltage] || fatores[380];
    
    return powerCV * fator;
  }

  /**
   * Critério 1: Capacidade de Corrente (Ampacidade)
   * Baseado na tabela do arquivo de referência
   */
  static getSectionByAmpacity(current: number): { section: number; amp: number; priceM: number } {
    const cabos = [
      { mm: 1.5, amp: 17.5, priceM: 1.8 },
      { mm: 2.5, amp: 24, priceM: 2.8 },
      { mm: 4, amp: 32, priceM: 4.5 },
      { mm: 6, amp: 41, priceM: 6.8 },
      { mm: 10, amp: 57, priceM: 11.5 },
      { mm: 16, amp: 76, priceM: 18 },
      { mm: 25, amp: 101, priceM: 28 },
      { mm: 35, amp: 125, priceM: 40 },
      { mm: 50, amp: 151, priceM: 58 },
      { mm: 70, amp: 192, priceM: 82 },
      { mm: 95, amp: 232, priceM: 112 }
    ];

    const result = cabos.find(c => c.amp >= current) || cabos[cabos.length - 1];
    return { section: result.mm, amp: result.amp, priceM: result.priceM };
  }

  /**
   * Critério 2: Queda de Tensão
   * Baseado na fórmula do arquivo de referência (Trifásico)
   */
  static getSectionByVoltageDrop(
    current: number, 
    distance: number, 
    voltage: number, 
    maxDropPercent: number
  ): { section: number; actualDrop: number } {
    const S = (100 * Math.sqrt(3) * this.RHO_COPPER * distance * current * this.COS_PHI) / (maxDropPercent * voltage);
    
    const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95];
    const pickedSection = standardSections.find(sec => sec >= S) || 95;
    
    const actualDropVolts = (Math.sqrt(3) * this.RHO_COPPER * distance * current * this.COS_PHI) / pickedSection;
    const actualDropPercent = (actualDropVolts / voltage) * 100;

    return { section: pickedSection, actualDrop: actualDropPercent };
  }

  static performFullCalculation(inputs: CalculationInputs): CalculationResults {
    const In = this.calculateNominalCurrent(inputs.power, inputs.powerUnit, inputs.voltage);
    
    // Ampacidade (In * 1.25 conforme convenção técnica para motores)
    const ampResult = this.getSectionByAmpacity(In * 1.25);
    
    // Queda de tensão
    const dropResult = this.getSectionByVoltageDrop(In, inputs.distance, inputs.voltage, inputs.maxVoltageDrop);
    
    // Maior seção entre os 3 critérios: Ampacidade, Queda de Tensão e Seção Mínima NBR 5410 (2.5mm²)
    const finalSection = Math.max(ampResult.section, dropResult.section, this.SECAO_MINIMA_FORCA);
    const limitingCriterion = dropResult.section > ampResult.section ? 'voltageDrop' : 'ampacity';

    // Dimensionamento de componentes
    const breaker = findCompatibleProduct('disjuntor', In * 1.25, 'WEG') || null;
    const contactor = findCompatibleProduct('contator', In, 'WEG') || null;
    const thermalRelay = findCompatibleProduct('releTermico', In, 'WEG') || null;

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
      }
    ];

    return {
      nominalCurrent: In,
      cableByAmpacity: ampResult.section,
      cableByVoltageDrop: dropResult.section,
      finalCableSection: finalSection,
      voltageDropCalculated: dropResult.actualDrop,
      limitingCriterion,
      protections: {
        breaker,
        contactor: contactor ? [contactor] : null,
        thermalRelay
      },
      references: refs
    };
  }
}