import { parseSale, validToken, type SaleEvent } from "./payload.ts";
const validationErrors = new Set([
  "Evento inválido",
  "Status divergente",
  "Oferta não reconhecida",
  "Produto e oferta divergentes",
  "E-mail inválido",
  "Venda inválida",
  "Data inválida",
  "Data futura",
]);
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
export function invalidPayloadDiagnostic(error: unknown, body: unknown) {
  const p = object(body),
    sale = object(p.sale);
  const shape = (value: unknown) =>
    typeof value !== "string"
      ? "missing_or_not_string"
      : /^\d{4}-\d{2}-\d{2}T/.test(value)
        ? "iso"
        : /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
          ? "sql_datetime"
          : "other";
  return {
    reason:
      error instanceof Error && validationErrors.has(error.message)
        ? error.message
        : "Malformed JSON or unreadable body",
    saleType: p.type === "sale",
    saleUpdated: p.event === "saleUpdated",
    transaction: sale.type === "TRANSACTION",
    numericSaleId: typeof sale.id === "number",
    numericProductId: typeof object(p.product).id === "number",
    paidDateShape: shape(sale.paid_at),
    updatedDateShape: shape(sale.updated_at),
  };
}
const json = (body: unknown, status = 200) => Response.json(body, { status });
export function createHandler(deps: {
  token: () => string | undefined;
  record: (event: SaleEvent) => Promise<void>;
}) {
  return async (req: Request) => {
    if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);
    const expected = deps.token();
    if (!expected) return json({ error: "Integração indisponível" }, 503);
    if (!(await validToken(req.headers.get("X-Webhook-Token"), expected)))
      return json({ error: "Não autorizado" }, 401);
    // Read a bounded stream: do not trust Content-Length supplied by the sender.
    const reader = req.body?.getReader();
    if (!reader) return json({ error: "Payload inválido" }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    let body: unknown;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 262144) {
          await reader.cancel();
          return json({ error: "Payload excedido" }, 413);
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      body = JSON.parse(new TextDecoder().decode(bytes));
      const event = parseSale(body);
      if (!event) return json({ received: true, ignored: true });
      try {
        await deps.record(event);
      } catch {
        return json({ error: "Falha ao registrar evento" }, 500);
      }
      return json({ received: true });
    } catch (error) {
      console.error("greenn-webhook: invalid payload", invalidPayloadDiagnostic(error, body));
      return json({ error: "Payload inválido" }, 400);
    }
  };
}
