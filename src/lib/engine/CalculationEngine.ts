import { 
  CalculationInputs, 
  CalculationResults, 
  ManufacturerProduct, 
  TechnicalReference,
  TechnicalRequirement
} from '../../types';
import { findCompatibleProduct, findCompatibleProducts } from '../catalog';

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
    'A1': 1.00,
    'A2': 1.00,
    'B1': 1.00,
    'B2': 1.00,
    'C': 1.00,
    'D': 0.85,
    'E': 0.88,
    'F_G': 0.81
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
    pf: number = 0.85,
    eff: number = 0.90
  ): number {
    let powerKW = power;
    if (unit === 'cv') powerKW = power * 0.7355;
    if (unit === 'hp') powerKW = power * 0.7457;

    let In: number;
    if (phase === 'trifasico') {
      // In = (P(kW) * 1000) / (sqrt(3) * V * cosphi * rendimento)
      In = (powerKW * 1000) / (Math.sqrt(3) * voltage * pf * eff);
    } else {
      // Monofásico
      // In = (P(kW) * 1000) / (V * cosphi * rendimento)
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
      { mm: 1.5, amp: 15.5 },
      { mm: 2.5, amp: 21 },
      { mm: 4, amp: 28 },
      { mm: 6, amp: 36 },
      { mm: 10, amp: 50 },
      { mm: 16, amp: 68 },
      { mm: 25, amp: 89 },
      { mm: 35, amp: 110 },
      { mm: 50, amp: 134 },
      { mm: 70, amp: 171 },
      { mm: 95, amp: 207 },
      { mm: 120, amp: 239 },
      { mm: 150, amp: 275 },
      { mm: 185, amp: 314 },
      { mm: 240, amp: 371 }
    ];

    const result = cabos.find(c => c.amp >= current);
    return result ? result.mm : 240;
  }

  /**
   * Critério 2: Queda de Tensão
   * Calcula a seção transversal mínima necessária baseada no limite de queda de tensão admissível.
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
    const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
    
    // NBR 5410 - Cálculo de dimensionamento por queda de tensão:
    // S = (100 * k * rho * L * In * cosphi) / (deltaV% * V)
    const requiredSection = (100 * k * CalculationEngine.RHO_COPPER * distance * current * pf) / (maxDropPercent * voltage);
    
    // Encontrar a bitola comercial imediatamente superior
    let selectedSection: number = standardSections[standardSections.length - 1]!;
    for (const s of standardSections) {
      if (s >= requiredSection) {
        selectedSection = s;
        break;
      }
    }

    // Calcular a queda REAL resultante para validação (deltaV_real <= deltaV_admissível)
    const actualDropPercent = (k * CalculationEngine.RHO_COPPER * distance * current * pf * 100) / (selectedSection * voltage);

    return { requiredSection, selectedSection, actualDrop: actualDropPercent };
  }

  static performFullCalculation(inputs: CalculationInputs): CalculationResults {
    const pf = inputs.powerFactor || this.COS_PHI_DEFAULT;
    const eff = inputs.efficiency || this.EFFICIENCY_DEFAULT;
    const fs: number = (inputs.serviceFactor !== undefined && inputs.serviceFactor !== null) ? inputs.serviceFactor : 1.0;

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
    const groupingTypeKey = inputs.groupingType || 'B1';
    const typeFactor = CalculationEngine.GROUPING_TYPES[groupingTypeKey] || 1.0;
    const countFactor = CalculationEngine.GROUPING_COUNT_FACTORS[inputs.groupingCount?.toString() || '1'] || 1.0;
    const fGroup = typeFactor * countFactor;
    const fTemp = inputs.ambientTempFactor || 1.0;
    
    // Corrente de projeto corrigida (Ib) para dimensionamento de cabos
    // Ib = (In * 1.25 * FS) / (f1 * f2)
    // Nota: O fator 1.25 é uma recomendação conservadora da NBR 5410 para motores
    const correctedCurrent = (In * 1.25 * fs) / (fGroup * fTemp);
    
    // NBR 5410: Para dimensionamento de condutores em circuitos de motores, 
    // a ampacidade deve ser suficiente para Ib.
    const secAmp = this.getSectionByAmpacity(correctedCurrent);
    const dropResult = this.getSectionByVoltageDrop(In, inputs.distance, inputs.voltage, inputs.maxVoltageDrop, pf, inputs.phase);
    
    // Garantir que a queda calculada seja um número válido
    const voltageDropCalculated = isNaN(dropResult.actualDrop) ? 0 : dropResult.actualDrop;
    
    // O dimensionamento final DEVE ser a maior bitola entre ampacidade, queda de tensão e mínima normativa
    const finalSection = Math.max(secAmp, dropResult.selectedSection, this.SECAO_MINIMA_FORCA);
    
    const limitingCriterion = dropResult.selectedSection > secAmp ? 'voltageDrop' : 'ampacity';

    const mfr = inputs.preferredManufacturer === 'any' ? undefined : inputs.preferredManufacturer;
    
    // 1. Determinar Requisitos Técnicos
    const requirements: TechnicalRequirement[] = [];
    
    // Proteção Principal (Circuito de Força)
    requirements.push({ category: 'disjuntor', current: In * 1.25 * fs, quantity: 1, label: 'Disjuntor do Circuito Principal (Força)' });
    
    // Proteção do Circuito Auxiliar (Comando)
    requirements.push({ category: 'disjuntor', current: 6, quantity: 1, label: 'Disjuntor do Circuito Auxiliar (Comando)' });

    // Fusíveis
    requirements.push({ category: 'fusivel', current: In * 1.5, quantity: 3, label: 'Fusíveis do Circuito Principal (Força)' });
    requirements.push({ category: 'fusivel', current: 4, quantity: 2, label: 'Fusíveis do Circuito Auxiliar (Comando)' });

    // Disjuntor Motor
    requirements.push({ category: 'disjuntorMotor', current: In * fs, quantity: 1, label: 'Disjuntor Motor' });

    // Comando e Partida
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
      requirements.push({ category: 'contator', current: In * fs, quantity: 1, label: 'Contator de Bypass', isOptional: true });
    } else if (inputs.starterType === 'inversor') {
      requirements.push({ category: 'inverter', current: In * fs, quantity: 1, label: 'Inversor de Frequência' });
    }

    // Requisitos técnicos baseados estritamente no dimensionamento
    // Materiais auxiliares não entram nesta etapa (requisito #7)

    // 2. Buscar Produtos Compatíveis por Fabricante (Independente)
    const manufacturers = ['WEG', 'Siemens', 'Schneider'];
    const compatibleProducts: Record<string, Record<string, ManufacturerProduct[]>> = {};

    requirements.forEach(req => {
      const brandMap: Record<string, ManufacturerProduct[]> = {};
      manufacturers.forEach(brand => {
        const found = findCompatibleProducts(req.category, req.current || 0, brand);
        brandMap[brand] = found;
      });
      compatibleProducts[req.label] = brandMap;
    });

    // Manter legibilidade para o frontend existente (compatibilidade retrógrada parcial)
    const breaker = findCompatibleProduct('disjuntor', In * 1.25 * fs, mfr) || null;
    const motorBreaker = findCompatibleProduct('disjuntorMotor', In * fs, mfr) || null;
    const diazedFuse = findCompatibleProduct('fusivel', In * 1.5, mfr) || null;
    const nhFuse = findCompatibleProduct('fusivel', In * 1.5, mfr) || null;
    
    let softStarter: ManufacturerProduct | null = null;
    let inverter: ManufacturerProduct | null = null;
    if (inputs.starterType === 'softStarter') {
      softStarter = findCompatibleProduct('softStarter', In * fs, mfr) || null;
    } else if (inputs.starterType === 'inversor') {
      inverter = findCompatibleProduct('inverter', In * fs, mfr) || null;
    }
    
    let contactors: ManufacturerProduct[] = [];
    if (inputs.starterType === 'direta') {
      const c = findCompatibleProduct('contator', In * fs, mfr);
      if (c) contactors.push(c);
    } else if (inputs.starterType === 'reversao') {
      const c = findCompatibleProduct('contator', In * fs, mfr);
      if (c) contactors.push(c, { ...c, id: c.id + '-2', description: c.description + ' (K2)' });
    } else if (inputs.starterType === 'estrelaTriangulo') {
      const c = findCompatibleProduct('contator', In * fs * 0.58, mfr);
      if (c) {
        contactors.push(
          { ...c, id: c.id + '-K1', description: c.description + ' (K1)' },
          { ...c, id: c.id + '-K2', description: c.description + ' (K2)' },
          { ...c, id: c.id + '-K3', description: c.description + ' (K3)' }
        );
      }
    } else {
      const c = findCompatibleProduct('contator', In * fs, mfr);
      if (c) contactors.push(c);
    }

    const thermalRelay = findCompatibleProduct('releTermico', In * fs, mfr) || null;

    let timerRelay: ManufacturerProduct | null = null;
    if (inputs.starterType === 'estrelaTriangulo') {
      timerRelay = findCompatibleProduct('releTempo', 0, mfr) || null;
    }

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
        description: `Fatores de correção aplicados: Método de Instalação ${groupingTypeKey}, Agrupamento (${fGroup.toFixed(2)}) e Temperatura (${fTemp.toFixed(2)}).`
      }
    ];

    return {
      nominalCurrent: In,
      cableByAmpacity: secAmp,
      cableByVoltageDrop: dropResult.selectedSection,
      finalCableSection: finalSection,
      voltageDropCalculated: voltageDropCalculated,
      limitingCriterion,
      technicalRequirements: requirements,
      compatibleProducts,
      protections: {
        breaker,
        motorBreaker,
        diazedFuse,
        nhFuse,
        contactor: contactors.length > 0 ? contactors : null,
        thermalRelay,
        timerRelay,
        softStarter,
        inverter
      },
      references: refs
    };
  }
}