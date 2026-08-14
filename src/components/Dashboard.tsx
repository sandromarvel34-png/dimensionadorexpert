import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, 
  ShieldCheck, 
  Settings, 
  FileText, 
  Plus,
  ArrowRight,
  Calculator,
  Layers,
  Factory
} from 'lucide-react';

export const Dashboard = () => {
  const { setView, history } = useAppStore();

  const metrics = [
    { label: "Dimensionamentos realizados", value: history.length || 0, subtext: history.length > 0 ? "" : "Nenhum dimensionamento realizado" },
    { label: "Propostas criadas", value: history.filter(h => h.hasProposal).length || 0, subtext: "" },
    { label: "Último dimensionamento", value: history.length > 0 ? new Date(history[0].date).toLocaleDateString() : "-", subtext: "" },
  ];

  const features = [
    { icon: <Zap className="w-5 h-5 text-blue-500" />, title: "Condutor", desc: "Capacidade de corrente + queda de tensão" },
    { icon: <ShieldCheck className="w-5 h-5 text-blue-500" />, title: "Proteção", desc: "Disjuntor + fusíveis" },
    { icon: <Layers className="w-5 h-5 text-blue-500" />, title: "Comando", desc: "Contator + relé térmico" },
    { icon: <Factory className="w-5 h-5 text-blue-500" />, title: "Componentes", desc: "Sugestões de fabricantes compatíveis" },
    { icon: <FileText className="w-5 h-5 text-blue-500" />, title: "Proposta", desc: "Materiais + mão de obra + valor total" },
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Dimensione seus circuitos de motores com clareza
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Informe os dados do motor e da instalação e obtenha o dimensionamento dos principais componentes do circuito em um único resultado.
        </p>
        <div className="pt-4">
          <Button 
            onClick={() => setView('wizard')}
            className="h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
          >
            <Plus className="mr-2 w-5 h-5" /> Novo dimensionamento
          </Button>
        </div>
      </section>

      {/* Main Action Card */}
      <section>
        <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group cursor-pointer" onClick={() => setView('wizard')}>
          <CardContent className="p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-slate-900">Novo dimensionamento</h3>
              <p className="text-slate-500">Comece informando os dados do motor, da instalação e do tipo de partida.</p>
            </div>
            <Button size="lg" className="h-12 px-6 bg-slate-900 text-white rounded-lg group-hover:bg-blue-600 transition-colors">
              + Começar
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Metrics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <Card key={i} className="border-border shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-1">{m.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{m.value}</span>
                {m.subtext && <span className="text-xs text-slate-400 font-normal">{m.subtext}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* History Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900">Últimos dimensionamentos</h3>
        </div>

        {history.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Calculator className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500">Você ainda não realizou nenhum dimensionamento.</p>
            <Button variant="outline" onClick={() => setView('wizard')} className="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50">
              + Fazer primeiro dimensionamento
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 5).map((item) => (
              <Card key={item.id} className="border-border shadow-sm hover:border-blue-200 transition-colors">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Motor {item.potencia} {item.unidade || 'cv'}</h4>
                      <div className="text-sm text-slate-500 flex flex-wrap gap-x-2">
                        <span>{item.tensao}V</span>
                        <span>•</span>
                        <span>{item.sistema || 'Trifásico'}</span>
                        <span>•</span>
                        <span>{item.partida || 'Partida Direta'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <span className="text-sm text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                    <Button variant="secondary" size="sm" className="bg-slate-100 hover:bg-blue-600 hover:text-white transition-colors rounded-lg font-semibold">
                      Abrir <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Features List */}
      <section className="space-y-8 pt-8 border-t border-slate-100">
        <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest">O que você pode dimensionar</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                {f.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">{f.title}</h4>
                <p className="text-[11px] text-slate-400 leading-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};