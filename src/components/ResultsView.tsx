import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export const ResultsView = () => {
  const { currentResults, setView } = useAppStore();

  if (!currentResults) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setView('wizard')}><ArrowLeft className="mr-2" /> Voltar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-panel border-border p-6 border-l-4 border-l-accent">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Condutor Dimensionado</h3>
          <p className="text-5xl font-black text-white">{currentResults.finalCableSection} mm²</p>
          <div className="mt-4 p-2 bg-accent/10 rounded text-accent text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> Dimensionamento Concluído
          </div>
        </Card>

        <Card className="bg-panel border-border p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Resumo da Solução</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-white">Corrente Nominal</span>
              <span className="font-mono text-accent">{currentResults.nominalCurrent.toFixed(1)} A</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-white">Critério Dominante</span>
              <span className="font-mono text-accent uppercase text-xs">{currentResults.limitingCriterion}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Condutor', 'Disjuntor', 'Contator', 'Relé Térmico'].map((item) => (
          <Card key={item} className="bg-panel border-border p-4 text-center space-y-2">
            <div className="text-xs text-muted font-bold uppercase">{item}</div>
            <div className="text-white font-bold">Produto Compatível</div>
            <Button variant="link" size="sm" className="text-accent h-auto p-0">Ver detalhes <ChevronRight className="w-3 h-3" /></Button>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <Button 
          size="lg" 
          className="bg-accent hover:bg-accent/90 text-black px-12 text-lg font-bold"
          onClick={() => setView('proposal')}
        >
          Criar Proposta
        </Button>
      </div>

    </div>
  );
};
