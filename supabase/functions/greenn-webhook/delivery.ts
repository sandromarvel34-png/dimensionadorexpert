import type { SaleEvent } from "./payload.ts";

export const APP_URL = "https://dimensione.comandoseletricosexpert.com.br/";
export type EmailClaim = { email: string; confirmed: boolean; leaseId: string };
export async function deliverAccess(
  event: SaleEvent,
  deps: {
    claim: (saleId: number) => Promise<EmailClaim | null>;
    invite: (email: string, redirect: string) => Promise<void>;
    loginLink: (email: string, redirect: string) => Promise<void>;
    finish: (saleId: number, lease: string, error: string | null) => Promise<void>;
  },
) {
  if (event.status !== "paid") return;
  const claim = await deps.claim(event.saleId);
  if (!claim) return;
  try {
    if (claim.confirmed) await deps.loginLink(claim.email, APP_URL);
    else await deps.invite(claim.email, `${APP_URL}?recovery=1`);
  } catch {
    await deps.finish(event.saleId, claim.leaseId, "auth_email_failed");
    throw new Error("Access email failed");
  }
  // Sent means Auth accepted the SMTP request, not proven inbox delivery.
  await deps.finish(event.saleId, claim.leaseId, null);
}
