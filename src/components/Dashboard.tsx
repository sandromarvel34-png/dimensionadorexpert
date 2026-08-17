import { useAppStore } from "@/lib/store";
import { Zap, ArrowRight, FileText, CheckCircle2, Plus } from "lucide-react";

export const Dashboard = () => {
  const { setView, history, openHistoryItem } = useAppStore();

  const metrics = [
    { label: "Dimensionamentos", value: history.length, icon: Zap },
    { label: "Propostas", value: history.filter(h => h.hasProposal).length, icon: FileText },
    { label: "Último dimensionamento", value: history.length > 0 ? new Date(history[0].date).toLocaleDateString() : "—", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="mb-16">
        <p className="text-[11px] font-bold text-primary mb-3 uppercase tracking-[0.2em]">DIMENSIONADOR EXPERT</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
              A solução definitiva para comandos elétricos
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Informe os dados técnicos do motor e da instalação para obter uma solução completa de dimensionamento.
            </p>
          </div>
          <button 
            onClick={() => setView('wizard')}
            className="btn-primary whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Novo dimensionamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Main Action Card */}
        <div className="lg:col-span-2 card-panel border-primary/20 bg-white hover:border-primary/40 transition-all group flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Novo dimensionamento</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Dimensione condutores, proteções e componentes de comandos elétricos a partir dos dados do motor.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8">
              {["Condutor", "Proteções", "Comando", "Componentes"].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setView('wizard')}
            className="btn-primary w-fit group/btn"
          >
            Começar <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="flex flex-col gap-6">
          {metrics.map((m, i) => (
            <div key={i} className="card-panel flex items-center gap-6 py-8">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <m.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="mb-16">
        <h2 className="text-xl font-bold text-foreground mb-8">O que o dimensionador entrega</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { title: "Condutor", desc: "Capacidade de corrente e queda de tensão" },
            { title: "Proteção", desc: "Disjuntor e fusível" },
            { title: "Comando", desc: "Contator e relé térmico" },
            { title: "Componentes", desc: "Sugestões de fabricantes" },
            { title: "Proposta", desc: "Materiais, mão de obra e valor total" },
          ].map((cap, i) => (
            <div key={i} className="card-panel p-5 bg-muted/30 border-none shadow-none">
              <p className="font-bold text-foreground text-sm mb-1">{cap.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Últimos Dimensionamentos</h2>
          {history.length > 0 && (
            <button className="text-sm font-semibold text-primary hover:underline">Ver tudo</button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="card-panel py-20 flex flex-col items-center text-center space-y-6 border-dashed">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2">
              <Zap className="w-8 h-8 opacity-20" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground font-semibold">Você ainda não realizou nenhum dimensionamento.</p>
              <p className="text-muted-foreground text-sm">Comece criando seu primeiro dimensionamento.</p>
            </div>
            <button 
              onClick={() => setView('wizard')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> Novo dimensionamento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="card-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 flex-1">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Potência</p>
                      <p className="text-sm font-semibold text-foreground">{item.power || item.potencia} {item.powerUnit || item.unidade}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tensão / Sistema</p>
                      <p className="text-sm font-semibold text-foreground">{item.voltage || item.tensao}V • {item.phase || item.sistema}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Partida</p>
                      <p className="text-sm font-semibold text-foreground">{item.starterType || item.partida}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Data</p>
                      <p className="text-sm font-semibold text-foreground">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Seção Final</p>
                    <p className="text-lg font-bold text-primary">{item.finalCableSection || item.section} mm²</p>
                  </div>
                  <button 
                    onClick={() => openHistoryItem(item)} 
                    className="btn-secondary h-10 px-4 ml-auto"
                  >
                    Abrir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};