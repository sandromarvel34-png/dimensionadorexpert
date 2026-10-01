import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Building2,
  Camera,
  FileText,
  HelpCircle,
  KeyRound,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthGate';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ProfileForm = {
  fullName: string;
  phone: string;
  profession: string;
  cityState: string;
  avatarPath: string;
};

type CompanyForm = {
  companyName: string;
  document: string;
  responsibleName: string;
  professionalRegistration: string;
  phone: string;
  email: string;
  address: string;
  cityState: string;
  website: string;
};

const emptyProfile: ProfileForm = {
  fullName: '',
  phone: '',
  profession: '',
  cityState: '',
  avatarPath: '',
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'Sem vencimento definido';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value));
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const statusLabel: Record<string, string> = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  aprovada: 'Aprovada',
  recusada: 'Recusada',
};

export function MyAccount() {
  const { session, access } = useAuth();
  const {
    companyProfile,
    setCompanyProfile,
    history,
    proposals,
    openProposal,
    setView,
    clearCalculations,
    clearProposals,
    resetWorkspace,
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [company, setCompany] = useState<CompanyForm>({
    companyName: companyProfile.companyName,
    document: companyProfile.document,
    responsibleName: companyProfile.responsibleName,
    professionalRegistration: companyProfile.professionalRegistration,
    phone: companyProfile.phone,
    email: companyProfile.email,
    address: companyProfile.address,
    cityState: companyProfile.cityState,
    website: companyProfile.website,
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const loadAvatar = async (path: string) => {
    if (!path) {
      setAvatarUrl('');
      return;
    }
    const { data } = await supabase.storage.from('avatars').createSignedUrl(path, 60 * 60);
    setAvatarUrl(data?.signedUrl || '');
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [profileResult, companyResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name,phone,profession,city_state,avatar_path')
          .eq('user_id', session.user.id)
          .maybeSingle(),
        supabase
          .from('company_profiles')
          .select('company_name,document,responsible_name,professional_registration,phone,email,address,city_state,website')
          .eq('user_id', session.user.id)
          .maybeSingle(),
      ]);

      if (profileResult.error) toast.error('Não foi possível carregar seu perfil.');
      if (companyResult.error) toast.error('Não foi possível carregar os dados profissionais.');

      if (profileResult.data) {
        const nextProfile = {
          fullName: profileResult.data.full_name || '',
          phone: profileResult.data.phone || '',
          profession: profileResult.data.profession || '',
          cityState: profileResult.data.city_state || '',
          avatarPath: profileResult.data.avatar_path || '',
        };
        setProfile(nextProfile);
        await loadAvatar(nextProfile.avatarPath);
      }

      if (companyResult.data) {
        setCompany({
          companyName: companyResult.data.company_name || '',
          document: companyResult.data.document || '',
          responsibleName: companyResult.data.responsible_name || '',
          professionalRegistration: companyResult.data.professional_registration || '',
          phone: companyResult.data.phone || '',
          email: companyResult.data.email || '',
          address: companyResult.data.address || '',
          cityState: companyResult.data.city_state || '',
          website: companyResult.data.website || '',
        });
      }
      setLoading(false);
    };

    void load();
  }, [session.user.id]);

  const daysRemaining = useMemo(() => {
    if (!access.access_expires_at) return null;
    const diff = new Date(access.access_expires_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  }, [access.access_expires_at]);

  const approvedProposals = useMemo(
    () => proposals.filter((proposal) => proposal.status === 'aprovada'),
    [proposals],
  );

  const approvedValue = useMemo(
    () => approvedProposals.reduce((sum, proposal) => sum + Number(proposal.total || 0), 0),
    [approvedProposals],
  );

  const recentProposals = useMemo(
    () =>
      [...proposals]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5),
    [proposals],
  );

  const initials = (profile.fullName || session.user.email || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const saveProfile = async (event?: FormEvent) => {
    event?.preventDefault();
    setSavingProfile(true);

    const { error } = await supabase.from('profiles').upsert(
      {
        user_id: session.user.id,
        full_name: profile.fullName.trim() || null,
        phone: profile.phone.trim() || null,
        profession: profile.profession.trim() || null,
        city_state: profile.cityState.trim() || null,
        avatar_path: profile.avatarPath || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    setSavingProfile(false);

    if (error) {
      toast.error('Não foi possível salvar o perfil.');
      return;
    }

    await supabase.auth.updateUser({
      data: { full_name: profile.fullName.trim() },
    });
    toast.success('Perfil atualizado.');
  };

  const saveCompany = async (event?: FormEvent) => {
    event?.preventDefault();
    setSavingCompany(true);

    const { error } = await supabase.from('company_profiles').upsert(
      {
        user_id: session.user.id,
        company_name: company.companyName.trim() || null,
        document: company.document.trim() || null,
        responsible_name: company.responsibleName.trim() || null,
        professional_registration: company.professionalRegistration.trim() || null,
        phone: company.phone.trim() || null,
        email: company.email.trim() || null,
        address: company.address.trim() || null,
        city_state: company.cityState.trim() || null,
        website: company.website.trim() || null,
        brand_color: companyProfile.brandColor,
        logo_background: companyProfile.logoBackground,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    setSavingCompany(false);

    if (error) {
      toast.error('Não foi possível salvar os dados profissionais.');
      return;
    }

    setCompanyProfile({
      companyName: company.companyName,
      document: company.document,
      responsibleName: company.responsibleName,
      professionalRegistration: company.professionalRegistration,
      phone: company.phone,
      email: company.email,
      address: company.address,
      cityState: company.cityState,
      website: company.website,
    });
    toast.success('Dados profissionais atualizados.');
  };

  const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Use uma imagem JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A foto deve ter no máximo 2 MB.');
      return;
    }

    setAvatarBusy(true);
    const path = `${session.user.id}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });

    if (uploadError) {
      setAvatarBusy(false);
      toast.error('Não foi possível enviar a foto.');
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: session.user.id,
          avatar_path: path,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    setAvatarBusy(false);

    if (profileError) {
      toast.error('A foto foi enviada, mas não foi vinculada ao perfil.');
      return;
    }

    setProfile((current) => ({ ...current, avatarPath: path }));
    await loadAvatar(path);
    toast.success('Foto atualizada.');
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage('');

    if (password.length < 6) {
      setPasswordMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== passwordConfirm) {
      setPasswordMessage('As senhas não coincidem.');
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPasswordSaving(false);

    if (error) {
      setPasswordMessage('Não foi possível alterar a senha.');
      return;
    }

    setPassword('');
    setPasswordConfirm('');
    setPasswordMessage('Senha alterada com sucesso.');
  };

  const clearCloudCalculations = async () => {
    const typed = window.prompt(
      'Esta ação apagará todo o histórico de dimensionamentos. Digite ZERAR para confirmar.',
    );
    if (typed !== 'ZERAR') return;

    const { error } = await supabase.from('calculations').delete().eq('user_id', session.user.id);
    if (error) {
      toast.error('Não foi possível limpar os dimensionamentos.');
      return;
    }

    clearCalculations();
    toast.success('Histórico de dimensionamentos zerado.');
  };

  const clearCloudProposals = async () => {
    const typed = window.prompt(
      'Esta ação apagará todas as propostas. Digite EXCLUIR para confirmar.',
    );
    if (typed !== 'EXCLUIR') return;

    const { error } = await supabase.from('proposals').delete().eq('user_id', session.user.id);
    if (error) {
      toast.error('Não foi possível excluir as propostas.');
      return;
    }

    clearProposals();
    toast.success('Propostas excluídas.');
  };

  const clearEverything = async () => {
    const typed = window.prompt(
      'Esta ação apagará dimensionamentos, propostas e clientes. Digite ZERAR TUDO para confirmar.',
    );
    if (typed !== 'ZERAR TUDO') return;

    const proposalResult = await supabase.from('proposals').delete().eq('user_id', session.user.id);
    if (proposalResult.error) return void toast.error('Não foi possível excluir as propostas.');

    const calculationResult = await supabase.from('calculations').delete().eq('user_id', session.user.id);
    if (calculationResult.error) return void toast.error('Não foi possível excluir os dimensionamentos.');

    const clientResult = await supabase.from('clients').delete().eq('user_id', session.user.id);
    if (clientResult.error) return void toast.error('Não foi possível excluir os clientes.');

    resetWorkspace();
    toast.success('Dados de trabalho zerados.');
  };

  if (loading) {
    return (
      <div className="page-shell py-20 text-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
        <p className="text-sm text-slate-500 mt-3">Carregando sua conta...</p>
      </div>
    );
  }

  return (
    <div className="page-shell py-8 sm:py-10">
      <section>
        <p className="eyebrow">Minha conta</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Perfil e acesso</h1>
        <p className="mt-2 text-sm text-slate-500">
          Gerencie seus dados, acompanhe seu uso e configure sua conta no Dimensionador Expert.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="section-card p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative w-24 h-24 shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Foto do usuário"
                  className="w-24 h-24 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex w-24 h-24 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-2xl font-semibold text-slate-600">
                  {initials || <UserRound className="w-8 h-8" />}
                </div>
              )}
              <label
                className="absolute bottom-0 right-0 flex w-9 h-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
                aria-label="Alterar foto"
              >
                {avatarBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={uploadAvatar}
                  disabled={avatarBusy}
                />
              </label>
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-950">
                {profile.fullName || 'Complete seu perfil'}
              </h2>
              <p className="mt-1 truncate text-sm text-slate-500">{session.user.email}</p>
              <p className="mt-2 text-sm font-semibold text-primary">
                {profile.profession || 'Profissão não informada'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {avatarBusy ? 'Enviando foto...' : 'JPG, PNG ou WebP • máximo 2 MB'}
              </p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nome completo</Label>
              <Input
                value={profile.fullName}
                onChange={(event) => setProfile({ ...profile, fullName: event.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Atuação profissional</Label>
              <Input
                value={profile.profession}
                onChange={(event) => setProfile({ ...profile, profession: event.target.value })}
                placeholder="Ex.: Eletricista industrial"
              />
            </div>

            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input value={session.user.email || ''} disabled />
            </div>

            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input
                value={profile.phone}
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Cidade / UF</Label>
              <Input
                value={profile.cityState}
                onChange={(event) => setProfile({ ...profile, cityState: event.target.value })}
                placeholder="Ex.: São Paulo / SP"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingProfile ? 'Salvando...' : 'Salvar perfil'}
              </Button>
            </div>
          </form>
        </div>

        <div className="section-card p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-950">Meu acesso</h2>
          </div>

          <dl className="mt-5 space-y-4 text-sm">
            <InfoRow label="Produto" value="Dimensionador Expert" />
            <InfoRow label="Status" value={access.status === 'active' ? 'Ativo' : 'Suspenso'} strong />
            <InfoRow label="Plano" value={access.plan} />
            <InfoRow label="Início do acesso" value={formatDate(access.access_started_at)} />
            <InfoRow label="Vencimento" value={formatDate(access.access_expires_at)} />
          </dl>

          {daysRemaining !== null && (
            <div className="mt-6 rounded-xl bg-blue-50 p-4">
              <span className="text-xs uppercase tracking-wide text-primary">Tempo restante</span>
              <div className="mt-1 text-2xl font-bold text-slate-950">
                {daysRemaining} dia{daysRemaining === 1 ? '' : 's'}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 section-card p-6">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-950">Meu trabalho</h2>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Dimensionamentos" value={String(history.length)} />
          <Metric label="Propostas" value={String(proposals.length)} />
          <Metric label="Aprovadas" value={String(approvedProposals.length)} />
          <Metric label="Valor aprovado" value={formatCurrency(approvedValue)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setView('dashboard')}>Ver dimensionamentos</Button>
          <Button variant="outline" onClick={() => setView('proposals')}>Ver propostas</Button>
        </div>
      </section>

      <section className="mt-6 section-card p-6">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-950">Dados profissionais e empresa</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Essas informações são usadas nas propostas comerciais e documentos gerados.
        </p>

        <form onSubmit={saveCompany} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Empresa / nome profissional">
            <Input value={company.companyName} onChange={(e) => setCompany({ ...company, companyName: e.target.value })} />
          </Field>
          <Field label="CPF / CNPJ">
            <Input value={company.document} onChange={(e) => setCompany({ ...company, document: e.target.value })} />
          </Field>
          <Field label="Responsável">
            <Input value={company.responsibleName} onChange={(e) => setCompany({ ...company, responsibleName: e.target.value })} />
          </Field>
          <Field label="Registro profissional">
            <Input
              value={company.professionalRegistration}
              onChange={(e) => setCompany({ ...company, professionalRegistration: e.target.value })}
              placeholder="CREA, CFT..."
            />
          </Field>
          <Field label="Telefone">
            <Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
          </Field>
          <Field label="E-mail profissional">
            <Input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
          </Field>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Endereço</Label>
            <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
          </div>
          <Field label="Cidade / UF">
            <Input value={company.cityState} onChange={(e) => setCompany({ ...company, cityState: e.target.value })} />
          </Field>
          <Field label="Site / Instagram">
            <Input value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} />
          </Field>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={savingCompany}>
              {savingCompany ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingCompany ? 'Salvando...' : 'Salvar dados profissionais'}
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-6 section-card p-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-950">Propostas recentes</h2>
        </div>

        {recentProposals.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Crie uma proposta a partir de um dimensionamento para vê-la aqui.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {recentProposals.map((proposal) => (
              <div key={proposal.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide text-primary">
                    {statusLabel[proposal.status] || proposal.status}
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {proposal.clientData.name || proposal.commercialData.serviceDescription || 'Proposta sem identificação'}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {formatDate(proposal.updatedAt)} • {formatCurrency(Number(proposal.total || 0))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openProposal(proposal.id)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Abrir proposta
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="section-card p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-950">Conta e segurança</h2>
          </div>

          <form onSubmit={changePassword} className="mt-5 space-y-4">
            <Field label="Nova senha">
              <Input
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirmar nova senha">
              <Input
                type="password"
                minLength={6}
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                autoComplete="new-password"
              />
            </Field>
            {passwordMessage && <p className="text-sm text-slate-500">{passwordMessage}</p>}
            <Button type="submit" variant="outline" disabled={passwordSaving}>
              {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {passwordSaving ? 'Alterando...' : 'Alterar senha'}
            </Button>
          </form>
        </div>

        <div className="section-card p-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-950">Suporte</h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Precisa de ajuda com acesso, pagamento ou funcionamento do Dimensionador Expert?
            Utilize o canal de atendimento informado no momento da compra.
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Ao solicitar suporte, informe o e-mail cadastrado nesta conta: {session.user.email}.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-red-200 bg-white p-6">
        <div className="flex items-center gap-2 text-red-600">
          <Trash2 className="w-5 h-5" />
          <h2 className="text-lg font-bold">Área de risco</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-slate-500">
          Use estas opções somente quando quiser reiniciar seus dados de trabalho. Seu acesso,
          perfil e dados profissionais permanecem ativos.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void clearCloudCalculations()}>
            Zerar dimensionamentos
          </Button>
          <Button variant="outline" onClick={() => void clearCloudProposals()}>
            Excluir propostas
          </Button>
          <Button
            variant="outline"
            onClick={() => void clearEverything()}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Zerar todos os dados de trabalho
          </Button>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 truncate text-lg font-bold text-slate-950">{value}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right ${strong ? 'font-bold text-primary' : 'font-semibold text-slate-800'}`}>
        {value}
      </dd>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
