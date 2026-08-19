import { CalculationEngine } from './CalculationEngine';
import { findCompatibleProduct } from '../catalog';

export const generateAuditEvidence = () => {
  const scenario = {
    power: 75,
    powerUnit: 'cv',
    voltage: 220,
    phase: 'trifasico',
    distance: 50,
    starterType: 'direta',
    maxVoltageDrop: 2,
    preferredManufacturer: 'any',
    installationMethod: 'B1',
    groupingCount: 1,
    ambientTempFactor: 0.87, // 40°C
    powerFactor: 0.85,
    serviceFactor: 1.10,
    efficiency: 0.90
  };

  const In = CalculationEngine.calculateNominalCurrent(
    scenario.power, scenario.powerUnit, scenario.voltage, scenario.phase, scenario.powerFactor, scenario.efficiency
  );
  const Ib = In * scenario.serviceFactor;
  const fCorr = 0.87 * 1.0; // temp * agrup
  const I_corrigida = Ib / fCorr;

  // Encontra disjuntor
  const breaker = findCompatibleProduct('disjuntor', Ib, 'WEG');
  const In_disj = breaker ? breaker.nominalCurrent : Ib;

  const results = CalculationEngine.performFullCalculation(scenario as any);

  console.log('--- EVIDÊNCIA DE AUDITORIA TÉCNICA ---');
  console.log(`Motor: ${scenario.power}CV / ${scenario.voltage}V`);
  console.log(`In: ${In.toFixed(2)} A`);
  console.log(`Ib (In * FS): ${Ib.toFixed(2)} A`);
  console.log(`Corrente Corrigida (Ib / (ft * fg)): ${I_corrigida.toFixed(2)} A`);
  console.log(`Disjuntor Selecionado: ${breaker?.model} (${In_disj} A)`);
  console.log(`Critério Ib <= In_disj <= Iz: ${Ib.toFixed(2)} <= ${In_disj} <= Iz`);
  console.log(`Bitola Final Calculada: ${results.finalCableSection} mm²`);
  console.log(`Queda de Tensão (rho=0.0213): ${results.voltageDropCalculated.toFixed(2)}%`);
  console.log('--------------------------------------');
};

generateAuditEvidence();
