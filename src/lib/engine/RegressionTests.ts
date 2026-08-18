import { CalculationEngine } from './CalculationEngine';
import { CalculationInputs } from '../../types';

/**
 * Regression Test Suite for Electrical Sizing Engine
 * Ensures independence of criteria and technical consistency.
 */
async function runRegressionTests() {
  console.log('--- STARTING REGRESSION TESTS ---');
  let failures = 0;

  const baseInputs: CalculationInputs = {
    power: 75,
    powerUnit: 'cv',
    voltage: 220,
    phase: 'trifasico',
    distance: 50,
    maxVoltageDrop: 2,
    quantity: 1,
    starterType: 'direta',
    preferredManufacturer: 'WEG',
    powerFactor: 0.85,
    efficiency: 0.90,
    serviceFactor: 1.15,
    ambientTempFactor: 0.87, // 40°C
    groupingType: 'B1',
    groupingCount: 1,
    dataSource: 'manual'
  };

  // TEST A & B: Independence and recalculation of Voltage Drop
  console.log('Testing: Voltage Drop Independence...');
  const res2 = CalculationEngine.performFullCalculation({ ...baseInputs, maxVoltageDrop: 2 });
  const res1 = CalculationEngine.performFullCalculation({ ...baseInputs, maxVoltageDrop: 1 });
  const res4 = CalculationEngine.performFullCalculation({ ...baseInputs, maxVoltageDrop: 4 });

  if (res1.cableByVoltageDrop < res2.cableByVoltageDrop || res2.cableByVoltageDrop < res4.cableByVoltageDrop) {
    console.error('FAIL: Voltage drop limit scaling incorrect.');
    failures++;
  } else {
    console.log('PASS: Voltage drop limit scaling verified.');
  }

  if (res1.cableByAmpacity !== res2.cableByAmpacity) {
    console.error('FAIL: Ampacity section changed with voltage drop limit.');
    failures++;
  } else {
    console.log('PASS: Ampacity section independent of voltage drop limit.');
  }

  // TEST C: Distance
  console.log('Testing: Distance effect on Voltage Drop...');
  const resShort = CalculationEngine.performFullCalculation({ ...baseInputs, distance: 10 });
  const resLong = CalculationEngine.performFullCalculation({ ...baseInputs, distance: 200 });
  
  if (resLong.cableByVoltageDrop <= resShort.cableByVoltageDrop) {
    console.error('FAIL: Distance increase did not increase voltage drop section.');
    failures++;
  } else {
    console.log('PASS: Distance increase reflected in voltage drop section.');
  }

  // TEST D & E: Correction Factors
  console.log('Testing: Correction Factors (Temp & Grouping)...');
  const resBase = CalculationEngine.performFullCalculation(baseInputs);
  const resHot = CalculationEngine.performFullCalculation({ ...baseInputs, ambientTempFactor: 0.71 }); // 50°C
  const resGrouped = CalculationEngine.performFullCalculation({ ...baseInputs, groupingCount: 3 });

  if (resHot.cableByAmpacity <= resBase.cableByAmpacity) {
    console.error('FAIL: Temperature factor (0.5) did not increase ampacity section.');
    failures++;
  }
  if (resGrouped.cableByAmpacity <= resBase.cableByAmpacity) {
    console.error('FAIL: Grouping factor (9 circuits) did not increase ampacity section.');
    failures++;
  }
  console.log('PASS: Correction factors correctly applied to ampacity.');

  // TEST F: Nominal Current Formula
  console.log('Testing: Nominal Current Calculation...');
  // 75 cv = 55.1625 kW
  // In = 55162.5 / (sqrt(3) * 220 * 0.85 * 0.90) = 55162.5 / 291.50 = 189.23 A
  const In = CalculationEngine.calculateNominalCurrent(75, 'cv', 220, 'trifasico', 0.85, 0.90);
  if (Math.abs(In - 189.23) > 0.1) {
    console.error(`FAIL: In calculated ${In}, expected ~189.23`);
    failures++;
  } else {
    console.log('PASS: Nominal current formula verified.');
  }

  // SUMMARY
  if (failures > 0) {
    console.log(`--- TESTS FAILED: ${failures} failures ---`);
    process.exit(1);
  } else {
    console.log('--- ALL TESTS PASSED ---');
  }
}

runRegressionTests().catch(e => {
  console.error(e);
  process.exit(1);
});
