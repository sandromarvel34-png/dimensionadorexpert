import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { FileText, FolderKanban, LayoutDashboard, LogOut, Menu, Plus, Settings, ShieldCheck, UserRound, X } from 'lucide-react';
import logoAeAsset from '@/assets/logo-ae.png.asset.json';
import { cn } from '@/lib/utils';
import { Dashboard } from './Dashboard';
import { CalculatorWizard } from './CalculatorWizard';
import { ResultsView } from './ResultsView';
import { ProposalFlow } from './ProposalFlow';
import { ProposalsView } from './ProposalsView';
import { Toaster } from '@/components/ui/sonner';
import { EducationalFlow } from './educational/EducationalFlow';
import { useAuth } from './auth/AuthGate';
import { MyAccount } from './account/MyAccount';
import { AdminUsers } from './admin/AdminUsers';

type MainView = 'dashboard' | 'wizard' | 'results' | 'proposal' | 'proposals' | 'account' | 'admin';

export const AppLayout = () => {
  const { view, setView, currentResults } = useAppStore();
  const { session, access, signOut, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (target: MainView) => {
    setView(target);
    setMobileOpen(false);
  };

  const navItems: Array<{ label: string; target: MainView; visible: boolean; icon: typeof LayoutDashboard }> = [
    { label: 'Dashboard', target: 'dashboard', visible: true, icon: LayoutDashboard },
    { label: 'Propostas', target: 'proposals', visible: true, icon: FolderKanban },
    { label: 'Resultado', target: 'results', visible: !!currentResults, icon: FileText },
  ];

  const displayName =
    typeof session.user.user_metadata?.full_name === 'string' && session.user.user_metadata.full_name.trim()
      ? session.user.user_metadata.full_name.trim()
      : 'Minha conta';

  const initials = displayName === 'Minha conta'
    ? (session.user.email?.[0] || 'U').toUpperCase()
    : displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('');

  const accessExpires = access.access_expires_at
    ? new Date(access.access_expires_at).toLocaleDateString('pt-BR')
    : null;

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto h-[72px] flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8 lg:gap-12">
            <button className="flex items-center gap-3 text-left group" onClick={() => navigate('dashboard')}>
              <div className="h-9 flex items-center">
                <img src={logoAeAsset.url} alt="Academia do Eletricista" className="h-8 w-auto object-contain" />
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="block font-bold text-base tracking-tight text-slate-950">Dimensionador Expert</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mt-0.5">Comandos elétricos</span>
              </div>
            </button>

            <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-200 p-1">
              {navItems.filter(item => item.visible).map(item => (
                <button
                  key={item.target}
                  onClick={() => navigate(item.target)}
                  className={cn(
                    'h-9 px-3.5 rounded-lg text-sm font-semibold transition-all',
                    view === item.target
                      ? 'bg-white text-slate-950 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {view !== 'wizard' && view !== 'dashboard' && (
              <button onClick={() => navigate('wizard')} className="hidden sm:flex btn-primary h-10 px-4 text-sm">
                <Plus className="w-4 h-4" /> Novo dimensionamento
              </button>
            )}

            <details className="relative hidden md:block">
              <summary className="list-none cursor-pointer flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  {initials}
                </div>
                <div className="max-w-[150px] text-left leading-tight">
                  <p className="truncate text-xs font-bold text-slate-800">{displayName}</p>
                  <p className="truncate text-[10px] text-slate-400">{access.status === 'active' ? 'Acesso ativo' : 'Acesso suspenso'}</p>
                </div>
              </summary>

              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                    <p className="truncate text-xs text-slate-500">{session.user.email}</p>
                    {isAdmin && (
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-primary">Administrador</p>
                    )}
                  </div>
                </div>

                <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Status</dt>
                    <dd className="font-semibold text-slate-700">{access.status === 'active' ? 'Ativo' : 'Suspenso'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Plano</dt>
                    <dd className="max-w-[150px] truncate text-right font-semibold text-slate-700">{access.plan}</dd>
                  </div>
                  {accessExpires && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">Vencimento</dt>
                      <dd className="font-semibold text-slate-700">{accessExpires}</dd>
                    </div>
                  )}
                </dl>

                <button
                  onClick={(event) => {
                    event.currentTarget.closest('details')?.removeAttribute('open');
                    navigate('account');
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Minha conta
                </button>

                {isAdmin && (
                  <button
                    onClick={(event) => {
                      event.currentTarget.closest('details')?.removeAttribute('open');
                      navigate('admin');
                    }}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Gestão de usuários
                  </button>
                )}

                <button
                  onClick={() => void signOut()}
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </div>
            </details>

            <button
              className="md:hidden w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600"
              onClick={() => setMobileOpen(value => !value)}
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
            {navItems.filter(item => item.visible).map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.target}
                  onClick={() => navigate(item.target)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold',
                    view === item.target ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => navigate('account')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold',
                view === 'account' ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <UserRound className="w-4 h-4" />
              Minha conta
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('admin')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold',
                  view === 'admin' ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <ShieldCheck className="w-4 h-4" />
                Gestão de usuários
              </button>
            )}
            {view !== 'dashboard' && view !== 'wizard' && (
              <button onClick={() => navigate('wizard')} className="btn-primary w-full mt-2 h-11">
                <Plus className="w-4 h-4" /> Novo dimensionamento
              </button>
            )}
            <button
              onClick={() => {
                setMobileOpen(false);
                void signOut();
              }}
              className="w-full flex items-center gap-3 px-3 py-3 mt-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </nav>
        )}
      </header>

      <main>
        {view === 'dashboard' && <Dashboard />}
        {view === 'wizard' && <CalculatorWizard />}
        {view === 'results' && <ResultsView />}
        {view === 'proposal' && currentResults && <ProposalFlow />}
        {view === 'proposals' && <ProposalsView />}
        {view === 'educational' && <EducationalFlow />}
        {view === 'account' && <MyAccount />}
        {view === 'admin' && isAdmin && <AdminUsers />}
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-slate-800">Dimensionador Expert</p>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Ferramenta de apoio ao dimensionamento. A especificação final deve considerar as condições reais da instalação, documentação vigente dos fabricantes e responsabilidade técnica aplicável.
            </p>
          </div>
          <div className="text-xs text-slate-400 lg:text-right">
            <p>© 2026 Academia do Eletricista</p>
            <p className="mt-1">Instituto Brasileiro de Qualificação Profissional Ltda - ME</p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};
