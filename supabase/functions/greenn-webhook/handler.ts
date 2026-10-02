import { parseSale, validToken, type SaleEvent } from "./payload.ts";
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
      const event = parseSale(JSON.parse(new TextDecoder().decode(bytes)));
      if (!event) return json({ received: true, ignored: true });
      try {
        await deps.record(event);
      } catch {
        return json({ error: "Falha ao registrar evento" }, 500);
      }
      return json({ received: true });
    } catch {
      return json({ error: "Payload inválido" }, 400);
    }
  };
}
