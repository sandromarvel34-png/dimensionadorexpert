import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, 
  ShieldCheck, 
  Settings, 
  ClipboardList, 
  FileText, 
  History,
  PlusCircle,
  Factory
} from 'lucide-react';

export const Dashboard = () => {
  const { setView, history } = useAppStore();

  const infoCards = [
    { icon: <Zap className="w-5 h-5 text-accent" />, text: "Condutor dimensionado" },
    { icon: <Settings className="w-5 h-5 text-accent" />, text: "Queda de tensão" },
    { icon: <ShieldCheck className="w-5 h-5 text-accent" />, text: "Proteção recomendada" },
    { icon: <Settings className="w-5 h-5 text-accent" />, text: "Contator / Relé" },
    { icon: <Factory className="w-5 h-5 text-accent" />, text: "WEG / Siemens / Schneider" },
    { icon: <FileText className="w-5 h-5 text-accent" />, text: "Exportação PDF" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-12">
      <section className="text-center space-y-6 py-12 bg-panel-2 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tight">⚡ Novo Dimensionamento</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encontre rapidamente o condutor, proteção e componentes ideais para sua aplicação com precisão técnica.
          </p>
          <Button 
            onClick={() => setView('wizard')}
            className="h-16 px-10 text-xl font-bold bg-accent hover:bg-accent/90 text-black rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="mr-3 w-6 h-6" /> Novo dimensionamento
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-6 pt-12 relative z-10">
          {infoCards.map((card, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 bg-panel/50 rounded-xl border border-border/50 backdrop-blur-sm">
              {card.icon}
              <span className="text-xs text-muted font-medium text-center leading-tight">{card.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="text-accent" /> Meus dimensionamentos
          </h3>
          <span className="text-sm text-muted">Acesso vitalício aos seus cálculos</span>
        </div>

        {history.length === 0 ? (
          <Card className="bg-panel border-border border-dashed py-20 text-center">
            <CardContent className="space-y-4">
              <ClipboardList className="w-12 h-12 text-muted mx-auto opacity-20" />
              <p className="text-muted text-lg">Nenhum dimensionamento salvo ainda.</p>
              <Button variant="outline" onClick={() => setView('wizard')}>Começar primeiro cálculo</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item) => (
              <Card key={item.id} className="bg-panel border-border hover:border-accent/50 transition-colors cursor-pointer group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-lg">{item.name}</h4>
                      <p className="text-xs text-muted">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <span className="px-2 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded uppercase tracking-wider">Salvo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted">Carga: <span className="text-white font-medium">{item.potencia} CV</span></div>
                    <div className="text-muted">Tensão: <span className="text-white font-medium">{item.tensao}V</span></div>
                    <div className="text-muted">Cabo: <span className="text-white font-medium">{item.cabo} mm²</span></div>
                    <div className="text-muted">Marca: <span className="text-white font-medium">{item.marca}</span></div>
                  </div>
                  <Button variant="secondary" className="w-full mt-2 group-hover:bg-accent group-hover:text-black transition-colors">Abrir Detalhes</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
