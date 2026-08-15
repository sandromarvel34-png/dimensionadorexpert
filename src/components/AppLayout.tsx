import { useAppStore } from "@/lib/store";
import { Zap, LayoutDashboard, FileText, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
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
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('dashboard')}>
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">Dimensionador</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <button 
                onClick={() => setView('dashboard')} 
                className={cn("transition-colors hover:text-primary", view === 'dashboard' ? "text-primary" : "text-muted-foreground")}
              >
                Histórico
              </button>
              <button 
                onClick={() => setView('proposal')} 
                className={cn("transition-colors hover:text-primary", view === 'proposal' ? "text-primary" : "text-muted-foreground")}
              >
                Propostas
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors">Configurações</button>
            </nav>
          </div>
          <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
            <User className="w-5 h-5" />
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
