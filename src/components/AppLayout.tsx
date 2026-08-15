import { useAppStore } from "@/lib/store";
import { Zap, LayoutDashboard, FileText, Settings, User } from "lucide-react";
import { Dashboard } from "./Dashboard";
import { CalculatorWizard } from "./CalculatorWizard";
import { ResultsView } from "./ResultsView";
import { ProposalFlow } from "./ProposalFlow";
import { Toaster } from "@/components/ui/sonner";

export const AppLayout = () => {
  const { view, setView } = useAppStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* SaaS Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900">Dimensionador de Comandos Elétricos</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button onClick={() => setView('dashboard')} className="hover:text-blue-600 transition-colors">Histórico</button>
              <button onClick={() => setView('proposal')} className="hover:text-blue-600 transition-colors">Propostas</button>
              <button className="hover:text-blue-600 transition-colors">Configurações</button>
            </nav>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      <main>
        {view === 'dashboard' && <Dashboard />}
        {view === 'wizard' && <CalculatorWizard />}
        {view === 'results' && <ResultsView />}
        {view === 'proposal' && <ProposalFlow />}
      </main>

      <footer className="py-12 text-center text-metadata">
        © 2026 Dimensionador de Comandos Elétricos. Recurso de apoio técnico.
      </footer>
      <Toaster />
    </div>
  );
};
