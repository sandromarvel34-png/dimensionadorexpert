import { describe, expect, test } from "vitest";
import { proposalTotals } from "./validation";
const valid = () => ({
  items: [{ id: "1", desc: "Cabo", qtd: 2, price: 20 }],
  labor: { hours: 1, rate: 100 },
  costs: { travel: 10, others: 5, discount: 5, validity: 30 },
});
describe("Valores comerciais", () => {
  test("calcula o mesmo total utilizado pela persistência e PDF", () =>
    expect(proposalTotals(valid())).toEqual({ materials: 40, labor: 100, total: 150 }));
  test.each([-1, NaN, Infinity])("recusa quantidade %s", (value) => {
    const data = valid();
    data.items[0]!.qtd = value;
    expect(() => proposalTotals(data)).toThrow();
  });
  test("recusa preço não numérico e desconto maior que subtotal", () => {
    const data = valid();
    data.costs.discount = 999;
    expect(() => proposalTotals(data)).toThrow("desconto");
    expect(() =>
      proposalTotals({ ...valid(), items: [{ id: "1", desc: "", qtd: 1, price: "abc" }] }),
    ).toThrow();
  });
  test.each([0, -1, 1.5])("recusa validade %s", (validity) => {
    const data = valid();
    data.costs.validity = validity;
    expect(() => proposalTotals(data)).toThrow("Validade");
  });
  test("permite preços ainda não definidos no rascunho", () =>
    expect(
      proposalTotals({ ...valid(), items: [{ id: "1", desc: "", qtd: 2, price: "" }] }).materials,
    ).toBe(0));
});
