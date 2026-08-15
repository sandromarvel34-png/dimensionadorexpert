import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export const ResultsView = () => {
  const { currentResults, currentInputs, setView } = useAppStore();

  if (!currentResults || !currentInputs) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => setView('wizard')}
            className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <h1 className="text-3xl font-semibold text-slate-900">Resultado do Dimensionamento</h1>
          <div className="flex flex-wrap gap-x-3 text-metadata font-medium uppercase tracking-wider">
            <span>{currentInputs.power} {currentInputs.powerUnit}</span>
            <span className="text-slate-300">•</span>
            <span>{currentInputs.voltage} V</span>
            <span className="text-slate-300">•</span>
            <span>{currentInputs.phase}</span>
            <span className="text-slate-300">•</span>
            <span>{currentInputs.distance} m</span>
            <span className="text-slate-300">•</span>
            <span>Partida {currentInputs.starterType}</span>
          </div>
        </div>
        <button 
          onClick={() => setView('proposal')}
          className="btn-primary flex items-center gap-2"
        >
          Criar Proposta →
        </button>
      </div>

      {/* Main Stats Card */}
      <div className="card-panel">
        <h3 className="text-label uppercase tracking-widest mb-6">Resumo Técnico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <p className="text-metadata uppercase">Corrente Nominal</p>
            <p className="text-3xl font-bold text-slate-900">{currentResults.nominalCurrent.toFixed(1)} <span className="text-lg font-medium text-slate-400">A</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-metadata uppercase">Seção Final</p>
            <p className="text-3xl font-bold text-blue-600">{currentResults.finalCableSection} <span className="text-lg font-medium text-blue-300">mm²</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-metadata uppercase">Queda de Tensão</p>
            <p className="text-3xl font-bold text-slate-900">{currentResults.voltageDrop ? currentResults.voltageDrop.toFixed(2) : '0.00'} <span className="text-lg font-medium text-slate-400">%</span></p>
          </div>
          <div className="space-y-1">
            <p className="text-metadata uppercase">Critério Dominante</p>
            <p className="text-sm font-semibold text-blue-600 uppercase mt-2">{currentResults.limitingCriterion === 'ampacity' ? 'Capacidade de Corrente' : 'Queda de Tensão'}</p>
          </div>
        </div>
      </div>

      {/* Components Grid */}
      <div className="space-y-6">
        <h3 className="text-card-title">Componentes Dimensionados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Cable */}
          <div className="card-panel flex flex-col justify-between h-40 hover:border-blue-200 transition-colors">
            <p className="text-metadata uppercase">Condutor</p>
            <div>
              <p className="text-2xl font-bold text-slate-900">{currentResults.finalCableSection} mm²</p>
              <p className="text-metadata mt-1">Cobre • PVC</p>
            </div>
          </div>

          {/* Breaker */}
          <div className="card-panel flex flex-col justify-between h-40 hover:border-blue-200 transition-colors">
            <p className="text-metadata uppercase">Disjuntor</p>
            <div>
              <p className="text-xl font-bold text-slate-900">{currentResults.protections.breaker?.model || '—'}</p>
              <p className="text-metadata mt-1">{currentResults.protections.breaker?.manufacturer || '—'} • {currentResults.protections.breaker?.nominalCurrent ? `${currentResults.protections.breaker.nominalCurrent} A` : 'Não encontrado'}</p>
            </div>
          </div>

          {/* Contactor */}
          <div className="card-panel flex flex-col justify-between h-40 hover:border-blue-200 transition-colors">
            <p className="text-metadata uppercase">Contator</p>
            <div>
              <p className="text-xl font-bold text-slate-900">{currentResults.protections.contactor?.[0]?.model || '—'}</p>
              <p className="text-metadata mt-1">{currentResults.protections.contactor?.[0]?.manufacturer || '—'} • {currentResults.protections.contactor?.[0]?.nominalCurrent ? `${currentResults.protections.contactor[0].nominalCurrent} A` : 'Não encontrado'}</p>
            </div>
          </div>

          {/* Thermal Relay */}
          <div className="card-panel flex flex-col justify-between h-40 hover:border-blue-200 transition-colors">
            <p className="text-metadata uppercase">Relé Térmico</p>
            <div>
              <p className="text-xl font-bold text-slate-900">{currentResults.protections.thermalRelay?.model || '—'}</p>
              <p className="text-metadata mt-1">WEG • {currentResults.protections.thermalRelay?.adjustmentRange ? `${currentResults.protections.thermalRelay.adjustmentRange.min}–${currentResults.protections.thermalRelay.adjustmentRange.max} A` : 'Não encontrado'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 pt-10">
        <button 
          onClick={() => setView('proposal')}
          className="btn-primary w-full sm:w-80 h-14 text-lg shadow-xl shadow-blue-100"
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
