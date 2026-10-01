import { describe, expect, test } from "vitest";
import { CalculationEngine } from "../engine/CalculationEngine";
import { buildRequirementItems, replaceRequirementItems } from "./materials";

const results = CalculationEngine.performFullCalculation({
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
});

describe("Materiais da proposta", () => {
  test("requisito sem produto permanece visível e identificado", () => {
    const noMatches = { ...results, compatibleProducts: {} };
    const rows = buildRequirementItems(noMatches, "WEG");
    expect(rows).toHaveLength(results.technicalRequirements.length);
    expect(rows.every((row) => row.desc.includes("sem produto compatível"))).toBe(true);
  });
  test("troca de fabricante preserva linhas próprias, cabos, quantidades e preços próprios", () => {
    const custom = { id: "custom", desc: "Serviço específico", qtd: 3, price: 125 };
    const cable = { id: "cable", desc: "Cabo", qtd: 60, price: 7 };
    const generated = buildRequirementItems(results, "WEG").map((row) => ({
      ...row,
      qtd: 4,
      price: 99,
    }));
    const changed = replaceRequirementItems(
      [custom, cable, ...generated],
      results,
      "WEG",
      "Siemens",
    );
    expect(changed.slice(0, 2)).toEqual([custom, cable]);
    expect(
      changed
        .slice(2)
        .every((row) => row.qtd === 4 && row.price === "" && row.desc.includes("Siemens")),
    ).toBe(true);
  });
  test("troca não recria itens removidos nem modifica itens antigos sem identificação confiável", () => {
    const legacy = { id: "random-id", desc: "Contator personalizado", qtd: 1, price: 200 };
    expect(replaceRequirementItems([legacy], results, "WEG", "Siemens")).toEqual([legacy]);
    expect(replaceRequirementItems([], results, "WEG", "Siemens")).toEqual([]);
  });
});
