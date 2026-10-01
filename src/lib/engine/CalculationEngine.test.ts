import { describe, expect, test } from "vitest";
import { CalculationEngine } from "./CalculationEngine";
import { AMPACITY_TABLES_NBR5410 } from "./ampacity-tables";
import { getGroupingFactor, getTemperatureFactor } from "./correction-factors";
import { CalculationInputs } from "../../types";

const baseInputs: CalculationInputs = {
  dataSource: "manual",
  power: 10,
  powerUnit: "cv",
  voltage: 380,
  phase: "trifasico",
  distance: 20,
  starterType: "direta",
  maxVoltageDrop: 4,
  quantity: 1,
  installationMethod: "B1",
  groupingCount: 1,
  ambientTemperature: 30,
  powerFactor: 0.85,
  serviceFactor: 1.0,
  efficiency: 0.9,
};

describe("CalculationEngine — regressão técnica", () => {
  test.each([
    { power: 100, distance: 1 },
    { power: 1, distance: 1 },
    { shortCircuitCurrentKA: 10, shortCircuitDurationSeconds: 1 },
  ])("queda exibida e impedância correspondem ao cabo final: %j", (changes) => {
    const inputs = { ...baseInputs, ...changes };
    const result = CalculationEngine.performFullCalculation(inputs);
    const final = CalculationEngine.calculateVoltageDropForSection(
      result.nominalCurrent * (inputs.serviceFactor ?? 1),
      inputs.distance,
      inputs.voltage,
      inputs.powerFactor!,
      inputs.phase,
      result.finalCableSection,
      result.voltageDropArrangementUsed!,
    );
    expect(result.voltageDropCalculated).toBeCloseTo(final.percent, 10);
    expect(result.voltageDropResistanceOhmKm).toBe(final.resistance);
    expect(result.voltageDropReactanceOhmKm).toBe(final.reactance);
  });

  test("recusa resultado sem impedância da seção final, em vez de usar a de outro cabo", () => {
    expect(() =>
      CalculationEngine.performFullCalculation({
        ...baseInputs,
        installationMethod: "B2",
        shortCircuitCurrentKA: 40,
        shortCircuitDurationSeconds: 1,
      }),
    ).toThrow("R/X");
  });

  test("recusa catálogo sem motor e múltiplos motores não suportados", () => {
    expect(() =>
      CalculationEngine.performFullCalculation({ ...baseInputs, dataSource: "catalog" }),
    ).toThrow("catálogo");
    expect(() => CalculationEngine.performFullCalculation({ ...baseInputs, quantity: 2 })).toThrow(
      "um motor",
    );
  });
  test.each(["softStarter", "inversor"] as const)(
    "recusa %s para motor monofásico",
    (starterType) => {
      expect(() =>
        CalculationEngine.performFullCalculation({
          ...baseInputs,
          phase: "monofasico",
          voltage: 220,
          starterType,
        }),
      ).toThrow(/apenas para motores trifásicos/);
    },
  );

  test("usa a corrente da placa em todos os critérios e conserva a origem", () => {
    const inputs = { ...baseInputs, plateNominalCurrent: 80, distance: 80, serviceFactor: 1.15 };
    const result = CalculationEngine.performFullCalculation(inputs);
    const expectedCurrent = 80 * 1.15;
    expect(result.nominalCurrent).toBe(80);
    expect(result.nominalCurrentSource).toBe("plate");
    expect(result.cableByAmpacity).toBe(
      CalculationEngine.getSectionByAmpacity(expectedCurrent, expectedCurrent, "B1", 3),
    );
    const drop = CalculationEngine.calculateVoltageDropForSection(
      expectedCurrent,
      80,
      380,
      0.85,
      "trifasico",
      result.finalCableSection,
      result.voltageDropArrangementUsed!,
    );
    expect(result.voltageDropCalculated).toBeCloseTo(drop.percent, 10);
    expect(result.technicalRequirements.find((r) => r.category === "contator")?.current).toBe(
      expectedCurrent,
    );
    expect(
      CalculationEngine.performFullCalculation({ ...inputs, power: 1 }).finalCableSection,
    ).toBe(result.finalCableSection);
  });

  test.each([0, -1, NaN, Infinity])(
    "recusa corrente da placa inválida %s",
    (plateNominalCurrent) => {
      expect(() =>
        CalculationEngine.performFullCalculation({ ...baseInputs, plateNominalCurrent }),
      ).toThrow(/Corrente nominal da placa/);
    },
  );

  test("catálogo mantém a corrente própria e sua origem", () => {
    const result = CalculationEngine.performFullCalculation({
      ...baseInputs,
      dataSource: "catalog",
      plateNominalCurrent: 80,
      motorCatalogData: {
        id: "motor",
        manufacturer: "WEG",
        line: "W22",
        speedType: "SINGLE",
        poles: "4",
        model: "Motor",
        nominalCurrent: 18.5,
        powerFactor: 0.85,
        efficiency: 0.9,
        power: 10,
        powerUnit: "cv",
        voltage: 380,
      },
    });
    expect(result.nominalCurrent).toBe(18.5);
    expect(result.nominalCurrentSource).toBe("catalog");
  });

  test("mantém estimativa quando a corrente da placa está ausente", () => {
    const result = CalculationEngine.performFullCalculation(baseInputs);
    expect(result.nominalCurrent).toBeCloseTo(14.6075, 3);
    expect(result.nominalCurrentSource).toBe("estimated");
  });

  test.each(["softStarter", "inversor"] as const)(
    "mantém %s no circuito trifásico",
    (starterType) => {
      const result = CalculationEngine.performFullCalculation({
        ...baseInputs,
        power: 1,
        starterType,
      });
      expect(result.nominalCurrent).toBeGreaterThan(0);
      expect(
        result.technicalRequirements.some(
          (r) => r.category === (starterType === "inversor" ? "inverter" : "softStarter"),
        ),
      ).toBe(true);
    },
  );

  test("corrente nominal trifásica usa potência, tensão, FP e rendimento", () => {
    const current = CalculationEngine.calculateNominalCurrent(
      10,
      "cv",
      380,
      "trifasico",
      0.85,
      0.9,
    );
    expect(current).toBeCloseTo(14.6075, 3);
  });

  test("tabela B1/3 condutores reproduz valores de referência", () => {
    const table = AMPACITY_TABLES_NBR5410.find((t) => t.method === "B1" && t.conductors === 3)!;
    expect(table.table[2.5]).toBe(21);
    expect(table.table[25]).toBe(89);
    expect(table.table[240]).toBe(370);
  });

  test("método C/3 não aceita 25 mm² para necessidade de 100 A", () => {
    expect(CalculationEngine.getSectionByAmpacity(100, 100, "C", 3)).toBe(35);
  });

  test("monofásico funciona também em A1 (2 condutores carregados)", () => {
    const result = CalculationEngine.performFullCalculation({
      ...baseInputs,
      phase: "monofasico",
      voltage: 220,
      installationMethod: "A1",
    });
    expect(result.finalCableSection).toBeGreaterThanOrEqual(2.5);
  });

  test("temperatura usa tabela do ar fora do solo e tabela do solo em D", () => {
    expect(getTemperatureFactor("B1", 40)).toBe(0.87);
    expect(getTemperatureFactor("D", 40)).toBe(0.77);
  });

  test("agrupamento enterrado usa fator próprio", () => {
    expect(getGroupingFactor("D", 8, "unipolarDuct")).toBe(0.5);
    expect(getGroupingFactor("D", 8, "multipolarDuct")).toBe(0.54);
    expect(getGroupingFactor("B1", 8)).toBe(0.52);
  });

  test("seção mínima de força é identificada como critério limitante", () => {
    const result = CalculationEngine.performFullCalculation({
      ...baseInputs,
      power: 1,
      distance: 1,
    });
    expect(result.finalCableSection).toBe(2.5);
    expect(result.limitingCriterion).toBe("minimumSection");
  });

  test("separa cálculo da seção teórica da verificação R+X", () => {
    const result = CalculationEngine.getSectionByVoltageDrop(
      100,
      50,
      380,
      2,
      0.85,
      "trifasico",
      "adjacent",
    );

    expect(result.requiredSectionTheoretical).toBeCloseTo(20.63, 2);
    expect(result.preliminaryCommercialSection).toBe(25);
    // 25 mm² é a primeira seção comercial acima da teórica,
    // mas a verificação R+X ainda supera 2%; portanto sobe para 35 mm².
    expect(result.selectedSection).toBe(35);
    expect(result.actualDrop).toBeLessThanOrEqual(2);
  });

  test("calcula queda de tensão CA com Rca + XL", () => {
    const result = CalculationEngine.calculateVoltageDropForSection(
      14.6075,
      30,
      380,
      0.85,
      "trifasico",
      10,
      "adjacent",
    );

    expect(result.resistance).toBe(2.44);
    expect(result.reactance).toBe(0.14);
    expect(result.percent).toBeCloseTo(0.429, 3);
  });

  test("arranjo multipolar usa reatância própria da tabela", () => {
    const result = CalculationEngine.calculateVoltageDropForSection(
      14.6075,
      30,
      380,
      0.85,
      "trifasico",
      10,
      "multipolar",
    );

    expect(result.resistance).toBe(2.44);
    expect(result.reactance).toBe(0.1);
    expect(result.percent).toBeLessThan(0.429);
  });

  test("queda admissível menor não pode reduzir a seção", () => {
    const scenario = { ...baseInputs, distance: 100 };
    const res4 = CalculationEngine.performFullCalculation({ ...scenario, maxVoltageDrop: 4 });
    const res2 = CalculationEngine.performFullCalculation({ ...scenario, maxVoltageDrop: 2 });
    const res1 = CalculationEngine.performFullCalculation({ ...scenario, maxVoltageDrop: 1 });
    expect(res1.cableByVoltageDrop).toBeGreaterThanOrEqual(res2.cableByVoltageDrop);
    expect(res2.cableByVoltageDrop).toBeGreaterThanOrEqual(res4.cableByVoltageDrop);
  });

  test("rejeita parâmetros fisicamente inválidos", () => {
    expect(() => CalculationEngine.performFullCalculation({ ...baseInputs, voltage: 0 })).toThrow();
    expect(() =>
      CalculationEngine.performFullCalculation({ ...baseInputs, powerFactor: 1.2 }),
    ).toThrow();
    expect(() =>
      CalculationEngine.performFullCalculation({ ...baseInputs, efficiency: 1.2 }),
    ).toThrow();
    expect(() =>
      CalculationEngine.performFullCalculation({ ...baseInputs, serviceFactor: -1 }),
    ).toThrow();
    expect(() =>
      CalculationEngine.performFullCalculation({ ...baseInputs, maxVoltageDrop: 5 }),
    ).toThrow();
  });

  test("dimensiona termicamente o cabo quando Icc e tempo são informados", () => {
    const result = CalculationEngine.performFullCalculation({
      ...baseInputs,
      power: 1,
      distance: 1,
      shortCircuitCurrentKA: 10,
      shortCircuitDurationSeconds: 0.1,
    });
    expect(result.shortCircuitCheckPerformed).toBe(true);
    expect(result.cableByShortCircuit).toBe(35);
    expect(result.finalCableSection).toBe(35);
    expect(result.limitingCriterion).toBe("shortCircuit");
  });

  test("exige Icc e tempo de atuação em conjunto", () => {
    expect(() =>
      CalculationEngine.performFullCalculation({
        ...baseInputs,
        shortCircuitCurrentKA: 10,
      }),
    ).toThrow(/Icc e tempo/i);
  });

  test("rejeita estrela-triângulo em motor monofásico", () => {
    expect(() =>
      CalculationEngine.performFullCalculation({
        ...baseInputs,
        phase: "monofasico",
        voltage: 220,
        starterType: "estrelaTriangulo",
      }),
    ).toThrow(/estrela-triângulo/i);
  });

  test("rejeita disposições F/G incompatíveis com número de condutores", () => {
    expect(() =>
      CalculationEngine.performFullCalculation({ ...baseInputs, installationMethod: "F2" }),
    ).toThrow();
    expect(() =>
      CalculationEngine.performFullCalculation({
        ...baseInputs,
        phase: "monofasico",
        voltage: 220,
        installationMethod: "G_HORIZONTAL",
      }),
    ).toThrow();
  });
});
