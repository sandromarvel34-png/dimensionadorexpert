import { describe, it, expect } from "vitest";
import { parseSale, validToken } from "../../supabase/functions/greenn-webhook/payload";
const payload = (offer = "4Q1tqK", status = "paid") => ({
  type: "sale",
  event: "saleUpdated",
  currentStatus: status,
  sale: {
    id: 123,
    type: "TRANSACTION",
    status,
    paid_at: "2026-01-31T12:00:00Z",
    updated_at: "2026-02-01T12:00:00Z",
  },
  product: { id: 196035 },
  client: { email: " Buyer@Example.com " },
  offer: { hash: offer },
});
describe("Greenn webhook validation", () => {
  it.each([
    ["4Q1tqK", 6],
    ["fMqpDz", 12],
  ])("maps offer %s to calendar months", (offer, months) => {
    expect(parseSale(payload(String(offer)))).toMatchObject({
      months,
      email: "buyer@example.com",
      saleId: 123,
    });
  });
  it.each(["refunded", "chargedback"])(
    "accepts terminal status %s without payment date",
    (status) => {
      const p = payload("4Q1tqK", status);
      Object.assign(p.sale, { paid_at: null });
      expect(parseSale(p)?.status).toBe(status);
    },
  );
  it("ignores another product", () =>
    expect(parseSale({ ...payload(), product: { id: 7 } })).toBeNull());
  it.each(["waiting_payment", "refused", "unpaid"])("does not release unpaid status %s", (status) =>
    expect(parseSale(payload("4Q1tqK", status))).toBeNull(),
  );
  it("rejects an unknown offer even if the amount matches", () =>
    expect(() =>
      parseSale({ ...payload("unknown"), sale: { ...payload().sale, amount: 37 } }),
    ).toThrow());
  it("rejects missing offer rather than guessing from price", () =>
    expect(() => parseSale({ ...payload(), offer: null })).toThrow());
  it("rejects a subscription", () =>
    expect(() =>
      parseSale({ ...payload(), sale: { ...payload().sale, type: "SUBSCRIPTION" } }),
    ).toThrow());
  it("rejects a conflicting sale status", () =>
    expect(() =>
      parseSale({ ...payload(), sale: { ...payload().sale, status: "refunded" } }),
    ).toThrow());
  it("rejects missing paid date", () =>
    expect(() =>
      parseSale({ ...payload(), sale: { ...payload().sale, paid_at: null } }),
    ).toThrow());
  it("rejects invalid email", () =>
    expect(() => parseSale({ ...payload(), client: { email: "bad" } })).toThrow());
  it("rejects invalid sale ID", () =>
    expect(() => parseSale({ ...payload(), sale: { ...payload().sale, id: "123" } })).toThrow());
  it("rejects future dates", () =>
    expect(() =>
      parseSale({ ...payload(), sale: { ...payload().sale, updated_at: "2099-01-01T00:00:00Z" } }),
    ).toThrow());
  it("accepts only the exact configured token", async () => {
    expect(await validToken("local-test-secret", "local-test-secret")).toBe(true);
    expect(await validToken("wrong", "local-test-secret")).toBe(false);
    expect(await validToken(null, "local-test-secret")).toBe(false);
    expect(await validToken("anything", undefined)).toBe(false);
  });
});

import { createHandler } from "../../supabase/functions/greenn-webhook/handler";
import { vi } from "vitest";
describe("Greenn HTTP handler", () => {
  const request = (body: unknown, token = "test-only") =>
    new Request("https://example.invalid", {
      method: "POST",
      headers: { "X-Webhook-Token": token },
      body: JSON.stringify(body),
    });
  it("rejects a wrong token without recording anything", async () => {
    const record = vi.fn();
    const handler = createHandler({ token: () => "test-only", record });
    expect((await handler(request(payload(), "wrong"))).status).toBe(401);
    expect(record).not.toHaveBeenCalled();
  });
  it("fails closed if no token has been configured", async () => {
    const handler = createHandler({ token: () => undefined, record: vi.fn() });
    expect((await handler(request(payload()))).status).toBe(503);
  });
  it("does not accept GET", async () => {
    const handler = createHandler({ token: () => "test-only", record: vi.fn() });
    expect((await handler(new Request("https://example.invalid"))).status).toBe(405);
  });
  it.each(["4Q1tqK", "fMqpDz"])("records a valid paid event for %s", async (offer) => {
    const record = vi.fn().mockResolvedValue(undefined);
    const handler = createHandler({ token: () => "test-only", record });
    expect((await handler(request(payload(offer)))).status).toBe(200);
    expect(record).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ offer, status: "paid", email: "buyer@example.com" }),
    );
  });
  it.each(["refunded", "chargedback"])("records reversal %s", async (status) => {
    const record = vi.fn().mockResolvedValue(undefined);
    const handler = createHandler({ token: () => "test-only", record });
    expect((await handler(request(payload("4Q1tqK", status)))).status).toBe(200);
    expect(record).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ status }));
  });
  it("acknowledges irrelevant products without granting access", async () => {
    const record = vi.fn();
    const handler = createHandler({ token: () => "test-only", record });
    expect((await handler(request({ ...payload(), product: { id: 42 } }))).status).toBe(200);
    expect(record).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON", async () => {
    const handler = createHandler({ token: () => "test-only", record: vi.fn() });
    expect(
      (
        await handler(
          new Request("https://example.invalid", {
            method: "POST",
            headers: { "X-Webhook-Token": "test-only" },
            body: "{",
          }),
        )
      ).status,
    ).toBe(400);
  });
  it("rejects unknown offers without recording", async () => {
    const record = vi.fn();
    const handler = createHandler({ token: () => "test-only", record });
    expect((await handler(request(payload("bad")))).status).toBe(400);
    expect(record).not.toHaveBeenCalled();
  });
  it("does not acknowledge a failed DB transaction as successful", async () => {
    const handler = createHandler({
      token: () => "test-only",
      record: async () => {
        throw new Error("DB unavailable");
      },
    });
    expect((await handler(request(payload()))).status).toBe(500);
  });
  it("limits body size even without a Content-Length header", async () => {
    const handler = createHandler({ token: () => "test-only", record: vi.fn() });
    expect((await handler(request("x".repeat(262145)))).status).toBe(413);
  });
});
