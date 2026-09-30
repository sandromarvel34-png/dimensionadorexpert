import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { FileText, LayoutDashboard, Menu, Plus, X } from 'lucide-react';
import logoAeAsset from '@/assets/logo-ae.png.asset.json';
import { cn } from '@/lib/utils';
import { Dashboard } from './Dashboard';
import { CalculatorWizard } from './CalculatorWizard';
import { ResultsView } from './ResultsView';
import { ProposalFlow } from './ProposalFlow';
import { Toaster } from '@/components/ui/sonner';
import { EducationalFlow } from './educational/EducationalFlow';

type MainView = 'dashboard' | 'wizard' | 'results' | 'proposal';

export const AppLayout = () => {
  const { view, setView, currentResults } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (target: MainView) => {
    setView(target);
    setMobileOpen(false);
  };

  const navItems: Array<{ label: string; target: MainView; visible: boolean; icon: typeof LayoutDashboard }> = [
    { label: 'Dashboard', target: 'dashboard', visible: true, icon: LayoutDashboard },
    { label: 'Resultado', target: 'results', visible: !!currentResults, icon: FileText },
    { label: 'Proposta', target: 'proposal', visible: !!currentResults, icon: FileText },
  ];

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
            {view !== 'wizard' && (
              <button onClick={() => navigate('wizard')} className="hidden sm:flex btn-primary h-10 px-4 text-sm">
                <Plus className="w-4 h-4" /> Novo cálculo
              </button>
            )}
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
            <button onClick={() => navigate('wizard')} className="btn-primary w-full mt-2 h-11">
              <Plus className="w-4 h-4" /> Novo dimensionamento
            </button>
          </nav>
        )}
      </header>

      <main>
        {view === 'dashboard' && <Dashboard />}
        {view === 'wizard' && <CalculatorWizard />}
        {view === 'results' && <ResultsView />}
        {view === 'proposal' && currentResults && <ProposalFlow />}
        {view === 'educational' && <EducationalFlow />}
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
