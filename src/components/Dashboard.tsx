import { useAppStore } from "@/lib/store";
import { Link, Outlet } from "@tanstack/react-router";
import { Zap, LayoutDashboard, FileText, Settings } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const Dashboard = () => {
  const { setView, history } = useAppStore();

  const metrics = [
    { label: "Dimensionamentos", value: history.length || "0" },
    { label: "Propostas", value: history.filter(h => h.hasProposal).length || "0" },
    { label: "Último", value: history.length > 0 ? new Date(history[0].date).toLocaleDateString() : "—" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header Eyebrow & Title */}
      <div className="mb-10 text-center sm:text-left">
        <p className="text-sm font-medium text-blue-600 mb-2 uppercase tracking-widest">Dimensionamento Elétrico</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-slate-900">Dimensione seus circuitos de motores</h1>
            <p className="text-slate-500">Informe os dados técnicos para obter uma solução completa.</p>
          </div>
          <button 
            onClick={() => setView('wizard')}
            className="btn-primary flex items-center gap-2"
          >
            + Novo dimensionamento
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {metrics.map((m, i) => (
          <div key={i} className="card-panel py-5 px-6">
            <p className="text-metadata mb-1 uppercase">{m.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{m.value}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="card-panel">
        <h2 className="text-card-title mb-6">Últimos Dimensionamentos</h2>
        {history.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-slate-400">Você ainda não realizou nenhum dimensionamento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Motor {item.potencia} {item.unidade}</p>
                    <p className="text-metadata">{item.tensao}V • {item.sistema} • {item.partida}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="font-semibold text-slate-700">{item.section} mm²</p>
                  <button onClick={() => setView('results')} className="text-blue-600 font-medium hover:underline">Abrir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
