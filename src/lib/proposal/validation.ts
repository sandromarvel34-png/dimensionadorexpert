import type { SavedProposal } from "@/types";
type CommercialValues = Pick<SavedProposal, "items" | "labor" | "costs">;
const amount = (value: number | string, label: string) => {
  const n = value === "" ? 0 : Number(value);
  if (!Number.isFinite(n) || n < 0)
    throw new Error(`${label}: informe um valor finito e não negativo.`);
  return n;
};
export function proposalTotals(data: CommercialValues) {
  const materials = data.items.reduce(
    (sum, item) => sum + amount(item.qtd, "Quantidade") * amount(item.price, "Preço"),
    0,
  );
  const labor = amount(data.labor.hours, "Horas") * amount(data.labor.rate, "Valor por hora");
  const subtotal =
    materials +
    labor +
    amount(data.costs.travel, "Deslocamento") +
    amount(data.costs.others, "Outros custos");
  const discount = amount(data.costs.discount, "Desconto");
  const validity = amount(data.costs.validity, "Validade");
  if (!Number.isInteger(validity) || validity < 1)
    throw new Error("Validade deve ser um número inteiro de dias maior que zero.");
  if (!Number.isFinite(subtotal)) throw new Error("Valores excedem o limite permitido.");
  if (discount > subtotal) throw new Error("O desconto não pode superar o subtotal.");
  return { materials, labor, total: subtotal - discount };
}
