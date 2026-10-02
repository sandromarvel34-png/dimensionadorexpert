import { describe, test, expect } from "vitest";
import { CalculationEngine } from "../../../src/lib/engine/CalculationEngine";
import { CalculationInputs } from "../../../src/types";

describe("Regression: Motors Module Baseline", () => {
  const baselineScenario: CalculationInputs = {
    dataSource: "manual",
    power: 75,
    powerUnit: "cv",
    voltage: 220,
    phase: "trifasico",
    distance: 50,
    starterType: "direta",
    maxVoltageDrop: 2,
    quantity: 1,
    installationMethod: "B1",
    groupingCount: 1,
    ambientTempFactor: 1.0,
    powerFactor: 0.85,
    serviceFactor: 1.1,
    efficiency: 0.9,
    preferredManufacturer: "WEG",
  };

  test("75cv scenario (Validation Point)", () => {
    const results = CalculationEngine.performFullCalculation(baselineScenario);

    // In ≈189,23 A; Ib ≈208,15 A. Proteção de referência: 250 A.
    // B1/3: 120 mm² conduz 239 A; 150 mm² conduz 275 A.
    // A seção de 120 mm² não atende à corrente nominal desta proteção.
    expect(results.nominalCurrent).toBeCloseTo(189.23, 1);
    expect(results.principalBreakerCurrent).toBe(250);
    expect(results.protections.breaker?.nominalCurrent).toBe(250);
    expect(results.cableCurrentCapacity).toBe(275);
    expect(results.finalCableSection).toBe(150);
    expect(results.limitingCriterion).toBe("ampacity");
  });

  test("Voltage Drop Scaling (Long Distance)", () => {
    const longDist = { ...baselineScenario, distance: 100 };
    const results = CalculationEngine.performFullCalculation(longDist);
    expect(results.cableByVoltageDrop).toBeGreaterThan(results.cableByAmpacity);
    expect(results.limitingCriterion).toBe("voltageDrop");
    expect(results.voltageDropCalculated).toBeLessThanOrEqual(2);
  });

  test("bloqueia circuito cuja queda de tensão não atende nem em 500 mm²", () => {
    const extremeDistance = { ...baselineScenario, distance: 300 };
    expect(() => CalculationEngine.performFullCalculation(extremeDistance)).toThrow(
      /queda de tensão excede 2%/i,
    );
  });
});
