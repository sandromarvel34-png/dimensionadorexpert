import { useAppStore } from "@/lib/store";
import { Dashboard } from "@/components/Dashboard";
import { CalculatorWizard } from "@/components/CalculatorWizard";
import { ResultsView } from "@/components/ResultsView";
import { Toaster } from "@/components/ui/sonner";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: CalculatorComponent,
});

function CalculatorComponent() {
  const { view } = useAppStore();

  return (
    <div className="wrap min-h-screen bg-bg text-text selection:bg-accent/30 selection:text-white">
      <header className="top border-b border-border/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-20">
          <div className="brand flex items-center gap-3">
            <div className="brand-mark bg-panel p-2 rounded-xl border border-border">
              <svg viewBox="0 0 24 24" fill="none" stroke="#F2B705" strokeWidth="2" className="w-8 h-8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M8 8h3M8 12h3M8 16h3M15 8v8" />
                <circle cx="17" cy="16" r="1.4" fill="#F2B705" stroke="none" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">Calculadora Elétrica Pro</h1>
              <span className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase opacity-70">Dimensione. Confira. Decida.</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="badge hidden sm:block bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              Acesso Vitalício
            </div>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {view === 'dashboard' && <Dashboard />}
        {view === 'wizard' && <CalculatorWizard />}
        {view === 'results' && <ResultsView />}
      </main>

      <footer className="border-t border-border/50 py-8 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-[10px] text-muted leading-relaxed uppercase tracking-wide">
            Esta ferramenta é um recurso de apoio ao dimensionamento. Os resultados dependem dos dados informados e não substituem projeto elétrico ou análise de profissional habilitado.
          </p>
          <div className="flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-sm font-bold">WEG</span>
            <span className="text-sm font-bold">SIEMENS</span>
            <span className="text-sm font-bold">SCHNEIDER</span>
          </div>
        </div>
      </footer>
      
      <Toaster position="top-right" richColors />
    </div>
  );
}
