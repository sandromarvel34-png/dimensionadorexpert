import { 
  CalculationInputs, 
  CalculationResults, 
  ManufacturerProduct, 
  TechnicalReference 
} from '../../types';
import { findCompatibleProduct } from '../catalog';

export class CalculationEngine {
  // Constantes físicas (Referência: NBR 5410)
  private static readonly RHO_COPPER = 0.0178; // ohm.mm²/m a 20°C
  private static readonly DEFAULT_COS_PHI = 0.85;

  /**
   * Calcula a corrente nominal (In) do motor
   * Baseado em fórmulas clássicas de máquinas elétricas e fatores de rendimento/FP médios
   */
  static calculateNominalCurrent(power: number, unit: string, voltage: number, phase: string): number {
    let powerInWatts = power;
    if (unit === 'cv') powerInWatts = power * 735.5;
    if (unit === 'hp') powerInWatts = power * 745.7;
    if (unit === 'kW') powerInWatts = power * 1000;

    if (phase === 'trifasico') {
      // P = V * I * sqrt(3) * cosPhi * eta
      // Assumindo eta * cosPhi médio de 0.8 para estimativa se não fornecido
      return powerInWatts / (voltage * Math.sqrt(3) * 0.8);
    } else {
      return powerInWatts / (voltage * 0.8);
    }
  }

  /**
   * Critério 1: Capacidade de Corrente (Ampacidade)
   * Baseado na NBR 5410 - Tabela 36 (Método B1 - Cobre - PVC)
   */
  static getSectionByAmpacity(current: number): number {
    const tableB1 = [
      { section: 1.5, amp: 17.5 },
      { section: 2.5, amp: 24 },
      { section: 4, amp: 32 },
      { section: 6, amp: 41 },
      { section: 10, amp: 57 },
      { section: 16, amp: 76 },
      { section: 25, amp: 101 },
      { section: 35, amp: 125 },
      { section: 50, amp: 151 },
      { section: 70, amp: 192 },
      { section: 95, amp: 232 },
      { section: 120, amp: 269 },
    ];

    const result = tableB1.find(t => t.amp >= current);
    return result ? result.section : 120; // fallback para maior seção
  }

  /**
   * Critério 2: Queda de Tensão
   * Fórmula: S = (L * I * K) / (dV * V)
   */
  static getSectionByVoltageDrop(
    current: number, 
    distance: number, 
    voltage: number, 
    maxDropPercent: number, 
    phase: string
  ): { section: number; actualDrop: number } {
    const k = phase === 'trifasico' ? Math.sqrt(3) : 2;
    const maxDropVolts = (maxDropPercent / 100) * voltage;
    
    // S = (rho * L * I * k * cosPhi) / dV
    const s = (this.RHO_COPPER * distance * current * k * this.DEFAULT_COS_PHI) / maxDropVolts;
    
    const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];
    const pickedSection = standardSections.find(sec => sec >= s) || 120;
    
    const actualDropVolts = (this.RHO_COPPER * distance * current * k * this.DEFAULT_COS_PHI) / pickedSection;
    const actualDropPercent = (actualDropVolts / voltage) * 100;

    return { section: pickedSection, actualDrop: actualDropPercent };
  }

  static performFullCalculation(inputs: CalculationInputs): CalculationResults {
    const In = this.calculateNominalCurrent(inputs.power, inputs.powerUnit, inputs.voltage, inputs.phase);
    const secAmp = this.getSectionByAmpacity(In * 1.25); // 25% extra para motores
    const dropResult = this.getSectionByVoltageDrop(In, inputs.distance, inputs.voltage, inputs.maxVoltageDrop, inputs.phase);
    
    const finalSection = Math.max(secAmp, dropResult.section, inputs.phase === 'trifasico' ? 2.5 : 1.5);
    const limitingCriterion = dropResult.section > secAmp ? 'voltageDrop' : 'ampacity';

    // Dimensionamento de componentes baseado na corrente
    const breaker = findCompatibleProduct('disjuntor', In * 1.25, 'WEG') || null;
    const contactor = findCompatibleProduct('contator', In, 'WEG') || null;
    const thermalRelay = findCompatibleProduct('releTermico', In, 'WEG') || null;

    // Mock de referências técnicas
    const refs: TechnicalReference[] = [
      {
        id: 'ref1',
        standardName: 'ABNT NBR 5410',
        version: '2004 (Errata 2008)',
        section: '6.2.5',
        description: 'Dimensionamento de condutores pela queda de tensão admissível.'
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