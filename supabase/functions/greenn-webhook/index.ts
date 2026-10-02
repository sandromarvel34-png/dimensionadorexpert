import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.3";
import { createHandler } from "./handler.ts";
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
    },
  }),
);
