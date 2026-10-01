import { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AdminUser = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
  profile: {
    user_id: string;
    full_name: string | null;
    phone: string | null;
    profession: string | null;
    city_state: string | null;
    avatar_path: string | null;
  } | null;
  access: {
    user_id: string;
    role: 'user' | 'admin';
    status: 'active' | 'suspended';
    plan: string;
    access_started_at: string;
    access_expires_at: string | null;
    updated_at: string;
  } | null;
};

type Draft = {
  plan: string;
  expires: string;
};

const toDateInput = (value: string | null | undefined) => value ? value.slice(0, 10) : '';

const formatDate = (value: string | null) => {
  if (!value) return 'Nunca';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

const isExpired = (user: AdminUser) =>
  !!user.access?.access_expires_at &&
  new Date(user.access.access_expires_at).getTime() < Date.now();

export function AdminUsers() {
  const { session, isAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-users', {
      method: 'GET',
    });

    if (error || !data?.users) {
      toast.error('Não foi possível carregar os usuários.');
      setLoading(false);
      return;
    }

    const nextUsers = data.users as AdminUser[];
    setUsers(nextUsers);
    setDrafts(
      Object.fromEntries(
        nextUsers.map((user) => [
          user.id,
          {
            plan: user.access?.plan || 'Acesso padrão',
            expires: toDateInput(user.access?.access_expires_at),
          },
        ]),
      ),
    );
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void loadUsers();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      user.email.toLowerCase().includes(term) ||
      (user.profile?.full_name || '').toLowerCase().includes(term) ||
      (user.profile?.profession || '').toLowerCase().includes(term),
    );
  }, [users, search]);

  const activeCount = users.filter((user) => user.access?.status === 'active' && !isExpired(user)).length;
  const suspendedCount = users.filter((user) => user.access?.status === 'suspended').length;
  const expiredCount = users.filter((user) => user.access?.status === 'active' && isExpired(user)).length;

  const updateAccess = async (
    user: AdminUser,
    patch: {
      status?: 'active' | 'suspended';
      plan?: string;
      accessExpiresAt?: string | null;
    },
  ) => {
    setUpdatingId(user.id);
    const { data, error } = await supabase.functions.invoke('admin-users', {
      method: 'POST',
      body: {
        userId: user.id,
        ...patch,
      },
    });
    setUpdatingId('');

    if (error || data?.error) {
      toast.error(data?.error || 'Não foi possível atualizar o acesso.');
      return;
    }

    const access = data.access as AdminUser['access'];
    setUsers((current) =>
      current.map((item) => item.id === user.id ? { ...item, access } : item),
    );
    setDrafts((current) => ({
      ...current,
      [user.id]: {
        plan: access?.plan || 'Acesso padrão',
        expires: toDateInput(access?.access_expires_at),
      },
    }));
    toast.success('Acesso atualizado.');
  };

  const saveDraft = async (user: AdminUser) => {
    const draft = drafts[user.id];
    await updateAccess(user, {
      plan: draft?.plan || 'Acesso padrão',
      accessExpiresAt: draft?.expires ? new Date(`${draft.expires}T23:59:59`).toISOString() : null,
    });
  };

  const grantSixMonths = async (user: AdminUser) => {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 6);
    await updateAccess(user, {
      status: 'active',
      plan: 'Acesso 6 meses',
      accessExpiresAt: expires.toISOString(),
    });
  };

  if (!isAdmin) {
    return (
      <div className="page-shell py-20 text-center">
        <Shield className="w-10 h-10 text-slate-300 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900 mt-4">Área administrativa</h1>
        <p className="text-sm text-slate-500 mt-2">Esta área é exclusiva para administradores.</p>
      </div>
    );
  }

  return (
    <div className="page-shell py-8 sm:py-10">
      <div className="page-heading flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <span className="eyebrow">Administração</span>
          <h1>Gestão de Usuários</h1>
          <p>Controle contas, períodos de acesso e bloqueios do Dimensionador Expert.</p>
        </div>
        <Button variant="outline" onClick={() => void loadUsers()} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        <AdminMetric label="Total de usuários" value={users.length} icon={Users} />
        <AdminMetric label="Acessos ativos" value={activeCount} icon={CheckCircle2} />
        <AdminMetric label="Suspensos" value={suspendedCount} icon={XCircle} />
        <AdminMetric label="Expirados" value={expiredCount} icon={CalendarClock} />
      </div>

      <div className="section-card p-4 sm:p-5 mt-6">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail ou profissão..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="section-card overflow-hidden mt-4">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
            <p className="text-sm text-slate-500 mt-3">Carregando usuários...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <UserRound className="w-9 h-9 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 mt-3">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((user) => {
              const expired = isExpired(user);
              const suspended = user.access?.status === 'suspended';
              const draft = drafts[user.id] || { plan: user.access?.plan || '', expires: toDateInput(user.access?.access_expires_at) };
              const isSelf = user.id === session.user.id;
              const busy = updatingId === user.id;

              return (
                <div key={user.id} className="p-5 sm:p-6">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                    <div className="min-w-0 xl:w-[34%]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <UserRound className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-900 truncate">
                              {user.profile?.full_name || 'Usuário sem nome'}
                            </p>
                            {user.access?.role === 'admin' && (
                              <span className="status-pill bg-violet-50 text-violet-700">Administrador</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                        <div>
                          <p className="text-slate-400">Cadastro</p>
                          <p className="font-semibold text-slate-600 mt-1">{formatDate(user.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Último acesso</p>
                          <p className="font-semibold text-slate-600 mt-1">{formatDate(user.lastSignInAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="xl:flex-1 grid md:grid-cols-[1fr_180px_auto] gap-3 items-end">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500">Plano / acesso</label>
                        <Input
                          value={draft.plan}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [user.id]: { ...draft, plan: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500">Validade</label>
                        <Input
                          type="date"
                          value={draft.expires}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [user.id]: { ...draft, expires: event.target.value },
                            }))
                          }
                        />
                      </div>
                      <Button variant="outline" onClick={() => void saveDraft(user)} disabled={busy}>
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100">
                    <span
                      className={`status-pill ${
                        suspended
                          ? 'bg-red-50 text-red-700'
                          : expired
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {suspended ? 'Suspenso' : expired ? 'Expirado' : 'Ativo'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {user.emailConfirmedAt ? 'E-mail confirmado' : 'E-mail pendente'}
                    </span>
                    <div className="sm:ml-auto flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => void grantSixMonths(user)} disabled={busy}>
                        Liberar 6 meses
                      </Button>
                      {suspended ? (
                        <Button size="sm" onClick={() => void updateAccess(user, { status: 'active' })} disabled={busy}>
                          Reativar acesso
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void updateAccess(user, { status: 'suspended' })}
                          disabled={busy || isSelf}
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          title={isSelf ? 'Você não pode suspender a própria conta.' : 'Suspender acesso'}
                        >
                          Suspender
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="metric-card flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-black text-slate-950 mt-1">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
    </div>
  );
}
