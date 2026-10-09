import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.3";
import { createHandler } from "./handler.ts";
import { deliverAccess } from "./delivery.ts";
Deno.serve(
  createHandler({
    token: () => Deno.env.get("GREENN_WEBHOOK_TOKEN"),
    record: async (event) => {
      const url = Deno.env.get("SUPABASE_URL"),
        key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!url || !key) throw new Error("Missing server configuration");
      const admin = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await admin.rpc("record_greenn_sale", {
        p_sale_id: event.saleId,
        p_email: event.email,
        p_offer: event.offer,
        p_status: event.status,
        p_paid_at: event.paidAt,
        p_updated_at: event.updatedAt,
      });
      if (error) {
        console.error("greenn-webhook: database processing failed", error.code);
        throw new Error("Database processing failed");
      }
      await deliverAccess(event, {
        claim: async (saleId) => {
          const { data, error } = await admin.rpc("claim_greenn_access_email", {
            p_sale_id: saleId,
          });
          if (error) throw new Error("Email claim failed");
          return data;
        },
        invite: async (email, redirectTo) => {
          const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
          if (error) throw new Error("Invite failed");
        },
        loginLink: async (email, emailRedirectTo) => {
          const { error } = await admin.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false, emailRedirectTo },
          });
          if (error) throw new Error("Login email failed");
        },
        finish: async (saleId, lease, errorCode) => {
          const { error } = await admin.rpc("finish_greenn_access_email", {
            p_sale_id: saleId,
            p_lease_id: lease,
            p_error: errorCode,
          });
          if (error) throw new Error("Email finish failed");
        },
      });
    },
  }),
);
