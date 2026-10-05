import { expect, test, vi } from "vitest";
import { CalculationEngine } from "../engine/CalculationEngine";
import { MANUFACTURERS, refreshManufacturerReferences, explainMissingReference } from "./selection";
import { findCompatibleProducts } from "./index";
import { buildRequirementItems } from "../proposal/materials";
import type { CalculationInputs } from "@/types";

const viewMock = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
vi.mock("@/lib/store", () => ({ useAppStore: () => viewMock.state }));
const inputs: CalculationInputs = {
  dataSource: "manual",
  power: 15,
  powerUnit: "cv",
  voltage: 220,
  phase: "trifasico",
  distance: 50,
  starterType: "direta",
  maxVoltageDrop: 4,
  quantity: 1,
  installationMethod: "B1",
  powerFactor: 0.85,
  efficiency: 0.9,
};

test("caso de 15 cv/220 V/50 m oferece todas as proteções e contatores nas três marcas", async () => {
  const result = CalculationEngine.performFullCalculation(inputs);
  expect(result.nominalCurrent).toBeCloseTo(37.8465, 3);
  expect(result.finalCableSection).toBe(10);
  for (const req of result.technicalRequirements) {
    for (const brand of MANUFACTURERS)
      expect(
        result.compatibleProducts[req.label]?.[brand]?.length,
        `${req.label}/${brand}`,
      ).toBeGreaterThan(0);
  }
  for (const brand of MANUFACTURERS)
    expect(
      buildRequirementItems(result, brand).every(
        (row) => !row.desc.includes("sem produto compatível"),
      ),
    ).toBe(true);
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { ResultsView } = await import("@/components/ResultsView");
  viewMock.state = {
    currentInputs: inputs,
    currentResults: result,
    setView: vi.fn(),
    startNewProposal: vi.fn(),
  };
  const html = renderToStaticMarkup(createElement(ResultsView));
  expect(html).not.toContain("Nenhuma referência");
  expect(html).not.toContain("não cobre esta combinação");
  expect(html).toContain("GV3P40");
  expect(html).toContain("A9F85340");
});

for (const voltage of [220, 380, 440])
  for (const starterType of [
    "direta",
    "reversao",
    "estrelaTriangulo",
    "softStarter",
    "inversor",
  ] as const) {
    test(`matriz de correntes, ${starterType}, ${voltage} V: três marcas e invariantes elétricas`, () => {
      for (const power of [1, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50]) {
        const result = CalculationEngine.performFullCalculation({
          ...inputs,
          power,
          voltage,
          starterType,
          distance: 5,
        });
        for (const req of result.technicalRequirements)
          for (const brand of MANUFACTURERS) {
            const products = result.compatibleProducts[req.label]![brand]!;
            // Motor-breakers have real physical limits. Never disguise an MCCB as an MPCB.
            if (req.isOptional && (req.current ?? 0) > (brand === "Schneider" ? 115 : 100))
              continue;
            expect(products.length, `${power}cv/${req.label}/${brand}`).toBeGreaterThan(0);
            for (const p of products) {
              expect(p.verificationStatus).not.toBe("blocked");
              expect(p.lifecycle).not.toBe("phase-out");
              if (req.poles) expect(p.poles).toBe(req.poles);
              if (
                p.voltageRange &&
                ["disjuntor", "disjuntorMotor", "contator", "softStarter", "inverter"].includes(
                  req.category,
                )
              ) {
                expect(voltage).toBeGreaterThanOrEqual(p.voltageRange.min);
                expect(voltage).toBeLessThanOrEqual(p.voltageRange.max);
              }
              if (p.adjustmentRange) {
                expect(req.current!).toBeGreaterThanOrEqual(p.adjustmentRange.min);
                expect(req.current!).toBeLessThanOrEqual(p.adjustmentRange.max);
              } else if (req.current) expect(p.nominalCurrent!).toBeGreaterThanOrEqual(req.current);
              if (req.label.includes("Principal"))
                expect(p.nominalCurrent!).toBeLessThanOrEqual(result.cableCurrentCapacity! + 1e-9);
            }
          }
      }
    });
  }

test("referências salvas são atualizadas sem alterar resultados numéricos e memória de cálculo", () => {
  const fresh = CalculationEngine.performFullCalculation(inputs);
  const stale = { ...fresh, compatibleProducts: {} };
  const updated = refreshManufacturerReferences(stale, inputs);
  expect(updated.compatibleProducts).toEqual(fresh.compatibleProducts);
  expect(updated.nominalCurrent).toBe(stale.nominalCurrent);
  expect(updated.finalCableSection).toBe(stale.finalCableSection);
  expect(updated.references).toEqual(stale.references);
});

test("limites físicos e de tensão nunca são removidos para forçar sugestões", () => {
  for (const brand of ["WEG", "Siemens"])
    expect(findCompatibleProducts("disjuntorMotor", 101, brand, 380)).toEqual([]);
  const req = {
    category: "disjuntorMotor" as const,
    current: 101,
    quantity: 1,
    label: "Disjuntor Motor",
    isOptional: true,
  };
  expect(explainMissingReference(req, "Siemens", inputs)).toContain(
    "disjuntor do circuito principal e relé de sobrecarga",
  );
  for (const brand of MANUFACTURERS)
    expect(findCompatibleProducts("inverter", 10, brand, 300)).toEqual([]);
  for (const brand of MANUFACTURERS)
    expect(findCompatibleProducts("inverter", 9999, brand, 220)).toEqual([]);
});

test("audita todos os motores e as cinco partidas, com ausência explícita somente fora das faixas verificadas", async () => {
  const { ORIGINAL_WEG_MOTORS } = await import("./original-motors");
  for (const motor of ORIGINAL_WEG_MOTORS)
    for (const starterType of [
      "direta",
      "reversao",
      "estrelaTriangulo",
      "softStarter",
      "inversor",
    ] as const) {
      const result = CalculationEngine.performFullCalculation({
        ...inputs,
        dataSource: "catalog",
        power: motor.power_cv,
        voltage: motor.voltage,
        starterType,
        distance: 5,
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
      for (const req of result.technicalRequirements.filter((r) => !r.isOptional))
        for (const brand of MANUFACTURERS) {
          if (
            req.category === "inverter" &&
            brand === "Siemens" &&
            motor.voltage === 220 &&
            result.nominalCurrent > 192
          ) {
            expect(result.compatibleProducts[req.label]?.[brand]).toEqual([]);
            expect(
              explainMissingReference(req, brand, { ...inputs, voltage: motor.voltage }),
            ).toContain("192 A");
            continue;
          }
          expect(
            result.compatibleProducts[req.label]?.[brand]?.length,
            `${motor.model_code}/${motor.voltage}/${starterType}/${req.label}/${brand}`,
          ).toBeGreaterThan(0);
        }
    }
});

test("a tela mostra o conjunto alternativo das três marcas acima do limite de disjuntor-motor", async () => {
  const highInputs = { ...inputs, power: 50, distance: 5 };
  const result = CalculationEngine.performFullCalculation(highInputs);
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { ResultsView } = await import("@/components/ResultsView");
  viewMock.state = {
    currentInputs: highInputs,
    currentResults: result,
    setView: vi.fn(),
    startNewProposal: vi.fn(),
  };
  const html = renderToStaticMarkup(createElement(ResultsView));
  expect(html.match(/Proteção alternativa: disjuntor de força/g)).toHaveLength(3);
  expect(html).not.toContain("não cobre esta combinação");
});

test("ausência de Icu/Ics auditada não autoriza ignorar Icc conhecida", () => {
  const result = CalculationEngine.performFullCalculation({
    ...inputs,
    shortCircuitCurrentKA: 50,
    shortCircuitDurationSeconds: 0.01,
  });
  for (const brand of MANUFACTURERS)
    for (const p of result.compatibleProducts["Disjuntor do Circuito Principal (Força)"]![brand]!) {
      const capacity =
        p.breakingCapacityByVoltage?.find((e) => inputs.voltage <= e.voltage)?.capacityKA ??
        p.breakingCapacityKA;
      expect(capacity).toBeGreaterThanOrEqual(50);
    }
});

test("proteção principal das três marcas atende Icc 10 kA em 380 V com dados de interrupção auditados", () => {
  const result = CalculationEngine.performFullCalculation({
    ...inputs,
    voltage: 380,
    power: 5,
    distance: 5,
    shortCircuitCurrentKA: 10,
    shortCircuitDurationSeconds: 0.01,
  });
  for (const brand of MANUFACTURERS)
    expect(
      result.compatibleProducts["Disjuntor do Circuito Principal (Força)"]![brand]!.length,
    ).toBeGreaterThan(0);
});
