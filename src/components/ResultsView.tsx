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
        {/* Condutor */}
        <Card className="bg-panel border-border p-4 text-center space-y-2">
          <div className="text-xs text-muted font-bold uppercase text-slate-400">Condutor</div>
          <div className="text-white font-bold">{currentResults.finalCableSection} mm²</div>
          <div className="text-[10px] text-slate-500">PVC / Cobre</div>
        </Card>

        {/* Disjuntor */}
        <Card className="bg-panel border-border p-4 text-center space-y-2">
          <div className="text-xs text-muted font-bold uppercase text-slate-400">Disjuntor</div>
          <div className="text-white font-bold">
            {currentResults.protections.breaker ? currentResults.protections.breaker.model : 'Não encontrado'}
          </div>
          <div className="text-[10px] text-slate-500">
            {currentResults.protections.breaker?.manufacturer || '-'} {currentResults.protections.breaker?.nominalCurrent ? `(${currentResults.protections.breaker.nominalCurrent}A)` : ''}
          </div>
        </Card>

        {/* Contator */}
        <Card className="bg-panel border-border p-4 text-center space-y-2">
          <div className="text-xs text-muted font-bold uppercase text-slate-400">Contator</div>
          <div className="text-white font-bold">
            {currentResults.protections.contactor?.[0] ? currentResults.protections.contactor[0].model : 'Não encontrado'}
          </div>
          <div className="text-[10px] text-slate-500">
            {currentResults.protections.contactor?.[0]?.manufacturer || '-'} {currentResults.protections.contactor?.[0]?.nominalCurrent ? `(${currentResults.protections.contactor[0].nominalCurrent}A)` : ''}
          </div>
        </Card>

        {/* Relé Térmico */}
        <Card className="bg-panel border-border p-4 text-center space-y-2">
          <div className="text-xs text-muted font-bold uppercase text-slate-400">Relé Térmico</div>
          <div className="text-white font-bold">
            {currentResults.protections.thermalRelay ? currentResults.protections.thermalRelay.model : 'Não encontrado'}
          </div>
          <div className="text-[10px] text-slate-500">
            {currentResults.protections.thermalRelay?.adjustmentRange 
              ? `${currentResults.protections.thermalRelay.adjustmentRange.min}-${currentResults.protections.thermalRelay.adjustmentRange.max}A`
              : '-'}
          </div>
        </Card>
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
