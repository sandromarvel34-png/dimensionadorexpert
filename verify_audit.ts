import { CalculationEngine } from './src/lib/engine/CalculationEngine';

const testCase = {
  power: 30,
  powerUnit: 'cv',
  voltage: 380,
  phase: 'trifasico',
  distance: 100,
  maxVoltageDrop: 2,
  powerFactor: 0.85,
  efficiency: 0.9,
  serviceFactor: 1.15,
  starterType: 'direta',
  preferredManufacturer: 'WEG',
  groupingType: 'B1',
  groupingCount: 1,
  ambientTempFactor: 1.0
};

const results = CalculationEngine.performFullCalculation(testCase as any);
console.log('--- AUDIT TEST RESULTS ---');
console.log('Nominal Current (In):', results.nominalCurrent.toFixed(2), 'A');
console.log('Cable by Ampacity:', results.cableByAmpacity, 'mm²');
console.log('Cable by Voltage Drop:', results.cableByVoltageDrop, 'mm²');
console.log('Final Cable Section:', results.finalCableSection, 'mm²');
console.log('Voltage Drop Calculated:', results.voltageDropCalculated.toFixed(2), '%');
console.log('Limiting Criterion:', results.limitingCriterion);
console.log('-------------------------');
