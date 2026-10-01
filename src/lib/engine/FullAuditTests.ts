import type { CalculationInputs } from "@/types";
import { CalculationEngine } from "./CalculationEngine";

interface TestCase {
  name: string;
  inputs: CalculationInputs;
  expectedMinSection: number;
}

const testCases: TestCase[] = [
  {
    name: "Motor 75cv 220V B1 40C (Standard Case)",
    inputs: {
      dataSource: "manual",
      quantity: 1,
      power: 75,
      powerUnit: "cv",
      voltage: 220,
      phase: "trifasico",
      distance: 50,
      powerFactor: 0.85,
      efficiency: 0.9,
      serviceFactor: 1.1,
      maxVoltageDrop: 2,
      installationMethod: "B1",
      groupingCount: 1,
      ambientTempFactor: 0.87,
      starterType: "direta",
    },
    expectedMinSection: 150,
  },
  {
    name: "Motor 10cv 380V B1 (Small Motor)",
    inputs: {
      dataSource: "manual",
      quantity: 1,
      power: 10,
      powerUnit: "cv",
      voltage: 380,
      phase: "trifasico",
      distance: 30,
      powerFactor: 0.85,
      efficiency: 0.88,
      serviceFactor: 1.0,
      maxVoltageDrop: 2,
      installationMethod: "B1",
      groupingCount: 1,
      ambientTempFactor: 1.0,
      starterType: "direta",
    },
    expectedMinSection: 2.5, // Minimum section rule
  },
  {
    name: "High Voltage Drop Scenario (Long Distance)",
    inputs: {
      dataSource: "manual",
      quantity: 1,
      power: 20,
      powerUnit: "cv",
      voltage: 220,
      phase: "trifasico",
      distance: 200,
      powerFactor: 0.85,
      efficiency: 0.89,
      serviceFactor: 1.15,
      maxVoltageDrop: 3,
      installationMethod: "B1",
      groupingCount: 1,
      ambientTempFactor: 1.0,
      starterType: "direta",
    },
    expectedMinSection: 70, // Expected to be limited by voltage drop
  },
  {
    name: "High Grouping Scenario (8 circuits)",
    inputs: {
      dataSource: "manual",
      quantity: 1,
      power: 50,
      powerUnit: "cv",
      voltage: 440,
      phase: "trifasico",
      distance: 50,
      powerFactor: 0.86,
      efficiency: 0.92,
      serviceFactor: 1.0,
      maxVoltageDrop: 2,
      installationMethod: "B1",
      groupingCount: 8,
      ambientTempFactor: 1.0,
      starterType: "direta",
    },
    expectedMinSection: 50, // 134 A × 0,52 = 69,68 A, suficiente para a corrente de projeto deste cenário
  },
];

console.log("--- STARTING FULL AUDIT ---");
let passed = 0;
for (const test of testCases) {
  try {
    const res = CalculationEngine.performFullCalculation(test.inputs);
    const success = res.finalCableSection >= test.expectedMinSection;
    console.log(`[${success ? "PASS" : "FAIL"}] ${test.name}`);
    console.log(`   Result: ${res.finalCableSection}mm² | Criteria: ${res.limitingCriterion}`);
    console.log(
      `   Ib: ${(CalculationEngine.calculateNominalCurrent(test.inputs.power, test.inputs.powerUnit, test.inputs.voltage, test.inputs.phase, test.inputs.powerFactor, test.inputs.efficiency) * (test.inputs.serviceFactor || 1)).toFixed(2)}A`,
    );
    if (success) passed++;
  } catch (e: unknown) {
    console.log(`[ERROR] ${test.name}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

console.log(`--- AUDIT FINISHED: ${passed}/${testCases.length} PASSED ---`);
