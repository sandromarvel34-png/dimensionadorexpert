import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, GraduationCap, Info, Shield, ShoppingCart, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import katex from 'katex';

export const ResultsView = () => {
  const { currentResults, currentInputs, setView } = useAppStore();

  if (!currentResults || !currentInputs) return null;

  const phaseLabel = currentInputs.phase === 'trifasico' ? '3φ' : '1φ';
  const limitingLabel = currentResults.limitingCriterion === 'ampacity'
    ? 'Ampacidade'
    : currentResults.limitingCriterion === 'voltageDrop'
      ? 'Queda de tensão'
      : currentResults.limitingCriterion === 'shortCircuit'
        ? 'Curto-circuito'
        : 'Seção mínima';

  return (
    <div className="page-shell space-y-8 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button
            onClick={() => setView('wizard')}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Revisar dados técnicos
          </button>
          <span className="eyebrow block mt-5">Resultado técnico</span>
          <h1 className="page-heading mt-2">Dimensionamento concluído</h1>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold">
              {currentInputs.power} {currentInputs.powerUnit} • {currentInputs.voltage} V
            </span>
            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold">
              {currentInputs.starterType}
            </span>
            <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold">
              {currentInputs.distance} m
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="status-pill border-emerald-200 bg-emerald-50 text-emerald-700 h-9 px-3">
            <CheckCircle2 className="w-4 h-4" /> Cálculo concluído
          </span>
          <Button onClick={() => setView('proposal')} className="h-12 px-6 font-semibold shadow-lg shadow-primary/15 group">
            Criar proposta comercial <ShoppingCart className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Shield className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <p className="eyebrow">Condutor recomendado</p>
              <p className="text-sm text-slate-500 mt-1">Maior seção entre os critérios avaliados</p>
            </div>
            <span className="status-pill border-blue-100 bg-blue-50 text-blue-700">{limitingLabel}</span>
          </div>
          <div className="flex items-end gap-3 mb-8">
            <span className="text-5xl md:text-7xl font-bold text-foreground leading-none">{currentResults.finalCableSection}</span>
            <span className="text-xl md:text-2xl font-semibold text-muted-foreground mb-2">mm²</span>
          </div>
          <div className={cn('grid grid-cols-2 gap-5 border-t border-slate-100 pt-8', currentResults.cableByShortCircuit ? 'md:grid-cols-5' : 'md:grid-cols-4')}>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Ampacidade</p>
              <p className="text-xl font-semibold">{currentResults.cableByAmpacity} mm²</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Seção por ΔV</p>
              <p className="text-xl font-semibold">{currentResults.cableByVoltageDrop} mm²</p>
              {currentResults.voltageDropRequiredSectionTheoretical !== undefined && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Teórica: {currentResults.voltageDropRequiredSectionTheoretical.toFixed(2)} mm²
                  {currentResults.voltageDropPreliminaryCommercialSection !== undefined
                    ? ` • Comercial inicial: ${currentResults.voltageDropPreliminaryCommercialSection} mm²`
                    : ''}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Queda calculada</p>
              <p className="text-xl font-semibold text-primary">{currentResults.voltageDropCalculated.toFixed(2)}%</p>
            </div>
            {currentResults.cableByShortCircuit && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Seção por Icc</p>
                <p className="text-xl font-semibold">{currentResults.cableByShortCircuit} mm²</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Critério limitante</p>
              <p className="text-base font-semibold">{limitingLabel}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] bg-slate-950 text-white p-6 md:p-7 shadow-sm">
          <h3 className="text-xs font-semibold text-primary mb-6">Resumo elétrico</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400 font-semibold" dangerouslySetInnerHTML={{ __html: katex.renderToString('I_n', { throwOnError: false }) }} />
              <span className="text-2xl font-bold">{currentResults.nominalCurrent.toFixed(1)} A</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400 font-semibold">Freq. / sistema</span>
              <span className="text-xl font-semibold">60 Hz / {phaseLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400 font-semibold" dangerouslySetInnerHTML={{ __html: katex.renderToString('I_b', { throwOnError: false }) }} />
              <span className="text-xl font-semibold">{(currentResults.nominalCurrent * (currentInputs.serviceFactor || 1)).toFixed(1)} A</span>
            </div>
            {currentResults.correctionFactors && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-semibold">Icorr</span>
                  <span className="text-xl font-semibold">{((currentResults.nominalCurrent * (currentInputs.serviceFactor || 1)) / currentResults.correctionFactors.combined).toFixed(1)} A</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-semibold">Ftemp × Fagrup × Fsolo</span>
                  <span className="text-sm font-semibold">{currentResults.correctionFactors.temperature.toFixed(2)} × {currentResults.correctionFactors.grouping.toFixed(2)} × {currentResults.correctionFactors.soilResistivity.toFixed(2)}</span>
                </div>
              </>
            )}
            {currentResults.shortCircuitCheckPerformed && currentInputs.shortCircuitCurrentKA !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400 font-semibold">Curto-circuito</span>
                <span className="text-sm font-semibold text-green-300">{currentInputs.shortCircuitCurrentKA.toFixed(2)} kA verificado termicamente</span>
              </div>
            )}
            {currentResults.voltageDropModel === 'acImpedanceRX' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-semibold">Modelo ΔV</span>
                  <span className="text-sm font-semibold">Rca + XL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-semibold">R / X</span>
                  <span className="text-sm font-semibold">{currentResults.voltageDropResistanceOhmKm?.toFixed(2)} / {currentResults.voltageDropReactanceOhmKm?.toFixed(2)} Ω/km</span>
                </div>
              </>
            )}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                <Info className="w-3 h-3" /> Referência técnica
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ampacidade e fatores de correção baseados nas tabelas configuradas da NBR 5410:2004. A queda de tensão usa Rca + XL de referência para cabo de cobre/PVC 70 °C a 60 Hz.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-blue-100 bg-blue-50/70 flex flex-col md:flex-row md:items-center gap-5 p-5 md:p-6">
        <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">Entenda como chegamos a esses resultados</h3>
          <p className="text-sm text-muted-foreground">Veja o cálculo passo a passo e os critérios utilizados no dimensionamento.</p>
        </div>
        <Button onClick={() => setView('educational')} variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-white font-semibold">
          Ver cálculo passo a passo
        </Button>
      </div>

      {!!currentResults.technicalLimitations?.length && (
        <div className="rounded-[16px] border border-amber-200 bg-amber-50/80 p-5">
          <div className="flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-950">Verificações complementares necessárias</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-amber-900 list-disc pl-5">
                {currentResults.technicalLimitations.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="section-card">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-7">
          <div>
            <span className="eyebrow">Componentes</span>
            <h2 className="text-2xl font-bold text-foreground tracking-tight mt-1">Referências de fabricantes</h2>
            <p className="text-sm text-muted-foreground mt-1">A base diferencia SKU conferido de família técnica que ainda depende da configuração final.</p>
          </div>
          <span className="status-pill border-slate-200 bg-slate-50 text-slate-600">WEG • Siemens • Schneider</span>
        </div>

        <div className="space-y-8">
          {currentResults.technicalRequirements.map((req, idx) => (
            <div key={idx} className="rounded-[16px] border border-slate-200 bg-slate-50/40 p-4 md:p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs">{idx + 1}</div>
                <h3 className="text-lg font-semibold text-foreground">{req.label}</h3>
                {req.isOptional && <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Opcional</span>}
                {req.current !== undefined && <span className="text-xs font-semibold text-primary">Requisito: {req.current.toFixed(1)} A</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {['WEG', 'Siemens', 'Schneider'].map((mfr) => {
                  const products = currentResults.compatibleProducts[req.label]?.[mfr] || [];
                  const product = products[0];
                  return (
                    <div key={mfr} className={cn('rounded-[14px] border p-4 transition-all', product ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-100/60 opacity-70')}>
                      <p className="text-xs font-semibold text-primary mb-2">{mfr}</p>
                      {product ? (
                        <>
                          <p className="text-lg font-semibold text-foreground leading-tight">{product.model}</p>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                          <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
                            {product.verificationStatus === 'verified-exact' ? (
                              <>
                                <p className="text-xs font-semibold text-green-700">SKU conferido em fonte oficial</p>
                                <p className="text-xs text-slate-500">Código: {product.commercialCode}</p>
                              </>
                            ) : (
                              <p className="text-xs font-medium text-amber-700">Família técnica validada. O código comercial exato depende da configuração.</p>
                            )}
                            {product.selectionNote && <p className="text-[11px] text-slate-500">{product.selectionNote}</p>}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-slate-400 italic py-4">Nenhuma referência compatível validada na base atual.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] bg-slate-950 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-white">Pronto para transformar o cálculo em proposta.</p>
          <p className="text-sm text-slate-400 max-w-2xl">
            A ferramenta apoia o dimensionamento, mas não substitui a verificação de curto-circuito, coordenação de proteção e responsabilidade técnica do profissional.
          </p>
        </div>
        <Button onClick={() => setView('proposal')} className="h-12 px-7 font-semibold shrink-0">
          Criar proposta comercial →
        </Button>
      </div>
    </div>
  );
};
