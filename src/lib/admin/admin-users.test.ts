import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
const callerId = "11111111-1111-4111-8111-111111111111";
function setup(
  access = { role: "admin", status: "active", access_expires_at: null as string | null },
) {
  let handler: (req: Request) => Promise<Response> = async () => new Response("", { status: 500 });
  const calls: { page: number; perPage: number }[] = [];
  const client = {
    auth: {
      getUser: async () => ({ data: { user: { id: callerId } }, error: null }),
      admin: {
        listUsers: async (paging: { page: number; perPage: number }) => {
          calls.push(paging);
          return { data: { users: [] }, error: null };
        },
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({ single: async () => ({ data: access, error: null }) }),
        in: async () => ({ data: [], error: null }),
      }),
      update: () => ({
        eq: () => ({ select: () => ({ single: async () => ({ data: access, error: null }) }) }),
      }),
    }),
  };
  const source = readFileSync("supabase/functions/admin-users/index.ts", "utf8").replace(
    /^import .*;\n/gm,
    "",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  runInNewContext(compiled, {
    Deno: {
      env: { get: () => "test" },
      serve: (fn: typeof handler) => {
        handler = fn;
      },
    },
    createClient: () => client,
    Request,
    Response,
    URL,
    Date,
    Map,
  });
  return { handler, calls };
}
test.each([
  { role: "user", status: "active", access_expires_at: null },
  { role: "admin", status: "suspended", access_expires_at: null },
  { role: "admin", status: "active", access_expires_at: "2000-01-01T00:00:00Z" },
])("bloqueia solicitante sem autorização administrativa %o", async (access) => {
  const { handler } = setup(access);
  expect(
    (
      await handler(
        new Request("https://test/admin-users", { headers: { Authorization: "Bearer token" } }),
      )
    ).status,
  ).toBe(403);
});
test("consulta páginas posteriores e mantém limite de 100 por página", async () => {
  const { handler, calls } = setup();
  const response = await handler(
    new Request("https://test/admin-users?page=11", { headers: { Authorization: "Bearer token" } }),
  );
  expect(response.status).toBe(200);
  expect(calls).toEqual([{ page: 11, perPage: 100 }]);
});
test.each([
  { userId: "bad" },
  { userId: callerId, plan: "" },
  { userId: callerId, accessExpiresAt: "bad" },
  { userId: callerId, accessExpiresAt: "2099-02-31T00:00:00Z" },
  { userId: callerId, accessExpiresAt: "2000-01-01T00:00:00Z" },
  { userId: callerId, status: "suspended" },
  { userId: callerId },
])("recusa alteração inválida %o", async (body) => {
  const { handler } = setup();
  const response = await handler(
    new Request("https://test/admin-users", {
      method: "POST",
      headers: { Authorization: "Bearer token" },
      body: JSON.stringify(body),
    }),
  );
  expect(response.status).toBe(400);
});
test("permite prazo futuro válido", async () => {
  const { handler } = setup();
  const response = await handler(
    new Request("https://test/admin-users", {
      method: "POST",
      headers: { Authorization: "Bearer token" },
      body: JSON.stringify({ userId: callerId, accessExpiresAt: "2099-01-01T00:00:00Z" }),
    }),
  );
  expect(response.status).toBe(200);
});
