import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Menu, X } from 'lucide-react';
import logoAeAsset from '@/assets/logo-ae.png.asset.json';
import { cn } from '@/lib/utils';
import { Dashboard } from './Dashboard';
import { CalculatorWizard } from './CalculatorWizard';
import { ResultsView } from './ResultsView';
import { ProposalFlow } from './ProposalFlow';
import { Toaster } from '@/components/ui/sonner';
import { EducationalFlow } from './educational/EducationalFlow';

export const AppLayout = () => {
  const { view, setView, currentResults } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (target: 'dashboard' | 'proposal') => {
    setView(target);
    setMobileOpen(false);
  };

  const navItems: Array<{ label: string; target: 'dashboard' | 'proposal'; visible: boolean }> = [
    { label: 'Dashboard', target: 'dashboard', visible: true },
    { label: 'Proposta atual', target: 'proposal', visible: !!currentResults },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4 md:gap-12">
            <button className="flex items-center gap-3 group text-left" onClick={() => navigate('dashboard')}>
              <div className="h-10 flex items-center transition-transform group-hover:scale-105">
                <img src={logoAeAsset.url} alt="Academia do Eletricista" className="h-8 w-auto object-contain" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-base md:text-lg tracking-tight text-foreground">Dimensionador Expert</span>
                <span className="text-[10px] md:text-[11px] font-medium text-muted-foreground tracking-wide">Academia do Eletricista</span>
              </div>
            </button>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              {navItems.filter(item => item.visible).map(item => (
                <button
                  key={item.target}
                  onClick={() => navigate(item.target)}
                  className={cn('transition-colors hover:text-primary', view === item.target ? 'text-primary' : 'text-muted-foreground')}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <button
            className="md:hidden w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground"
            onClick={() => setMobileOpen(value => !value)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
            {navItems.filter(item => item.visible).map(item => (
              <button
                key={item.target}
                onClick={() => navigate(item.target)}
                className={cn('w-full text-left px-3 py-3 rounded-lg text-sm font-medium', view === item.target ? 'bg-primary/5 text-primary' : 'text-muted-foreground')}
              >
                {item.label}
              </button>
            ))}
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

      <footer className="py-12 border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-metadata max-w-2xl mx-auto leading-relaxed">
            Ferramenta de apoio ao dimensionamento. Os resultados não substituem projeto elétrico, verificação de curto-circuito, coordenação de proteção ou avaliação de profissional habilitado.
          </p>
          <div className="mt-6 text-center text-xs text-muted-foreground space-y-1">
            <p>Copyright © 2026</p>
            <p className="font-semibold text-foreground">Academia do Eletricista</p>
            <p>Instituto Brasileiro de Qualificação Profissional Ltda - ME</p>
            <p>CNPJ: 10.984.548/0001-77</p>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};
