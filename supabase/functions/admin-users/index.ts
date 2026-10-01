import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey)
    return json({ error: "Configuração do servidor indisponível." }, 500);

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return json({ error: "Não autorizado." }, 401);

  const token = authorization.slice("Bearer ".length);
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const caller = authData.user;
  if (authError || !caller) return json({ error: "Sessão inválida." }, 401);

  const { data: callerAccess, error: accessError } = await admin
    .from("user_access")
    .select("role,status,access_expires_at")
    .eq("user_id", caller.id)
    .single();

  const callerExpired = callerAccess?.access_expires_at
    ? new Date(callerAccess.access_expires_at).getTime() < Date.now()
    : false;

  if (
    accessError ||
    callerAccess?.role !== "admin" ||
    callerAccess?.status !== "active" ||
    callerExpired
  ) {
    return json({ error: "Acesso administrativo não autorizado." }, 403);
  }

  if (req.method === "GET") {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    if (!Number.isInteger(page) || page < 1 || page > 100000)
      return json({ error: "Página inválida." }, 400);
    const { data: userPage, error: usersError } = await admin.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (usersError) return json({ error: usersError.message }, 500);

    const userIds = userPage.users.map((user) => user.id);
    const [{ data: profiles, error: profilesError }, { data: accesses, error: accessesError }] =
      await Promise.all([
        userIds.length
          ? admin
              .from("profiles")
              .select("user_id,full_name,phone,profession,city_state,avatar_path")
              .in("user_id", userIds)
          : Promise.resolve({ data: [], error: null }),
        userIds.length
          ? admin
              .from("user_access")
              .select("user_id,role,status,plan,access_started_at,access_expires_at,updated_at")
              .in("user_id", userIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

    if (profilesError) return json({ error: profilesError.message }, 500);
    if (accessesError) return json({ error: accessesError.message }, 500);

    const profileMap = new Map((profiles ?? []).map((item) => [item.user_id, item]));
    const accessMap = new Map((accesses ?? []).map((item) => [item.user_id, item]));

    return json({
      page,
      hasMore: userPage.users.length === 100,
      users: userPage.users.map((user) => ({
        id: user.id,
        email: user.email ?? "",
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
        emailConfirmedAt: user.email_confirmed_at ?? null,
        profile: profileMap.get(user.id) ?? null,
        access: accessMap.get(user.id) ?? null,
      })),
    });
  }

  if (req.method === "POST") {
    let body: {
      userId?: string;
      status?: "active" | "suspended";
      plan?: string;
      accessExpiresAt?: string | null;
    };

    try {
      body = await req.json();
    } catch {
      return json({ error: "Dados inválidos." }, 400);
    }

    if (
      !body ||
      typeof body !== "object" ||
      typeof body.userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.userId)
    )
      return json({ error: "Usuário inválido." }, 400);
    if (
      "plan" in body &&
      (typeof body.plan !== "string" || !body.plan.trim() || body.plan.length > 120)
    )
      return json({ error: "Plano inválido." }, 400);
    if (
      "accessExpiresAt" in body &&
      body.accessExpiresAt !== null &&
      (typeof body.accessExpiresAt !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T/.test(body.accessExpiresAt) ||
        !Number.isFinite(Date.parse(body.accessExpiresAt)) ||
        new Date(body.accessExpiresAt).toISOString().slice(0, 10) !==
          body.accessExpiresAt.slice(0, 10))
    )
      return json({ error: "Prazo inválido." }, 400);
    if (
      body.userId === caller.id &&
      body.accessExpiresAt &&
      Date.parse(body.accessExpiresAt) <= Date.now()
    )
      return json({ error: "O administrador não pode encerrar o próprio acesso." }, 400);
    if (!["status", "plan", "accessExpiresAt"].some((key) => key in body))
      return json({ error: "Nenhuma alteração informada." }, 400);
    if (body.userId === caller.id && body.status === "suspended") {
      return json({ error: "O administrador não pode suspender a própria conta." }, 400);
    }
    if ("status" in body && !["active", "suspended"].includes(body.status!)) {
      return json({ error: "Status inválido." }, 400);
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.status) patch.status = body.status;
    if (typeof body.plan === "string") patch.plan = body.plan.trim() || "Acesso padrão";
    if ("accessExpiresAt" in body) patch.access_expires_at = body.accessExpiresAt || null;

    const { data, error } = await admin
      .from("user_access")
      .update(patch)
      .eq("user_id", body.userId)
      .select("user_id,role,status,plan,access_started_at,access_expires_at,updated_at")
      .single();

    if (error) return json({ error: error.message }, 500);
    return json({ access: data });
  }

  return json({ error: "Método não permitido." }, 405);
});
