import type { CalculationResults, ProposalLineItem, SavedProposal } from "@/types";

type Brand = SavedProposal["selectedManufacturer"];

export function buildRequirementItems(
  results: CalculationResults,
  brand: Brand,
): ProposalLineItem[] {
  return results.technicalRequirements.flatMap((req, index) => {
    if (req.isOptional) return [];
    const product = results.compatibleProducts[req.label]?.[brand]?.[0];
    const reference =
      product?.verificationStatus === "verified-exact"
        ? `${product.model}${product.commercialCode ? ` — Ref. ${product.commercialCode}` : ""}`
        : product
          ? `${product.model} — referência comercial a confirmar`
          : `referência a confirmar${req.current !== undefined ? ` — corrente requerida ${req.current.toFixed(1)} A` : ""}`;
    return [
      {
        id: `requirement:${index}:${req.label}`,
        desc: `${req.label} — ${brand} — ${reference}${product ? "" : " — sem produto compatível no catálogo"}`,
        qtd: req.quantity,
        unit: "un",
        price: "",
      },
    ];
  });
}

export function replaceRequirementItems(
  items: ProposalLineItem[],
  results: CalculationResults,
  oldBrand: Brand,
  newBrand: Brand,
): ProposalLineItem[] {
  const generated = new Map(
    buildRequirementItems(results, newBrand).map((item) => [item.id, item]),
  );
  return items.map((item) => {
    const replacement = generated.get(item.id);
    if (replacement) return { ...item, desc: replacement.desc, price: "" };
    // Older proposals have random component IDs. Keep edited/legacy rows intact:
    // they cannot safely be identified as generated items.
    return item;
  });
}
