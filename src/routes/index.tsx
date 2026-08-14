import { useAppStore } from "@/lib/store";
import { Dashboard } from "@/components/Dashboard";
import { CalculatorWizard } from "@/components/CalculatorWizard";
import { ResultsView } from "@/components/ResultsView";
import { ProposalFlow } from "@/components/ProposalFlow";
import { Toaster } from "@/components/ui/sonner";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: CalculatorComponent,
});

function CalculatorComponent() {
  const { view, setView } = useAppStore();

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent/30 selection:text-white font-sans">
      <header className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="brand flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <span className="text-xl">⚡</span>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Dimensionador de Comandos Elétricos</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('dashboard')} className="text-sm font-medium text-slate-600 hover:text-accent transition-colors">Histórico</button>
            <button onClick={() => setView('proposal')} className="text-sm font-medium text-slate-600 hover:text-accent transition-colors">Propostas</button>
            <button className="text-sm font-medium text-slate-600 hover:text-accent transition-colors">Configurações</button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-300">
              U
            </div>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {view === 'dashboard' && <Dashboard />}
        {view === 'wizard' && <CalculatorWizard />}
        {view === 'results' && <ResultsView />}
        {view === 'proposal' && <ProposalFlow />}
      </main>


      <footer className="border-t border-border py-12 px-4 bg-white mt-auto">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Esta ferramenta é um recurso de apoio ao dimensionamento. Os resultados dependem dos dados informados e não substituem projeto elétrico, análise das condições reais da instalação ou responsabilidade de profissional legalmente habilitado.
          </p>
          <div className="flex justify-center items-center gap-8 opacity-40 grayscale">
            <span className="text-xs font-bold tracking-tighter">WEG</span>
            <span className="text-xs font-bold tracking-tighter">SIEMENS</span>
            <span className="text-xs font-bold tracking-tighter">SCHNEIDER</span>
          </div>
        </div>
      </footer>
      
      <Toaster position="top-right" richColors />
    </div>
  );
}
