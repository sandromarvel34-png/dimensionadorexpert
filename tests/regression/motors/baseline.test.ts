import { describe, test, expect } from 'vitest';
import { CalculationEngine } from '../../../src/lib/engine/CalculationEngine';
import { CalculationInputs } from '../../../src/types';

describe('Regression: Motors Module Baseline', () => {
  const baselineScenario: CalculationInputs = {
    dataSource: 'manual',
    power: 75,
    powerUnit: 'cv',
    voltage: 220,
    phase: 'trifasico',
    distance: 50,
    starterType: 'direta',
    maxVoltageDrop: 2,
    quantity: 1,
    installationMethod: 'B1',
    groupingCount: 1,
    ambientTempFactor: 1.0,
    powerFactor: 0.85,
    serviceFactor: 1.10,
    efficiency: 0.90,
    preferredManufacturer: 'WEG'
  };

  test('75cv scenario (Validation Point)', () => {
    // Re-calculating expected nominal current for 75cv
    // Power (kW) = 75 * 0.7355 = 55.1625 kW
    // In = (55.1625 * 1000) / (sqrt(3) * 220 * 0.85 * 0.90) = 55162.5 / (1.732 * 220 * 0.85 * 0.90)
    // In = 55162.5 / 291.4 = 189.23 A (Approx)
    
    const results = CalculationEngine.performFullCalculation(baselineScenario);
    
    expect(results.nominalCurrent).toBeCloseTo(189.23, 1);
    expect(results.finalCableSection).toBe(150);
    expect(results.limitingCriterion).toBe('ampacity');
  });

  test('Voltage Drop Scaling (Long Distance)', () => {
    const longDist = { ...baselineScenario, distance: 300 };
    const results = CalculationEngine.performFullCalculation(longDist);
    
    expect(results.cableByVoltageDrop).toBeGreaterThan(results.cableByAmpacity);
    expect(results.limitingCriterion).toBe('voltageDrop');
    expect(results.finalCableSection).toBeGreaterThanOrEqual(300);
  });

  test('Phase Coordination (1-phase vs 3-phase)', () => {
    const trifasico = CalculationEngine.performFullCalculation(baselineScenario);
    const monofasico = CalculationEngine.performFullCalculation({ ...baselineScenario, phase: 'monofasico' });
    
    expect(monofasico.nominalCurrent).toBeGreaterThan(trifasico.nominalCurrent);
    expect(monofasico.finalCableSection).toBeGreaterThanOrEqual(trifasico.finalCableSection);
  });
});
