import { CalculationEngine } from './CalculationEngine';

const testScenarios: any[] = [
  {
    name: 'Standard 75cv Motor (NBR 5410 Check)',
    dataSource: 'manual',
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
    efficiency: 0.90,
    quantity: 1
  },
  {
    name: 'Method A1 Test (Potential Breakdown)',
    dataSource: 'manual',
    power: 10,
    powerUnit: 'cv',
    voltage: 220,
    phase: 'trifasico',
    distance: 20,
    starterType: 'direta',
    maxVoltageDrop: 2,
    installationMethod: 'A1',
    groupingCount: 1,
    ambientTempFactor: 1.0,
    powerFactor: 0.85,
    serviceFactor: 1.0,
    efficiency: 0.90,
    quantity: 1
  }
];

console.log('--- STARTING AUDIT TESTS ---');
testScenarios.forEach(scenario => {
  console.log(`Running: ${scenario.name}`);
  try {
    const results = CalculationEngine.performFullCalculation(scenario);
    console.log(`  Success! Final Cable: ${results.finalCableSection}mm²`);
  } catch (error: any) {
    console.error(`  FAILED: ${error.message}`);
  }
});
console.log('--- AUDIT TESTS COMPLETED ---');
