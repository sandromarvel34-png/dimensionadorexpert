import { useAppStore } from "@/lib/store";
import { Link, Outlet } from "@tanstack/react-router";
import { Zap, LayoutDashboard, FileText, Settings } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const Dashboard = () => {
  const { setView, history, openHistoryItem } = useAppStore();

  const metrics = [
    { label: "Dimensionamentos", value: history.length || "0" },
    { label: "Propostas", value: history.filter(h => h.hasProposal).length || "0" },
    { label: "Último", value: history.length > 0 ? new Date(history[0].date).toLocaleDateString() : "—" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header Eyebrow & Title */}
      <div className="mb-12">
        <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Dimensionamento Elétrico</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Painel de Dimensionamento</h1>
            <p className="text-muted-foreground text-lg">Gerencie seus projetos e realize novos cálculos técnicos com precisão.</p>
          </div>
          <button 
            onClick={() => setView('wizard')}
            className="btn-primary"
          >
            + Novo dimensionamento
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {metrics.map((m, i) => (
          <div key={i} className="card-panel">
            <p className="text-label uppercase mb-2">{m.label}</p>
            <p className="text-3xl font-bold text-foreground">{m.value}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="card-panel">
        <h2 className="text-card-title mb-8">Últimos Projetos</h2>
        {history.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Você ainda não realizou nenhum dimensionamento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5 border border-border rounded-xl hover:border-primary transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">Motor {item.power || item.potencia} {item.powerUnit || item.unidade}</p>
                    <p className="text-metadata text-sm">{item.voltage || item.tensao}V • {item.phase || item.sistema} • {item.starterType || item.partida}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="font-bold text-foreground">{item.finalCableSection || item.section} mm²</p>
                    <p className="text-metadata text-[10px] uppercase">Condutor</p>
                  </div>
                  <button onClick={() => openHistoryItem(item)} className="text-primary font-bold hover:underline">Abrir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
