import { describe, it, expect, vi } from "vitest";
import { APP_URL, deliverAccess } from "../../supabase/functions/greenn-webhook/delivery";
import { parseSale, type SaleEvent } from "../../supabase/functions/greenn-webhook/payload";
const event: SaleEvent = {
  saleId: 321,
  email: "buyer@example.com",
  offer: "mkimrj",
  months: 6,
  status: "paid",
  paidAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};
const setup = (confirmed = false) => ({
  claim: vi.fn().mockResolvedValue({ email: event.email, confirmed, leaseId: "lease" }),
  invite: vi.fn().mockResolvedValue(undefined),
  loginLink: vi.fn().mockResolvedValue(undefined),
  finish: vi.fn().mockResolvedValue(undefined),
});
describe("Purchase access emails", () => {
  it("accepts current checkout only with its product and 6 months", () => {
    const payload = {
      type: "sale",
      event: "saleUpdated",
      currentStatus: "paid",
      sale: {
        id: 321,
        type: "TRANSACTION",
        status: "paid",
        paid_at: event.paidAt,
        updated_at: event.updatedAt,
      },
      client: { email: event.email },
      offer: { hash: "mkimrj" },
      product: { id: 196443 },
    };
    expect(parseSale(payload)).toEqual(event);
    for (const offer of [null, undefined, {}, { hash: null }]) {
      expect(parseSale({ ...payload, offer })).toEqual(event);
      expect(() => parseSale({ ...payload, product: { id: 196035 }, offer })).toThrow();
    }
    expect(() => parseSale({ ...payload, offer: "mkimrj" })).toThrow();
    expect(() => parseSale({ ...payload, offer: { hash: "" } })).toThrow();
    expect(parseSale({ ...payload, offer: { hash: "ndY8mn" } })).toEqual({
      ...event,
      offer: "ndY8mn",
    });
    expect(() =>
      parseSale({ ...payload, product: { id: 196035 }, offer: { hash: "ndY8mn" } }),
    ).toThrow();
    expect(() => parseSale({ ...payload, offer: { hash: "unknown" } })).toThrow();
    expect(() => parseSale({ ...payload, product: { id: 196035 } })).toThrow();
    expect(() => parseSale({ ...payload, offer: { hash: "4Q1tqK" } })).toThrow();
  });
  it("invites new buyers to set password on official domain", async () => {
    const deps = setup();
    await deliverAccess(event, deps);
    expect(deps.invite).toHaveBeenCalledWith(event.email, `${APP_URL}?recovery=1`);
    expect(deps.loginLink).not.toHaveBeenCalled();
    expect(deps.finish).toHaveBeenCalledWith(321, "lease", null);
  });
  it("sends existing buyers a login link without replacing their password", async () => {
    const deps = setup(true);
    await deliverAccess(event, deps);
    expect(deps.loginLink).toHaveBeenCalledWith(event.email, APP_URL);
    expect(deps.invite).not.toHaveBeenCalled();
  });
  it.each(["refunded", "chargedback"] as const)("does not email %s", async (status) => {
    const deps = setup();
    await deliverAccess({ ...event, status }, deps);
    expect(deps.claim).not.toHaveBeenCalled();
  });
  it("does not resend an already sent or revoked sale", async () => {
    const deps = setup();
    deps.claim.mockResolvedValue(null);
    await deliverAccess(event, deps);
    expect(deps.invite).not.toHaveBeenCalled();
    expect(deps.finish).not.toHaveBeenCalled();
  });
  it("releases failed deliveries and propagates failure for webhook retry", async () => {
    const deps = setup();
    deps.invite.mockRejectedValue(new Error("SMTP"));
    await expect(deliverAccess(event, deps)).rejects.toThrow();
    expect(deps.finish).toHaveBeenCalledWith(321, "lease", "auth_email_failed");
  });
  it("does not swallow lease failures", async () => {
    const deps = setup();
    deps.claim.mockRejectedValue(new Error("busy"));
    await expect(deliverAccess(event, deps)).rejects.toThrow();
    expect(deps.invite).not.toHaveBeenCalled();
  });
});
