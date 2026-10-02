import { expect, test, vi } from "vitest";
import { CalculationEngine } from "./CalculationEngine";
import { findCompatibleProducts } from "../catalog";
import { ORIGINAL_WEG_MOTORS } from "../catalog/original-motors";
import { buildRequirementItems } from "../proposal/materials";
import type { CalculationInputs } from "@/types";

const viewMock = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock("@/lib/store", () => ({ useAppStore: () => viewMock.state }));

const inputs: CalculationInputs = {
  dataSource: "manual",
  power: 5,
  powerUnit: "cv",
  voltage: 220,
  phase: "trifasico",
  distance: 5,
  starterType: "direta",
  maxVoltageDrop: 4,
  quantity: 1,
  installationMethod: "B1",
  powerFactor: 0.85,
  efficiency: 0.9,
  preferredManufacturer: "WEG",
};

test("reproduz o caso da imagem: 5 cv, 220 V, 12,6 A com proteção principal, MPW e RW", () => {
  const result = CalculationEngine.performFullCalculation(inputs);
  expect(result.nominalCurrent).toBeCloseTo(12.6155, 3);
  expect(result.protections.breaker?.model).toBe("MDWH-D16-3");
  expect(result.protections.breaker?.poles).toBe(3);
  expect(result.protections.motorBreaker?.model).toBe("MPW18-3-U016");
  expect(result.protections.thermalRelay?.model).toBe("RW27-1D3-U015");
  expect(result.protections.thermalRelay?.commercialCode).toBe("10452384");
  const rows = buildRequirementItems(result, "WEG");
  expect(rows.some((r) => r.desc.includes("MDWH-D16-3"))).toBe(true);
  expect(rows.some((r) => r.desc.includes("RW27-1D3-U015"))).toBe(true);
  expect(rows.some((r) => r.desc.includes("Disjuntor Motor"))).toBe(false);
});

test.each(["direta", "reversao", "estrelaTriangulo", "softStarter", "inversor"] as const)(
  "%s mantém proteção de força tripolar sem reutilizar o disjuntor auxiliar monopolar",
  (starterType) => {
    const result = CalculationEngine.performFullCalculation({ ...inputs, starterType });
    const main = result.technicalRequirements.find((r) => r.label.includes("Principal"))!;
    expect(main.poles).toBe(3);
    const products = result.compatibleProducts[main.label]!["WEG"]!;
    expect(products.length).toBeGreaterThan(0);
    expect(
      products.every(
        (p) =>
          p.poles === 3 &&
          p.nominalCurrent! >= result.nominalCurrent &&
          p.nominalCurrent! <= result.cableCurrentCapacity!,
      ),
    ).toBe(true);
    if (["softStarter", "inversor"].includes(starterType)) {
      expect(result.protections.thermalRelay).toBeNull();
      expect(result.protections.motorBreaker).toBeNull();
    }
  },
);

test("proteção de força monofásica usa dois polos", () => {
  const result = CalculationEngine.performFullCalculation({ ...inputs, phase: "monofasico" });
  expect(result.protections.breaker?.poles).toBe(2);
  expect(result.protections.motorBreaker).toBeNull();
});

test("capacidade de interrupção é conferida na tensão real quando Icc é informada", () => {
  const at400 = CalculationEngine.performFullCalculation({
    ...inputs,
    voltage: 400,
    shortCircuitCurrentKA: 10,
    shortCircuitDurationSeconds: 0.01,
  });
  expect(at400.protections.breaker?.model).toMatch(/^MDWH/);
  const at440 = CalculationEngine.performFullCalculation({
    ...inputs,
    voltage: 440,
    shortCircuitCurrentKA: 10,
    shortCircuitDurationSeconds: 0.01,
  });
  expect(at440.protections.breaker).toBeNull();
  expect(at440.compatibleProducts["Disjuntor do Circuito Principal (Força)"]!["WEG"]).toEqual([]);
});

test("ajuste do relé usa corrente nominal; fator de serviço não eleva seu ajuste automaticamente", () => {
  const result = CalculationEngine.performFullCalculation({ ...inputs, serviceFactor: 1.15 });
  expect(result.technicalRequirements.find((r) => r.category === "releTermico")?.current).toBe(
    result.nominalCurrent,
  );
  const star = CalculationEngine.performFullCalculation({
    ...inputs,
    starterType: "estrelaTriangulo",
  });
  expect(star.technicalRequirements.find((r) => r.category === "releTermico")?.current).toBeCloseTo(
    star.nominalCurrent / Math.sqrt(3),
    10,
  );
});

test.each([
  0.28, 0.4, 0.43, 0.63, 0.8, 1.2, 1.8, 2.8, 4, 5.6, 6.3, 7, 8, 10, 12.6, 15, 17, 22, 23, 32, 40,
  50, 57, 63, 70, 80, 97, 112, 150, 215, 310, 420, 600, 840,
])("relé WEG cobre a corrente %s A com faixa oficial e código exato", (current) => {
  const product = findCompatibleProducts("releTermico", current, "WEG")[0]!;
  expect(product).toBeDefined();
  expect(product.verificationStatus).toBe("verified-exact");
  expect(product.adjustmentRange!.min).toBeLessThanOrEqual(current);
  expect(product.adjustmentRange!.max).toBeGreaterThanOrEqual(current);
  expect(product.commercialCode).toMatch(/^\d{8}$/);
});

test("limites reais do MPW são respeitados, sem inventar disjuntor-motor acima de 100 A", () => {
  for (const current of [
    0.1, 0.16, 0.25, 0.4, 0.63, 1, 1.6, 2.5, 4, 6.3, 10, 16, 18, 20, 25, 32, 35, 40, 50, 65, 80, 90,
    100,
  ]) {
    expect(findCompatibleProducts("disjuntorMotor", current, "WEG", 380).length).toBeGreaterThan(0);
  }
  expect(findCompatibleProducts("disjuntorMotor", 100.01, "WEG", 380)).toEqual([]);
  expect(findCompatibleProducts("disjuntorMotor", 10, "WEG", 760)).toEqual([]);
});

test.each(ORIGINAL_WEG_MOTORS)(
  "proteções e cabo coerentes no motor $model_code, $voltage V",
  (motor) => {
    for (const starterType of ["direta", "reversao", "estrelaTriangulo"] as const) {
      const result = CalculationEngine.performFullCalculation({
        ...inputs,
        dataSource: "catalog",
        power: motor.power_cv,
        voltage: motor.voltage,
        starterType,
        powerFactor: motor.power_factor,
        efficiency: motor.efficiency,
        motorCatalogData: {
          id: motor.id,
          manufacturer: "WEG",
          line: motor.line,
          speedType: motor.speed_type,
          poles: motor.poles,
          model: motor.model_code!,
          nominalCurrent: motor.nominal_current,
          powerFactor: motor.power_factor,
          efficiency: motor.efficiency,
          power: motor.power_cv,
          powerUnit: "cv",
          voltage: motor.voltage,
        },
      });
      expect(result.protections.breaker).not.toBeNull();
      expect(result.protections.thermalRelay).not.toBeNull();
      expect(result.protections.breaker!.poles).toBe(3);
      expect(result.protections.breaker!.nominalCurrent!).toBeGreaterThanOrEqual(
        result.nominalCurrent,
      );
      expect(result.protections.breaker!.nominalCurrent!).toBeLessThanOrEqual(
        result.cableCurrentCapacity!,
      );
      expect(Number.isFinite(result.voltageDropCalculated)).toBe(true);
      expect(result.voltageDropCalculated).toBeLessThanOrEqual(inputs.maxVoltageDrop);
    }
  },
);

test("agrupamento e temperatura reduzem Iz e a pré-seleção mantém Ib ≤ In ≤ Iz", () => {
  const result = CalculationEngine.performFullCalculation({
    ...inputs,
    power: 12,
    ambientTemperature: 40,
    groupingCount: 5,
  });
  expect(result.correctionFactors!.combined).toBeLessThan(1);
  expect(result.principalBreakerCurrent!).toBeGreaterThanOrEqual(result.nominalCurrent);
  expect(result.protections.breaker!.nominalCurrent!).toBeLessThanOrEqual(
    result.cableCurrentCapacity!,
  );
  expect(result.finalCableSection).toBeGreaterThan(2.5);
});

test("a tela renderiza a proteção principal, o disjuntor-motor e o relé WEG do caso real", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { ResultsView } = await import("@/components/ResultsView");
  viewMock.state = {
    currentInputs: inputs,
    currentResults: CalculationEngine.performFullCalculation(inputs),
    setView: vi.fn(),
    startNewProposal: vi.fn(),
  };
  const html = renderToStaticMarkup(createElement(ResultsView));
  expect(html).toContain("Disjuntor do Circuito Principal (Força)");
  expect(html).toContain("MDWH-D16-3");
  expect(html).toContain("MPW18-3-U016");
  expect(html).toContain("RW27-1D3-U015");
  expect(html).toContain("10452384");
});
