export const PRODUCT_ID = 196035;
export const OFFERS: Record<string, number> = { "4Q1tqK": 6, fMqpDz: 12, mkimrj: 6, ndY8mn: 6 };
const PRODUCTS: Record<string, number> = {
  "4Q1tqK": 196035,
  fMqpDz: 196035,
  mkimrj: 196443,
  ndY8mn: 196443,
};
export type SaleEvent = {
  saleId: number;
  email: string;
  offer: string;
  months: number;
  status: "paid" | "refunded" | "chargedback";
  paidAt: string | null;
  updatedAt: string;
};
const object = (x: unknown): Record<string, unknown> =>
  x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, unknown>) : {};
const date = (x: unknown): string | null => {
  if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(x) || !Number.isFinite(Date.parse(x)))
    return null;
  return new Date(x).toISOString();
};
export function parseSale(body: unknown): SaleEvent | null {
  const p = object(body),
    sale = object(p.sale),
    product = object(p.product);
  if (product.id !== PRODUCT_ID && product.id !== 196443) return null;
  if (p.type !== "sale" || p.event !== "saleUpdated" || sale.type !== "TRANSACTION")
    throw new Error("Evento inválido");
  const status = p.currentStatus;
  if (!["paid", "refunded", "chargedback"].includes(String(status))) return null;
  if (sale.status !== status) throw new Error("Status divergente");
  const offer = object(p.offer).hash;
  if (typeof offer !== "string" || !Object.hasOwn(OFFERS, offer))
    throw new Error("Oferta não reconhecida");
  if (PRODUCTS[offer] !== product.id) throw new Error("Produto e oferta divergentes");
  const email = object(p.client).email;
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  )
    throw new Error("E-mail inválido");
  if (!Number.isSafeInteger(sale.id) || Number(sale.id) <= 0) throw new Error("Venda inválida");
  const updatedAt = date(sale.updated_at),
    paidAt = date(sale.paid_at);
  if (!updatedAt || (status === "paid" && !paidAt)) throw new Error("Data inválida");
  if (
    Date.parse(updatedAt) > Date.now() + 300000 ||
    (paidAt && Date.parse(paidAt) > Date.now() + 300000)
  )
    throw new Error("Data futura");
  return {
    saleId: Number(sale.id),
    email: email.trim().toLowerCase(),
    offer,
    months: OFFERS[offer],
    status: status as SaleEvent["status"],
    paidAt,
    updatedAt,
  };
}
export async function validToken(
  received: string | null,
  expected: string | undefined,
): Promise<boolean> {
  if (!expected || !received || received.length > 4096) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all(
    [received, expected].map((s) => crypto.subtle.digest("SHA-256", enc.encode(s))),
  );
  const aa = new Uint8Array(a),
    bb = new Uint8Array(b);
  let difference = 0;
  for (let i = 0; i < aa.length; i++) difference |= aa[i] ^ bb[i];
  return difference === 0;
}
