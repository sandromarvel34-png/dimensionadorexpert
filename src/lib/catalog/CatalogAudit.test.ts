import { describe, expect, test } from "vitest";
import {
  MANUFACTURER_CATALOG,
  findCompatibleProduct,
  findCompatibleProducts,
  getProductsByCategory,
} from "./index";

describe("Auditoria do catálogo de fabricantes", () => {
  test("todo registro possui status de auditoria", () => {
    expect(MANUFACTURER_CATALOG.length).toBeGreaterThan(0);
    expect(
      MANUFACTURER_CATALOG.every((product) =>
        ["verified-exact", "verified-family", "blocked"].includes(product.verificationStatus || ""),
      ),
    ).toBe(true);
  });

  test("produtos bloqueados nunca são retornados nas buscas", () => {
    const categories = [...new Set(MANUFACTURER_CATALOG.map((p) => p.category))];
    for (const category of categories) {
      expect(getProductsByCategory(category).every((p) => p.verificationStatus !== "blocked")).toBe(
        true,
      );
    }
  });

  test("códigos comerciais só são expostos quando o SKU foi verificado como exato", () => {
    for (const product of MANUFACTURER_CATALOG) {
      if (product.verificationStatus !== "verified-exact") {
        expect(product.commercialCode).toBe("");
      } else {
        expect(product.commercialCode.length).toBeGreaterThan(0);
      }
    }
  });

  test("WEG MPW auditado cobre apenas a família oficial até 100 A", () => {
    const mpw = MANUFACTURER_CATALOG.filter(
      (p) =>
        p.manufacturer === "WEG" &&
        p.category === "disjuntorMotor" &&
        p.verificationStatus === "verified-exact",
    );
    expect(mpw.every((p) => (p.nominalCurrent || 0) <= 100)).toBe(true);
    expect(mpw.some((p) => p.model === "MPW18-3-U010" && p.commercialCode === "12429372")).toBe(
      true,
    );
    expect(mpw.some((p) => p.model === "MPW40-3-U032" && p.commercialCode === "12428131")).toBe(
      true,
    );
    expect(mpw.some((p) => p.model === "MPW80-3-U080" && p.commercialCode === "12501063")).toBe(
      true,
    );
    expect(mpw.some((p) => p.model === "MPW100-3-U100" && p.commercialCode === "10047295")).toBe(
      true,
    );
    expect(mpw.some((p) => /MPW150|MPW250|MPW300/.test(p.model))).toBe(false);
  });

  test("SSW05 usa SKUs oficiais e respeita a faixa 220-460 V", () => {
    const at380 = findCompatibleProducts("softStarter", 20, "WEG", 380);
    expect(at380[0]?.model).toBe("SSW050030T2246TPZ");
    expect(at380[0]?.commercialCode).toBe("10413823");
    expect(findCompatibleProducts("softStarter", 20, "WEG", 480)).toHaveLength(0);
  });

  test("CFW300 não oferece os antigos registros fictícios de 24 A e 33 A", () => {
    const drives = getProductsByCategory("inverter").filter((p) => p.manufacturer === "WEG");
    expect(drives.some((p) => /24A|33A/.test(p.model))).toBe(false);
    expect(findCompatibleProduct("inverter", 14, "WEG", 220)?.commercialCode).toBe("13059939");
    expect(findCompatibleProduct("inverter", 14, "WEG", 380)?.commercialCode).toBe("14148367");
  });

  test("temporizadores estrela-triângulo são referências apropriadas e auditadas", () => {
    const weg = findCompatibleProduct("releTempo", 0, "WEG");
    const schneider = findCompatibleProduct("releTempo", 0, "Schneider");
    const siemens = findCompatibleProduct("releTempo", 0, "Siemens");
    expect(weg?.model).toBe("RTW17-G02U030SE05");
    expect(schneider?.model).toBe("RE22R2QEMR");
    expect(siemens?.model).toBe("3RP2576-2NW30");
    expect([weg, schneider, siemens].every((p) => p?.verificationStatus === "verified-exact")).toBe(
      true,
    );
  });

  test("contatores permanecem como família quando tensão de bobina não foi informada", () => {
    const weg = findCompatibleProducts("contator", 20, "WEG", 380);
    const schneider = findCompatibleProducts("contator", 20, "Schneider", 380);
    const siemens = findCompatibleProducts("contator", 20, "Siemens", 380);
    for (const list of [weg, schneider, siemens]) {
      expect(list.length).toBeGreaterThan(0);
      expect(list[0]!.verificationStatus).toBe("verified-family");
      expect(list[0]!.commercialCode).toBe("");
    }
  });

  test("referências Schneider iC60N em phase-out não são sugeridas", () => {
    const schneiderBreakers = findCompatibleProducts("disjuntor", 6, "Schneider", 220);
    expect(schneiderBreakers.some((p) => p.model.startsWith("iC60N"))).toBe(false);
  });

  test("não há IDs duplicados no catálogo auditado", () => {
    const ids = MANUFACTURER_CATALOG.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
