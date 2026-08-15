import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export const ResultsView = () => {
  const { currentResults, currentInputs, setView } = useAppStore();

  if (!currentResults || !currentInputs) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div className="space-y-3">
          <button 
            onClick={() => {
              // Current inputs are already in store, just change view
              setView('wizard');
            }}
            className="btn-ghost px-0 h-auto gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao formulário
          </button>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Resultado do Dimensionamento</h1>
          <div className="flex flex-wrap gap-2 text-metadata font-semibold uppercase tracking-widest text-[10px]">
            <span className="bg-primary text-white px-2 py-1 rounded">
              {currentInputs.dataSource === 'catalog' ? `Catálogo WEG: ${currentInputs.motorCatalogData?.line} - ${currentInputs.motorCatalogData?.model}` : 'Fonte: Dados da Placa'}
            </span>
            <span className="bg-muted px-2 py-1 rounded">{currentInputs.power} {currentInputs.powerUnit}</span>
            <span className="bg-muted px-2 py-1 rounded">{currentInputs.voltage} V</span>
            <span className="bg-muted px-2 py-1 rounded">{currentInputs.phase}</span>
            <span className="bg-muted px-2 py-1 rounded">{currentInputs.distance} m</span>
            <span className="bg-muted px-2 py-1 rounded">Partida {currentInputs.starterType}</span>
          </div>
        </div>
        <button 
          onClick={() => setView('proposal')}
          className="btn-primary"
        >
          Criar Proposta →
        </button>
      </div>

      {/* Main Stats Card */}
      <div className="card-panel">
        <h3 className="text-label uppercase tracking-widest mb-6">Resumo Técnico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          <div className="space-y-2">
            <p className="text-label uppercase tracking-widest text-[10px]">Corrente Nominal (In)</p>
            <p className="text-4xl font-bold text-foreground">{currentResults.nominalCurrent.toFixed(1)} <span className="text-lg font-medium text-muted-foreground">A</span></p>
          </div>
          <div className="space-y-2">
            <p className="text-label uppercase tracking-widest text-[10px]">Queda Calculada</p>
            <p className="text-4xl font-bold text-foreground">{currentResults.voltageDropCalculated ? currentResults.voltageDropCalculated.toFixed(2) : '0.00'} <span className="text-lg font-medium text-muted-foreground">%</span></p>
          </div>
          <div className="space-y-2 bg-primary/5 p-5 rounded-2xl border border-primary/10 lg:col-span-2">
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">Resultado Final (NBR 5410)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-result-value">{currentResults.finalCableSection}</p>
              <span className="text-2xl font-bold text-primary/60">mm²</span>
            </div>
            <p className="text-xs text-primary/80 mt-2 font-semibold">
              Critério Dominante: {currentResults.limitingCriterion === 'ampacity' ? 'Capacidade de Corrente' : 'Queda de Tensão'}
            </p>
          </div>
        </div>
        
        {currentInputs.dataSource === 'catalog' && currentInputs.motorCatalogData && (
          <div className="mt-8 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Carcaça</p>
              <p className="text-xl font-bold text-foreground">{currentInputs.motorCatalogData.frame || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Rotação</p>
              <p className="text-xl font-bold text-foreground">{currentInputs.motorCatalogData.rpm ? `${currentInputs.motorCatalogData.rpm} RPM` : '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Polos</p>
              <p className="text-xl font-bold text-foreground">{currentInputs.motorCatalogData.poles}P</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Tipo</p>
              <p className="text-xl font-bold text-foreground capitalize">{currentInputs.motorCatalogData.speedType.toLowerCase()}</p>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Por Ampacidade</p>
            <p className="text-xl font-bold text-foreground">{currentResults.cableByAmpacity} mm²</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Por Distância</p>
            <p className="text-xl font-bold text-foreground">{currentResults.cableByVoltageDrop} mm²</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Seção Mínima</p>
            <p className="text-xl font-bold text-foreground">2.5 mm²</p>
          </div>
        </div>
      </div>

      {/* Components Grid */}
      <div className="space-y-6">
        <h3 className="text-card-title">Componentes Dimensionados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Cable */}
          <div className="card-panel flex flex-col justify-between h-48 hover:border-primary transition-all group">
            <p className="text-label uppercase tracking-widest text-[10px]">Condutor</p>
            <div>
              <p className="text-2xl font-bold text-foreground">{currentResults.finalCableSection} mm²</p>
              <p className="text-metadata font-semibold mt-1">Cobre • PVC 70°C</p>
            </div>
          </div>

          {/* Breaker */}
          <div className="card-panel flex flex-col justify-between h-48 hover:border-primary transition-all group">
            <p className="text-label uppercase tracking-widest text-[10px]">Disjuntor</p>
            <div>
              <p className="text-xl font-bold text-foreground leading-tight mb-1">{currentResults.protections.breaker?.model || '—'}</p>
              <p className="text-metadata font-semibold text-primary">{currentResults.protections.breaker?.manufacturer || '—'}</p>
              <p className="text-metadata mt-1">{currentResults.protections.breaker?.nominalCurrent ? `${currentResults.protections.breaker.nominalCurrent} A` : 'Não encontrado'}</p>
            </div>
          </div>

          {/* Contactor */}
          <div className="card-panel flex flex-col justify-between h-48 hover:border-primary transition-all group">
            <p className="text-label uppercase tracking-widest text-[10px]">
              Contator {currentResults.protections.contactor && currentResults.protections.contactor.length > 1 ? `(x${currentResults.protections.contactor.length})` : ''}
            </p>
            <div>
              <p className="text-xl font-bold text-foreground leading-tight mb-1">{currentResults.protections.contactor?.[0]?.model || '—'}</p>
              <p className="text-metadata font-semibold text-primary">{currentResults.protections.contactor?.[0]?.manufacturer || '—'}</p>
              <p className="text-metadata mt-1">
                {currentResults.protections.contactor?.[0]?.nominalCurrent 
                  ? `${currentResults.protections.contactor[0].nominalCurrent} A (AC-3)${currentResults.protections.contactor.length > 1 ? ` • ${currentResults.protections.contactor.length} un` : ''}` 
                  : 'Não encontrado'}
              </p>
            </div>
          </div>

          {/* Thermal Relay */}
          <div className="card-panel flex flex-col justify-between h-48 hover:border-primary transition-all group">
            <p className="text-label uppercase tracking-widest text-[10px]">Relé Térmico</p>
            <div>
              <p className="text-xl font-bold text-foreground leading-tight mb-1">{currentResults.protections.thermalRelay?.model || '—'}</p>
              <p className="text-metadata font-semibold text-primary">{currentResults.protections.thermalRelay?.manufacturer || '—'}</p>
              <p className="text-metadata mt-1">{currentResults.protections.thermalRelay?.adjustmentRange ? `Faixa: ${currentResults.protections.thermalRelay.adjustmentRange.min}–${currentResults.protections.thermalRelay.adjustmentRange.max} A` : 'Não encontrado'}</p>
            </div>
          </div>

          {/* Timer Relay (Conditional) */}
          {currentResults.protections.timerRelay && (
            <div className="card-panel flex flex-col justify-between h-48 hover:border-primary transition-all group border-primary/20">
              <p className="text-label uppercase tracking-widest text-[10px]">Relé de Tempo</p>
              <div>
                <p className="text-xl font-bold text-foreground leading-tight mb-1">{currentResults.protections.timerRelay.model}</p>
                <p className="text-metadata font-semibold text-primary">{currentResults.protections.timerRelay.manufacturer}</p>
                <p className="text-metadata mt-1">{currentResults.protections.timerRelay.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 pt-10">
        <button 
          onClick={() => setView('proposal')}
          className="btn-primary w-full sm:w-80 h-16 text-xl shadow-xl shadow-primary/10"
        >
          Criar Proposta Comercial →
        </button>
        <p className="text-metadata text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" /> Dimensionamento em conformidade com NBR 5410
        </p>
      </div>
    </div>
  );
};
