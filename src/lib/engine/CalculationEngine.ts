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
  private static readonly COS_PHI_DEFAULT = 0.86;
  private static readonly EFFICIENCY_DEFAULT = 0.85;
  private static readonly SECAO_MINIMA_FORCA = 2.5;

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
   * Baseado na fórmula do arquivo de referência (Trifásico)
   */
  static getSectionByVoltageDrop(
    current: number, 
    distance: number, 
    voltage: number, 
    maxDropPercent: number,
    pf: number = 0.86
  ): { section: number; actualDrop: number } {
    const S = (100 * Math.sqrt(3) * this.RHO_COPPER * distance * current * pf) / (maxDropPercent * voltage);
    
    const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150];
    const pickedSection = standardSections.find(sec => sec >= S) || 95;
    
    const actualDropVolts = (Math.sqrt(3) * this.RHO_COPPER * distance * current * pf) / pickedSection;
    const actualDropPercent = (actualDropVolts / voltage) * 100;

    return { section: pickedSection, actualDrop: actualDropPercent };
  }

  static performFullCalculation(inputs: CalculationInputs): CalculationResults {
    const pf = inputs.powerFactor || this.COS_PHI_DEFAULT;
    const eff = inputs.efficiency || this.EFFICIENCY_DEFAULT;
    const fs = inputs.serviceFactor || 1.0;

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
    const fGroup = inputs.groupingFactor || 1.0;
    const fTemp = inputs.ambientTempFactor || 1.0;
    
    // Corrente de projeto corrigida (Ib) para dimensionamento de cabos
    // Ib = (In * 1.25 * FS) / (f1 * f2)
    const correctedCurrent = (In * 1.25 * fs) / (fGroup * fTemp);

    const secAmp = this.getSectionByAmpacity(correctedCurrent);
    const dropResult = this.getSectionByVoltageDrop(In, inputs.distance, inputs.voltage, inputs.maxVoltageDrop, pf);
    
    // O dimensionamento final DEVE ser a maior bitola entre ampacidade e queda de tensão
    const finalSection = Math.max(secAmp, dropResult.section, this.SECAO_MINIMA_FORCA);
    
    const limitingCriterion = dropResult.section > secAmp ? 'voltageDrop' : 'ampacity';

    const mfr = inputs.preferredManufacturer;
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
        description: `Fatores de correção aplicados: Agrupamento (${fGroup}) e Temperatura (${fTemp}).`
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