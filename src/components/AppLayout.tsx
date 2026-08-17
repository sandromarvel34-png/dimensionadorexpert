import { useAppStore } from "@/lib/store";
import { Zap, LayoutDashboard, FileText, Settings, User } from "lucide-react";
import logoAeAsset from "@/assets/logo-ae.png.asset.json";
import { cn } from "@/lib/utils";
import { Dashboard } from "./Dashboard";
import { CalculatorWizard } from "./CalculatorWizard";
import { ResultsView } from "./ResultsView";
import { ProposalFlow } from "./ProposalFlow";
import { Toaster } from "@/components/ui/sonner";
import { EducationalFlow } from "./educational/EducationalFlow";

export const AppLayout = () => {
  const { view, setView } = useAppStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* SaaS Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4 md:gap-12">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('dashboard')}>
              <div className="h-10 flex items-center transition-transform group-hover:scale-105">
                <img src={logoAeAsset.url} alt="AE Logo" className="h-8 w-auto object-contain" />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="font-bold text-base md:text-lg tracking-tight text-foreground">Dimensionador Expert</span>
                <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">By Academia do Eletricista</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <button 
                onClick={() => setView('dashboard')} 
                className={cn("transition-colors hover:text-primary cursor-pointer", view === 'dashboard' ? "text-primary" : "text-muted-foreground")}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setView('proposal')} 
                className={cn("transition-colors hover:text-primary cursor-pointer", view === 'proposal' ? "text-primary" : "text-muted-foreground")}
              >
                Propostas
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Configurações</button>
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
        {view === 'educational' && <EducationalFlow />}
      </main>

      <footer className="py-12 border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-metadata max-w-2xl mx-auto leading-relaxed">
            Ferramenta de apoio ao dimensionamento. Os resultados não substituem projeto elétrico ou avaliação de profissional habilitado.
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};