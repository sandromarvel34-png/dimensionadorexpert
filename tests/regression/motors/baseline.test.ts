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
    const results = CalculationEngine.performFullCalculation(baselineScenario);
    
    // In = 207.7A
    // Ib = 207.7 * 1.10 = 228.47A
    // Breaker = 250A (WEG catalog gap fix previously handled this, should find 225A if available or 250A)
    // Conductor for 225/250A in B1 (3 cond) = 150mm2 (275A)
    
    expect(results.nominalCurrent).toBeCloseTo(207.7, 1);
    expect(results.finalCableSection).toBe(150);
    expect(results.limitingCriterion).toBe('ampacity');
  });

  test('Voltage Drop Scaling (Long Distance)', () => {
    const longDist = { ...baselineScenario, distance: 300 };
    const results = CalculationEngine.performFullCalculation(longDist);
    
    // At 300m, voltage drop must dominate.
    expect(results.cableByVoltageDrop).toBeGreaterThan(results.cableByAmpacity);
    expect(results.limitingCriterion).toBe('voltageDrop');
    expect(results.finalCableSection).toBeGreaterThanOrEqual(300); // Expect large section
  });

  test('Phase Coordination (1-phase vs 3-phase)', () => {
    const trifasico = CalculationEngine.performFullCalculation(baselineScenario);
    const monofasico = CalculationEngine.performFullCalculation({ ...baselineScenario, phase: 'monofasico' });
    
    // 1-phase In is higher (no sqrt(3) division)
    expect(monofasico.nominalCurrent).toBeGreaterThan(trifasico.nominalCurrent);
    expect(monofasico.finalCableSection).toBeGreaterThanOrEqual(trifasico.finalCableSection);
  });
});
