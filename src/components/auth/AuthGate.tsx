import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import logoAeAsset from '@/assets/logo-ae.png.asset.json';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { WorkspaceGate } from './WorkspaceGate';

export type UserAccess = {
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  plan: string;
  access_started_at: string;
  access_expires_at: string | null;
};

type AuthContextValue = {
  session: Session;
  access: UserAccess;
  isAdmin: boolean;
  refreshAccess: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthGate.');
  return value;
};

type AuthMode = 'login' | 'signup' | 'forgot';

const APP_URL = 'https://dimensionadorexpert.lovable.app/';

const translateAuthError = (message: string) => {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (normalized.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (normalized.includes('user already registered')) return 'Este e-mail já possui cadastro.';
  if (normalized.includes('password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (normalized.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  return message;
};

function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const resetFeedback = () => setMessage('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    resetFeedback();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setMessage('Informe seu e-mail.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${APP_URL}?recovery=1`,
        });
        if (error) throw error;
        setMessage('Enviamos as instruções para redefinir sua senha. Verifique sua caixa de entrada.');
        return;
      }

      if (password.length < 6) {
        setMessage('A senha deve ter pelo menos 6 caracteres.');
        return;
      }

      if (mode === 'signup') {
        if (!fullName.trim()) {
          setMessage('Informe seu nome.');
          return;
        }
        if (password !== confirmPassword) {
          setMessage('As senhas informadas não são iguais.');
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: APP_URL,
          },
        });
        if (error) throw error;

        if (data.session) {
          toast.success('Conta criada com sucesso.');
        } else {
          setMessage('Cadastro realizado. Confirme seu e-mail para liberar o acesso.');
        }
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
      setMessage(translateAuthError(raw));
    } finally {
      setSubmitting(false);
    }
  };

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <section className="hidden lg:flex lg:w-[46%] bg-slate-950 text-white p-12 xl:p-16 flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-3">
            <img src={logoAeAsset.url} alt="Academia do Eletricista" className="h-9 w-auto object-contain brightness-0 invert" />
            <div>
              <p className="font-bold text-lg">Dimensionador Expert</p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Comandos elétricos</p>
            </div>
          </div>
        </div>

        <div className="max-w-lg">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Área profissional</span>
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight mt-4 leading-tight">
            Seus dimensionamentos e propostas em um só lugar.
          </h1>
          <p className="text-slate-300 text-lg mt-5 leading-relaxed">
            Acesse sua conta para calcular, revisar resultados e preparar documentação comercial e técnica.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              'Dimensionamentos organizados por usuário',
              'Propostas comerciais e memoriais vinculados aos cálculos',
              'Dados protegidos por controle individual de acesso',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <ShieldCheck className="w-5 h-5 text-blue-300 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">© 2026 Academia do Eletricista</p>
      </section>

      <section className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={logoAeAsset.url} alt="Academia do Eletricista" className="h-8 w-auto object-contain" />
            <div>
              <p className="font-bold text-slate-950">Dimensionador Expert</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Comandos elétricos</p>
            </div>
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div>
              <span className="eyebrow">
                {mode === 'login' ? 'Acesso' : mode === 'signup' ? 'Nova conta' : 'Recuperação de senha'}
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 mt-2">
                {mode === 'login'
                  ? 'Entrar no Dimensionador'
                  : mode === 'signup'
                    ? 'Criar sua conta'
                    : 'Recuperar sua senha'}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {mode === 'login'
                  ? 'Use o e-mail e a senha cadastrados.'
                  : mode === 'signup'
                    ? 'Cadastre-se para acessar a área profissional.'
                    : 'Informe seu e-mail para receber as instruções.'}
              </p>
            </div>

            <form onSubmit={submit} className="mt-7 space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Nome</Label>
                  <Input
                    id="auth-name"
                    value={fullName}
                    onChange={event => setFullName(event.target.value)}
                    placeholder="Seu nome"
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="auth-email">E-mail</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="voce@exemplo.com"
                    autoComplete="email"
                    className="pl-9"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="auth-password">Senha</Label>
                  <div className="relative">
                    <LockKeyhole className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(value => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="auth-confirm-password">Confirmar senha</Label>
                  <Input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                  />
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 leading-relaxed">
                  {message}
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full h-11 font-semibold">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar instruções'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-sm">
              {mode === 'login' && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <button onClick={() => changeMode('forgot')} className="font-semibold text-slate-600 hover:text-primary text-left">
                    Esqueci minha senha
                  </button>
                  <button onClick={() => changeMode('signup')} className="font-semibold text-primary hover:underline text-left">
                    Criar conta
                  </button>
                </div>
              )}
              {mode !== 'login' && (
                <button onClick={() => changeMode('login')} className="font-semibold text-primary hover:underline">
                  Voltar para o login
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            Ao acessar, seus dados ficam vinculados à sua conta.
          </p>
        </div>
      </section>
    </div>
  );
}

function UpdatePasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas informadas não são iguais.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast.error(translateAuthError(error.message));
      return;
    }

    window.history.replaceState({}, '', window.location.pathname);
    toast.success('Senha atualizada com sucesso.');
    onDone();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[20px] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm">
        <img src={logoAeAsset.url} alt="Academia do Eletricista" className="h-8 w-auto object-contain" />
        <span className="eyebrow block mt-7">Segurança</span>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-2">Defina sua nova senha</h1>
        <p className="text-sm text-slate-500 mt-2">Crie uma nova senha para voltar a acessar o Dimensionador Expert.</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full h-11">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Atualizar senha
          </Button>
        </form>
      </div>
    </div>
  );
}

function AccessBlockedScreen({
  reason,
  signOut,
}: {
  reason: 'suspended' | 'expired' | 'missing';
  signOut: () => Promise<void>;
}) {
  const copy = reason === 'suspended'
    ? {
        title: 'Acesso suspenso',
        description: 'Seu acesso ao Dimensionador Expert está suspenso. Entre em contato com o suporte para regularizar sua conta.',
      }
    : reason === 'expired'
      ? {
          title: 'Período de acesso encerrado',
          description: 'O período contratado para esta conta terminou. Renove o acesso para continuar usando o Dimensionador Expert.',
        }
      : {
          title: 'Acesso não liberado',
          description: 'Sua conta foi criada, mas ainda não possui uma liberação de acesso válida.',
        };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[20px] border border-slate-200 bg-white p-7 sm:p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
          <LockKeyhole className="w-6 h-6 text-slate-600" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 mt-5">{copy.title}</h1>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">{copy.description}</p>
        <Button onClick={() => void signOut()} variant="outline" className="w-full mt-6">
          Sair da conta
        </Button>
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [access, setAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const activeUserId = useRef<string | null>(null);
  const [accessOwnerId, setAccessOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setRecovering(params.get('recovery') === '1' || window.location.hash.includes('type=recovery'));
    }

    let receivedAuthEvent = false;
    let alive = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      receivedAuthEvent = true;
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (activeUserId.current !== (nextSession?.user.id || null)) {
        useAppStore.getState().detach();
        setAccess(null);
        setAccessOwnerId(null);
      }
      activeUserId.current = nextSession?.user.id || null;
      setSession(nextSession);
      if (!nextSession) setAccess(null);
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!alive || receivedAuthEvent) return;
      activeUserId.current = data.session?.user.id || null;
      setSession(data.session);
      setLoading(false);
    });

    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  const refreshAccess = async () => {
    if (!session?.user) {
      setAccess(null);
      return;
    }

    const userId = session.user.id;
    setAccessLoading(true);
    const { data, error } = await supabase
      .from('user_access')
      .select('role,status,plan,access_started_at,access_expires_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (activeUserId.current !== userId) return;

    if (error) {
      console.error('[Auth] Não foi possível carregar o acesso do usuário.', error);
      setAccess(null);
    } else {
      setAccess(data as UserAccess | null);
      setAccessOwnerId(userId);
    }
    setAccessLoading(false);
  };

  useEffect(() => {
    if (!session?.user) return;

    const user = session.user;
    const fullName = typeof user.user_metadata?.['full_name'] === 'string'
      ? user.user_metadata['full_name']
      : null;

    void supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    void refreshAccess();
  }, [session?.user.id]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error('Não foi possível sair da conta.');
  };

  const value = useMemo<AuthContextValue | null>(() => {
    if (!session || !access || accessOwnerId !== session.user.id) return null;
    return {
      session,
      access,
      isAdmin: access.role === 'admin',
      refreshAccess,
      signOut,
    };
  }, [session, access, accessOwnerId]);

  if (loading || (session && (accessLoading && accessOwnerId !== session.user.id))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
          <p className="text-sm text-slate-500 mt-3">Carregando sua conta...</p>
        </div>
      </div>
    );
  }

  if (recovering && session) {
    return <UpdatePasswordScreen onDone={() => setRecovering(false)} />;
  }

  if (!session) return <AuthScreen />;

  if (!access || accessOwnerId !== session.user.id) return <AccessBlockedScreen reason="missing" signOut={signOut} />;
  if (access.status === 'suspended') return <AccessBlockedScreen reason="suspended" signOut={signOut} />;

  const expired = access.access_expires_at
    ? new Date(access.access_expires_at).getTime() < Date.now()
    : false;

  if (expired) return <AccessBlockedScreen reason="expired" signOut={signOut} />;
  if (!value) return <AccessBlockedScreen reason="missing" signOut={signOut} />;

  return <AuthContext.Provider value={value}><WorkspaceGate key={session.user.id}>{children}</WorkspaceGate></AuthContext.Provider>;
}

