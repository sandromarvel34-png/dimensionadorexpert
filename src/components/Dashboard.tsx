import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Zap, ArrowRight, FileText, CheckCircle2, Plus } from 'lucide-react';

export const Dashboard = () => {
  const { setView, history, openHistoryItem } = useAppStore();
  const [showAll, setShowAll] = useState(false);

  const metrics = [
    { label: 'Dimensionamentos', value: history.length, icon: Zap },
    { label: 'Propostas salvas', value: history.filter(h => h.hasProposal).length, icon: FileText },
    { label: 'Último dimensionamento', value: history.length > 0 ? new Date(history[0].date).toLocaleDateString('pt-BR') : '—', icon: CheckCircle2 },
  ];

  const visibleHistory = showAll ? history : history.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <p className="text-xs font-semibold text-primary mb-3 tracking-wide">Dimensionador Expert</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">Dimensione comandos elétricos com mais agilidade</h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">Informe os dados do motor e da instalação para dimensionar condutores e componentes e organizar os resultados.</p>
          </div>
          <button onClick={() => setView('wizard')} className="btn-primary whitespace-nowrap"><Plus className="w-5 h-5" /> Novo dimensionamento</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 card-panel border-primary/20 bg-white hover:border-primary/40 transition-all group flex flex-col justify-between min-h-[250px]">
          <div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5"><Zap className="w-5 h-5" /></div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Novo dimensionamento</h2>
            <p className="text-muted-foreground mb-5 leading-relaxed">Calcule corrente, condutor, queda de tensão e referências de componentes a partir dos dados informados.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
              {['Condutor', 'Queda de tensão', 'Comando', 'Documentação'].map(benefit => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-foreground font-medium"><CheckCircle2 className="w-4 h-4 text-primary" /><span>{benefit}</span></div>
              ))}
            </div>
          </div>
          <button onClick={() => setView('wizard')} className="btn-primary w-fit group/btn">Começar <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" /></button>
        </div>

        <div className="flex flex-col gap-4">
          {metrics.map(m => (
            <div key={m.label} className="card-panel flex items-center gap-5 py-6">
              <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><m.icon className="w-5 h-5" /></div>
              <div><p className="text-xs font-medium text-muted-foreground mb-1">{m.label}</p><p className="text-2xl font-bold text-foreground tracking-tight">{m.value}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-foreground mb-5">Recursos principais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { title: 'Condutor', desc: 'Ampacidade, fatores de correção e seção mínima' },
            { title: 'Queda de tensão', desc: 'Verificação pelo modelo disponível na ferramenta' },
            { title: 'Comando', desc: 'Referências de contatores e relés' },
            { title: 'Fabricantes', desc: 'Base interna para consulta preliminar' },
            { title: 'Proposta', desc: 'Materiais, mão de obra e valor total' },
          ].map(cap => <div key={cap.title} className="card-panel p-5 bg-muted/30 border-none shadow-none"><p className="font-semibold text-foreground text-sm mb-1">{cap.title}</p><p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p></div>)}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Últimos dimensionamentos</h2>
          {history.length > 5 && <button onClick={() => setShowAll(v => !v)} className="text-sm font-semibold text-primary hover:underline">{showAll ? 'Mostrar recentes' : 'Ver tudo'}</button>}
        </div>

        {history.length === 0 ? (
          <div className="card-panel py-16 flex flex-col items-center text-center space-y-5 border-dashed">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><Zap className="w-8 h-8 opacity-20" /></div>
            <div><p className="text-foreground font-semibold">Você ainda não realizou nenhum dimensionamento.</p><p className="text-muted-foreground text-sm mt-1">Comece criando seu primeiro dimensionamento.</p></div>
            <button onClick={() => setView('wizard')} className="btn-primary"><Plus className="w-4 h-4" /> Novo dimensionamento</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {visibleHistory.map(item => (
              <div key={item.id} className="card-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors"><Zap className="w-5 h-5" /></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1 flex-1">
                    <div><p className="text-xs text-muted-foreground font-medium">Potência</p><p className="text-sm font-semibold text-foreground">{item.power || item.potencia} {item.powerUnit || item.unidade}</p></div>
                    <div><p className="text-xs text-muted-foreground font-medium">Tensão / sistema</p><p className="text-sm font-semibold text-foreground">{item.voltage || item.tensao} V • {item.phase || item.sistema}</p></div>
                    <div><p className="text-xs text-muted-foreground font-medium">Partida</p><p className="text-sm font-semibold text-foreground">{item.starterType || item.partida}</p></div>
                    <div><p className="text-xs text-muted-foreground font-medium">Data</p><p className="text-sm font-semibold text-foreground">{new Date(item.date).toLocaleDateString('pt-BR')}</p></div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right"><p className="text-xs text-muted-foreground font-medium">Seção final</p><p className="text-lg font-bold text-primary">{item.finalCableSection || item.section} mm²</p></div>
                  <button onClick={() => openHistoryItem(item)} className="btn-secondary h-10 px-4 ml-auto">Abrir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
