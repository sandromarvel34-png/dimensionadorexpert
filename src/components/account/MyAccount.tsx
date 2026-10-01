import { useEffect, useState, type ChangeEvent } from 'react';
import {
  Building2,
  CalendarDays,
  Camera,
  Database,
  KeyRound,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthGate';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Tab = 'profile' | 'company' | 'access' | 'data';

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

const formatDate = (value: string | null) => {
  if (!value) return 'Sem vencimento definido';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(value));
};

export function MyAccount() {
  const { session, access } = useAuth();
  const {
    companyProfile,
    setCompanyProfile,
    clearCalculations,
    clearProposals,
    resetWorkspace,
  } = useAppStore();

  const [tab, setTab] = useState<Tab>('profile');
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

  const saveProfile = async () => {
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

  const saveCompany = async () => {
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
      .upload(path, file, { upsert: true, contentType: file.type });

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

  const removeAvatar = async () => {
    if (!profile.avatarPath) return;
    setAvatarBusy(true);
    const { error: storageError } = await supabase.storage.from('avatars').remove([profile.avatarPath]);
    if (!storageError) {
      await supabase
        .from('profiles')
        .update({ avatar_path: null, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id);
      setProfile((current) => ({ ...current, avatarPath: '' }));
      setAvatarUrl('');
      toast.success('Foto removida.');
    } else {
      toast.error('Não foi possível remover a foto.');
    }
    setAvatarBusy(false);
  };

  const sendPasswordReset = async () => {
    if (!session.user.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
      redirectTo: 'https://dimensionadorexpert.lovable.app/?recovery=1',
    });
    if (error) toast.error('Não foi possível enviar o e-mail de redefinição.');
    else toast.success('Enviamos o link de redefinição para seu e-mail.');
  };

  const clearCloudCalculations = async () => {
    if (!window.confirm('Excluir todo o histórico de dimensionamentos desta conta?')) return;
    const { error } = await supabase.from('calculations').delete().eq('user_id', session.user.id);
    if (error) {
      toast.error('Não foi possível limpar os dimensionamentos.');
      return;
    }
    clearCalculations();
    toast.success('Histórico de dimensionamentos zerado.');
  };

  const clearCloudProposals = async () => {
    if (!window.confirm('Excluir todas as propostas desta conta? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('proposals').delete().eq('user_id', session.user.id);
    if (error) {
      toast.error('Não foi possível excluir as propostas.');
      return;
    }
    clearProposals();
    toast.success('Propostas excluídas.');
  };

  const clearEverything = async () => {
    if (!window.confirm('Zerar todos os dados de trabalho? Dimensionamentos, propostas e clientes serão excluídos. Seu perfil e dados da empresa serão mantidos.')) return;

    const proposalResult = await supabase.from('proposals').delete().eq('user_id', session.user.id);
    if (proposalResult.error) return void toast.error('Não foi possível excluir as propostas.');

    const calculationResult = await supabase.from('calculations').delete().eq('user_id', session.user.id);
    if (calculationResult.error) return void toast.error('Não foi possível excluir os dimensionamentos.');

    const clientResult = await supabase.from('clients').delete().eq('user_id', session.user.id);
    if (clientResult.error) return void toast.error('Não foi possível excluir os clientes.');

    resetWorkspace();
    toast.success('Dados de trabalho zerados.');
  };

  const tabs: Array<{ id: Tab; label: string; icon: typeof UserRound }> = [
    { id: 'profile', label: 'Perfil', icon: UserRound },
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'access', label: 'Acesso e segurança', icon: ShieldCheck },
    { id: 'data', label: 'Dados e privacidade', icon: Database },
  ];

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
      <div className="page-heading">
        <span className="eyebrow">Conta</span>
        <h1>Minha Conta</h1>
        <p>Gerencie seu perfil, dados profissionais, acesso e informações salvas.</p>
      </div>

      <div className="grid lg:grid-cols-[230px_1fr] gap-6 mt-8">
        <aside className="section-card p-3 h-fit">
          <div className="flex items-center gap-3 p-3 mb-2">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Foto do usuário" className="w-full h-full object-cover" />
              ) : (
                <UserRound className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900 truncate">{profile.fullName || 'Usuário'}</p>
              <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${
                  tab === id ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="section-card p-5 sm:p-7">
          {tab === 'profile' && (
            <div>
              <div className="section-heading">
                <div>
                  <h2>Perfil do usuário</h2>
                  <p>Informações pessoais vinculadas à sua conta.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-5 py-6 border-b border-slate-100">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Foto do usuário" className="w-full h-full object-cover" />
                  ) : (
                    <UserRound className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <label className="btn-primary h-10 px-4 text-sm cursor-pointer">
                      {avatarBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      Alterar foto
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadAvatar} disabled={avatarBusy} />
                    </label>
                    {avatarUrl && (
                      <Button variant="outline" onClick={() => void removeAvatar()} disabled={avatarBusy}>
                        Remover
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">JPG, PNG ou WebP. Máximo de 2 MB.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <Label>Nome completo</Label>
                  <Input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de acesso</Label>
                  <Input value={session.user.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Profissão</Label>
                  <Input value={profile.profession} onChange={(e) => setProfile({ ...profile, profession: e.target.value })} placeholder="Eletricista, técnico, engenheiro..." />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Cidade / UF</Label>
                  <Input value={profile.cityState} onChange={(e) => setProfile({ ...profile, cityState: e.target.value })} placeholder="Ex.: São Paulo / SP" />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => void saveProfile()} disabled={savingProfile}>
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar perfil
                </Button>
              </div>
            </div>
          )}

          {tab === 'company' && (
            <div>
              <div className="section-heading">
                <div>
                  <h2>Dados profissionais e empresa</h2>
                  <p>Essas informações podem ser usadas nas propostas e documentos gerados.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <Label>Empresa / nome profissional</Label>
                  <Input value={company.companyName} onChange={(e) => setCompany({ ...company, companyName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>CPF / CNPJ</Label>
                  <Input value={company.document} onChange={(e) => setCompany({ ...company, document: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Input value={company.responsibleName} onChange={(e) => setCompany({ ...company, responsibleName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Registro profissional</Label>
                  <Input value={company.professionalRegistration} onChange={(e) => setCompany({ ...company, professionalRegistration: e.target.value })} placeholder="CREA, CFT..." />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail profissional</Label>
                  <Input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade / UF</Label>
                  <Input value={company.cityState} onChange={(e) => setCompany({ ...company, cityState: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Site / Instagram</Label>
                  <Input value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => void saveCompany()} disabled={savingCompany}>
                  {savingCompany ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar dados profissionais
                </Button>
              </div>
            </div>
          )}

          {tab === 'access' && (
            <div>
              <div className="section-heading">
                <div>
                  <h2>Acesso e segurança</h2>
                  <p>Informações do seu plano e segurança da conta.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                <div className="metric-card">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-bold text-slate-950 mt-1">{access.status === 'active' ? 'Ativo' : 'Suspenso'}</p>
                </div>
                <div className="metric-card">
                  <p className="text-xs text-slate-500">Plano</p>
                  <p className="font-bold text-slate-950 mt-1">{access.plan}</p>
                </div>
                <div className="metric-card">
                  <p className="text-xs text-slate-500">Validade</p>
                  <p className="font-bold text-slate-950 mt-1 text-sm">{formatDate(access.access_expires_at)}</p>
                </div>
              </div>

              <div className="soft-panel mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <KeyRound className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Alterar senha</p>
                    <p className="text-sm text-slate-500 mt-1">Enviaremos um link seguro para {session.user.email}.</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => void sendPasswordReset()}>
                  Enviar link
                </Button>
              </div>

              <div className="soft-panel mt-4 flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Conta criada em</p>
                  <p className="text-sm text-slate-500 mt-1">{formatDate(session.user.created_at)}</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'data' && (
            <div>
              <div className="section-heading">
                <div>
                  <h2>Dados e privacidade</h2>
                  <p>Controle os dados de trabalho armazenados na sua conta e neste dispositivo.</p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                <DataAction
                  title="Zerar histórico de dimensionamentos"
                  description="Apaga os cálculos salvos e limpa o cálculo atual."
                  actionLabel="Zerar dimensionamentos"
                  onClick={clearCloudCalculations}
                />
                <DataAction
                  title="Excluir todas as propostas"
                  description="Remove todas as propostas comerciais salvas na conta."
                  actionLabel="Excluir propostas"
                  onClick={clearCloudProposals}
                />
                <DataAction
                  title="Zerar todos os dados de trabalho"
                  description="Apaga dimensionamentos, propostas e clientes. Seu perfil e dados profissionais permanecem."
                  actionLabel="Zerar dados"
                  onClick={clearEverything}
                  danger
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DataAction({
  title,
  description,
  actionLabel,
  onClick,
  danger = false,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void | Promise<void>;
  danger?: boolean;
}) {
  return (
    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <Button
        variant="outline"
        onClick={() => void onClick()}
        className={danger ? 'text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700' : ''}
      >
        <Trash2 className="w-4 h-4" />
        {actionLabel}
      </Button>
    </div>
  );
}
