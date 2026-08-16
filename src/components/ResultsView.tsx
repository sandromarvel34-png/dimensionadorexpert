import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, CheckCircle2, Factory, Shield, Info, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { ManufacturerProduct } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const ResultsView = () => {
  const { currentResults, currentInputs, setView, selectedManufacturer, setSelectedManufacturer } = useAppStore();

  if (!currentResults || !currentInputs) return null;

  const handleSelectManufacturer = (mfr: 'WEG' | 'Siemens' | 'Schneider') => {
    setSelectedManufacturer(mfr);
  };

  const goToProposal = () => {
    setView('proposal');

    // Armazenar no estado (ou passar para o ProposalFlow)
    // Opcionalmente podemos salvar no Zustand
    setView('proposal');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <button 
            onClick={() => setView('wizard')}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> REVISAR DADOS TÉCNICOS
          </button>
          <h1 className="text-4xl font-black text-foreground tracking-tight uppercase">Dimensionamento Concluído</h1>
          <div className="flex flex-wrap gap-2">
            <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              {currentInputs.power} {currentInputs.powerUnit} • {currentInputs.voltage}V
            </span>
            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Partida {currentInputs.starterType}
            </span>
            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              {currentInputs.distance} m
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status da Solução</p>
            <p className="text-sm font-bold text-green-600 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-4 h-4" /> 100% Compatível NBR 5410
            </p>
          </div>
          <Button 
            onClick={goToProposal}
            className="h-14 px-8 text-lg font-black uppercase tracking-tight shadow-xl shadow-primary/20 group"
          >
            Criar Orçamento <ShoppingCart className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Cable Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Shield className="w-32 h-32" />
          </div>
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Condutor Recomendado</h3>
          <div className="flex items-end gap-4 mb-8">
            <span className="text-7xl font-black text-foreground leading-none">{currentResults.finalCableSection}</span>
            <span className="text-2xl font-black text-muted-foreground mb-2">mm²</span>
          </div>
          <div className="grid grid-cols-3 gap-8 border-t border-slate-100 pt-8">
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pela Corrente</p>
              <p className="text-xl font-bold">{currentResults.cableByAmpacity} mm²</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pela Distância</p>
              <p className="text-xl font-bold">{currentResults.cableByVoltageDrop} mm²</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Queda Final</p>
              <p className="text-xl font-bold text-primary">{currentResults.voltageDropCalculated.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        <div className="card-panel bg-slate-900 text-white border-0">
          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Resumo Elétrico</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">Corrente (In)</span>
              <span className="text-2xl font-black">{currentResults.nominalCurrent.toFixed(1)} A</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">Freq. / Sistema</span>
              <span className="text-xl font-bold">60Hz / 3φ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">Carga Máxima Ib</span>
              <span className="text-xl font-bold">{(currentResults.nominalCurrent * 1.25).toFixed(1)} A</span>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Info className="w-3 h-3" /> Referência Técnica
              </p>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                Cálculos baseados na NBR 5410:2004 para métodos de instalação B1 e fatores de correção aplicados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Base de Fabricantes Compatíveis</h2>
        </div>

        <div className="space-y-12">
          {currentResults.technicalRequirements.map((req, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{req.label}</h3>
                {req.isOptional && (
                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">Opcional</span>
                )}
                {req.current && (
                  <span className="text-[9px] font-black text-primary uppercase">Requisito: {req.current.toFixed(1)}A</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['WEG', 'Siemens', 'Schneider'].map(mfr => {
                  const products = currentResults.compatibleProducts[req.label]?.[mfr] || [];
                  const product = products[0];
                  const isMfrSelected = true; // No ResultView, we show all as compatible but don't force a single selection UI anymore

                  return (
                    <div 
                      key={mfr}
                      className={cn(
                        "card-panel border-2 transition-all relative group",
                        product 
                          ? "border-slate-200 bg-white"
                          : "border-slate-100 bg-slate-50/50 grayscale opacity-40 cursor-not-allowed"
                      )}
                    >
                      
                      <div className="mb-4">
                        <p className={cn(
                          "text-[9px] font-black uppercase tracking-[0.2em] mb-1",
                          mfr === 'WEG' ? "text-primary" : mfr === 'Siemens' ? "text-blue-600" : "text-green-600"
                        )}>
                          {mfr}
                        </p>
                        {product ? (
                          <>
                            <p className="text-lg font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                              {product.model}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-bold mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs font-bold text-slate-400 italic py-4">
                            Nenhum produto compatível encontrado na base {mfr}.
                          </p>
                        )}
                      </div>

                      {product && (
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Código</p>
                            <p className="text-xs font-bold text-foreground">{product.commercialCode}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 text-green-600">
                              ✓ Compatível
                            </p>
                            <p className="text-xs font-bold text-foreground">
                              Atende aos requisitos
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-12 border-t border-slate-200 flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <p className="text-lg font-black text-foreground uppercase tracking-tight">Solução Técnica Validada</p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Ao prosseguir, você irá para a revisão final onde poderá editar quantidades, adicionar mão de obra e incluir os dados do cliente para a proposta comercial.
          </p>
        </div>
        <Button 
          onClick={goToProposal}
          className="h-20 px-16 text-2xl font-black uppercase tracking-tight shadow-2xl shadow-primary/30"
        >
          Criar Orçamento →
        </Button>
      </div>
    </div>
  );
};