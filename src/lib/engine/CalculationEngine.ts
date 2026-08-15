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
  static calculateNominalCurrent(power: number, unit: string, voltage: number, phase: string = 'trifasico'): number {
    let powerCV = power;
    if (unit === 'hp') powerCV = power * 1.0138;
    if (unit === 'kW') powerCV = power / 0.7355;

    const fatores: Record<number, number> = { 220: 2.639, 380: 1.529, 440: 1.320 };
    const fatorBase = fatores[voltage] ?? 1.529;
    let fator = fatorBase;
    
    // Ajuste simples para monofásico se necessário
    if (phase === 'monofasico') {
      fator = fatorBase * 1.732;
    }

    return powerCV * (fator ?? 1.529);
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
      { mm: 95, amp: 232 }
    ];

    const result = cabos.find(c => c.amp >= current);
    return result ? result.mm : 95;
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
    const In = this.calculateNominalCurrent(inputs.power, inputs.powerUnit, inputs.voltage, inputs.phase);
    
    const secAmp = this.getSectionByAmpacity(In * 1.25);
    const dropResult = this.getSectionByVoltageDrop(In, inputs.distance, inputs.voltage, inputs.maxVoltageDrop);
    
    // O dimensionamento final DEVE ser a maior bitola entre ampacidade e queda de tensão
    // Também respeitando a seção mínima de 2,5mm² para circuitos de motores (força)
    const finalSection = Math.max(secAmp, dropResult.section, this.SECAO_MINIMA_FORCA);
    
    // O critério dominante é aquele que resultou na maior bitola (ou ampacidade se forem iguais)
    const limitingCriterion = dropResult.section > secAmp ? 'voltageDrop' : 'ampacity';

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
      cableByAmpacity: secAmp,
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