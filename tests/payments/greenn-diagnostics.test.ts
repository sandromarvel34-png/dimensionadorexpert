import { describe, it, expect } from "vitest";
import { invalidPayloadDiagnostic } from "../../supabase/functions/greenn-webhook/handler";
describe("Safe Greenn rejection diagnostics", () => {
  it("identifies validation and date format without exposing buyer data", () => {
    const diagnostic = invalidPayloadDiagnostic(new Error("Data inválida"), {
      type: "sale",
      event: "saleUpdated",
      client: { email: "private@example.com" },
      token: "secret",
      sale: {
        id: 12,
        type: "TRANSACTION",
        paid_at: "2026-10-09 18:38:18",
        updated_at: "2026-10-09T21:38:18Z",
      },
      product: { id: 196443 },
    });
    expect(diagnostic).toMatchObject({
      reason: "Data inválida",
      transaction: true,
      paidDateShape: "sql_datetime",
      updatedDateShape: "iso",
    });
    expect(JSON.stringify(diagnostic)).not.toMatch(/private@example|secret|18:38|21:38/);
  });
  it("redacts arbitrary exceptions and input values", () => {
    const diagnostic = invalidPayloadDiagnostic(new Error("private@example.com secret"), {
      type: "private@example.com",
      sale: { paid_at: "secret" },
    });
    expect(diagnostic.reason).toBe("Malformed JSON or unreadable body");
    expect(JSON.stringify(diagnostic)).not.toMatch(/private@example|secret/);
  });
});
