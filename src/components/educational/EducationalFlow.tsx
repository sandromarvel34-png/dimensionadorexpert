import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle2, TriangleAlert } from 'lucide-react';
import { MathFormula } from '@/components/MathFormula';

const arrangementLabel: Record<string, string> = {
  adjacent: 'Condutores carregados, justapostos',
  multipolar: 'Cabo multipolar',
  spaced2D: 'Condutores carregados, no mesmo plano, espaçados',
  spaced13cm: 'Condutores carregados, no mesmo plano, espaçados',
  spaced20cm: 'Condutores carregados, no mesmo plano, espaçados',
  trefoil: 'Três condutores carregados, em trifólio',
};

export const EducationalFlow = () => {
  const { currentInputs, currentResults, setView } = useAppStore();
  const [step, setStep] = useState(1);

  if (!currentInputs || !currentResults) return null;

  const steps = [
    'Dados de entrada',
    'Corrente de projeto',
    'Capacidade de corrente',
    'Queda de tensão',
    'Seleção da bitola',
    'Proteções',
    'Componentes',
    'Resultado final',
  ];

  const pf = currentInputs.powerFactor ?? 0.85;
  const eff = currentInputs.efficiency ?? 0.90;
  const fs = currentInputs.serviceFactor ?? 1.0;
  const ib = currentResults.nominalCurrent * fs;
  const combinedFactor = currentResults.correctionFactors?.combined ?? 1;
  const correctedCurrent = ib / combinedFactor;
  const phaseFactor = currentInputs.phase === 'trifasico' ? '\\sqrt{3}' : '1';
  const limitingLabel = currentResults.limitingCriterion === 'ampacity'
    ? 'ampacidade'
    : currentResults.limitingCriterion === 'voltageDrop'
      ? 'queda de tensão'
      : currentResults.limitingCriterion === 'shortCircuit'
        ? 'curto-circuito'
        : 'seção mínima';

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 text-left">
            <p className="text-slate-600">O cálculo começa com os dados do motor e com as condições reais informadas para a instalação.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ['Potência', `${currentInputs.power} ${currentInputs.powerUnit}`],
                ['Tensão', `${currentInputs.voltage} V`],
                ['Sistema', currentInputs.phase === 'trifasico' ? 'Trifásico' : 'Monofásico'],
                ['Distância', `${currentInputs.distance} m`],
                ['cos φ', pf.toFixed(2)],
                ['Rendimento', eff.toFixed(2)],
                ['FS', fs.toFixed(2)],
                ['Método', currentInputs.installationMethod || '—'],
              ].map(([label, value]) => (
                <div key={label} className="bg-white p-4 rounded-lg border shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  <p className="font-semibold mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-left">
            <MathFormula
              title="Corrente nominal"
              legend={[
                { symbol: 'I_n', label: 'Corrente nominal' },
                { symbol: 'P', label: 'Potência ativa' },
                { symbol: 'V', label: 'Tensão' },
                { symbol: '\\cos\\varphi', label: 'Fator de potência' },
                { symbol: '\\eta', label: 'Rendimento' },
              ]}
            >
              {currentInputs.phase === 'trifasico'
                ? `I_n = \\frac{P}{${phaseFactor} \\cdot V \\cdot \\cos\\varphi \\cdot \\eta} = ${currentResults.nominalCurrent.toFixed(2)}\\,A`
                : `I_n = \\frac{P}{V \\cdot \\cos\\varphi \\cdot \\eta} = ${currentResults.nominalCurrent.toFixed(2)}\\,A`}
            </MathFormula>
            <MathFormula
              title="Corrente de projeto"
              legend={[
                { symbol: 'I_b', label: 'Corrente de projeto' },
                { symbol: 'FS', label: 'Fator de serviço informado' },
              ]}
            >
              {`I_b = I_n \\cdot FS = ${currentResults.nominalCurrent.toFixed(2)} \\cdot ${fs.toFixed(2)} = ${ib.toFixed(2)}\\,A`}
            </MathFormula>
            <MathFormula
              title="Corrente corrigida para a tabela de ampacidade"
              legend={[
                { symbol: 'F_{temp}', label: 'Fator de correção de temperatura' },
                { symbol: 'F_{agrup}', label: 'Fator de correção de agrupamento' },
                { symbol: 'F_{solo}', label: 'Fator de resistividade térmica do solo (quando aplicável)' },
              ]}
            >
              {`I_{corr} = \\frac{I_b}{F_{temp} \\cdot F_{agrup} \\cdot F_{solo}} = \\frac{${ib.toFixed(2)}}{${(currentResults.correctionFactors?.temperature ?? 1).toFixed(2)} \\cdot ${(currentResults.correctionFactors?.grouping ?? 1).toFixed(2)} \\cdot ${(currentResults.correctionFactors?.soilResistivity ?? 1).toFixed(2)}} = ${correctedCurrent.toFixed(2)}\\,A`}
            </MathFormula>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-left">
            <p className="text-slate-600">Depois de obter a corrente corrigida, o sistema consulta a tabela de capacidade de condução correspondente ao método de instalação e ao número de condutores carregados. A seção escolhida precisa ter capacidade de condução igual ou superior à corrente corrigida.</p>
            <MathFormula
              title="Critério da seção por ampacidade"
              legend={[
                { symbol: 'I_z', label: 'Capacidade de condução de corrente da seção escolhida' },
                { symbol: 'I_{corr}', label: 'Corrente de projeto corrigida pelos fatores aplicáveis' },
              ]}
            >
              {`I_z \\geq I_{corr} = ${correctedCurrent.toFixed(2)}\\,A \\quad \\Rightarrow \\quad S_{amp} = ${currentResults.cableByAmpacity}\\,mm^2`}
            </MathFormula>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border"><p className="text-xs text-muted-foreground">Temperatura</p><p className="font-semibold">{currentResults.correctionFactors?.temperature.toFixed(2) ?? '1,00'}</p></div>
              <div className="bg-white p-4 rounded-lg border"><p className="text-xs text-muted-foreground">Agrupamento</p><p className="font-semibold">{currentResults.correctionFactors?.grouping.toFixed(2) ?? '1,00'}</p></div>
              <div className="bg-white p-4 rounded-lg border"><p className="text-xs text-muted-foreground">Solo</p><p className="font-semibold">{currentResults.correctionFactors?.soilResistivity.toFixed(2) ?? '1,00'}</p></div>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20"><p className="text-xs text-muted-foreground">Seção por ampacidade</p><p className="text-2xl font-bold text-primary">{currentResults.cableByAmpacity} mm²</p></div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-left">
            <p className="text-slate-600">Em cálculos manuais simplificados, a seção transversal pode ser estimada diretamente pela resistividade do cobre. No motor atual do aplicativo, porém, a verificação final de queda de tensão é mais completa: cada seção comercial é testada usando resistência em CA (Rca), reatância indutiva (XL) e fator de potência.</p>
            <MathFormula
              title="1. Cálculo da seção transversal pelo critério de queda de tensão"
              legend={[
                { symbol: 'S_{\\Delta V}', label: 'Seção transversal teórica calculada' },
                { symbol: '\\rho', label: 'Resistividade do cobre a 70 °C' },
                { symbol: 'L', label: 'Comprimento do circuito' },
                { symbol: '\\Delta V_{\\%}', label: 'Queda de tensão admissível em %' },
              ]}
            >
              {currentInputs.phase === 'trifasico'
                ? `S_{\\Delta V} = \\frac{100 \\sqrt{3} \\cdot \\rho \\cdot L \\cdot I_b \\cdot \\cos\\varphi}{\\Delta V_{\\%} \\cdot V} = ${(currentResults.voltageDropRequiredSectionTheoretical ?? 0).toFixed(2)}\\,mm^2`
                : `S_{\\Delta V} = \\frac{200 \\cdot \\rho \\cdot L \\cdot I_b \\cdot \\cos\\varphi}{\\Delta V_{\\%} \\cdot V} = ${(currentResults.voltageDropRequiredSectionTheoretical ?? 0).toFixed(2)}\\,mm^2`}
            </MathFormula>
            <div className="rounded-xl border bg-muted/20 p-4 text-sm text-slate-700">
              <p><strong>Seção teórica:</strong> {(currentResults.voltageDropRequiredSectionTheoretical ?? 0).toFixed(2)} mm²</p>
              <p><strong>Primeira seção comercial:</strong> {currentResults.voltageDropPreliminaryCommercialSection ?? currentResults.cableByVoltageDrop} mm²</p>
            </div>
            <MathFormula
              title="2. Verificação da queda de tensão da seção comercial"
              legend={[
                { symbol: 'R', label: 'Resistência elétrica em CA do condutor (Ω/km)' },
                { symbol: 'X_L', label: 'Reatância indutiva da linha (Ω/km)' },
                { symbol: 'L', label: 'Comprimento do circuito (km)' },
                { symbol: 'I_b', label: 'Corrente de projeto' },
              ]}
            >
              {currentInputs.phase === 'trifasico'
                ? `\\Delta V = \\sqrt{3} \\cdot (R\\cos\\varphi + X_L\\sin\\varphi) \\cdot I_b \\cdot L`
                : `\\Delta V = 2 \\cdot (R\\cos\\varphi + X_L\\sin\\varphi) \\cdot I_b \\cdot L`}
            </MathFormula>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs text-muted-foreground">Rca utilizado</p>
                <p className="text-xl font-semibold">{currentResults.voltageDropResistanceOhmKm?.toFixed(2)} Ω/km</p>
              </div>
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs text-muted-foreground">XL utilizado</p>
                <p className="text-xl font-semibold">{currentResults.voltageDropReactanceOhmKm?.toFixed(2)} Ω/km</p>
              </div>
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-xs text-muted-foreground">Disposição dos condutores</p>
                <p className="text-sm font-semibold">
                  {currentResults.voltageDropArrangementUsed
                    ? arrangementLabel[currentResults.voltageDropArrangementUsed] || '—'
                    : '—'}
                </p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border">
              <p className="text-sm text-muted-foreground">Seção final após verificação da queda de tensão</p>
              <p className="text-3xl font-bold text-primary mt-1">{currentResults.cableByVoltageDrop} mm²</p>
              <p className="text-sm text-slate-600 mt-2">
                Queda calculada: {currentResults.voltageDropCalculated.toFixed(2)}% (limite informado: {currentInputs.maxVoltageDrop}%).
                {currentResults.voltageDropPreliminaryCommercialSection !== undefined &&
                 currentResults.voltageDropPreliminaryCommercialSection !== currentResults.cableByVoltageDrop
                  ? ` A seção comercial inicial de ${currentResults.voltageDropPreliminaryCommercialSection} mm² não atendeu à verificação R+X, por isso o sistema avançou para ${currentResults.cableByVoltageDrop} mm².`
                  : ' A primeira seção comercial calculada atendeu à verificação R+X.'}
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-left">
            <p className="text-slate-600">A seção final é a maior entre ampacidade, queda de tensão, seção mínima e, quando Icc/tempo são informados, o critério térmico de curto-circuito.</p>
            <div className={`grid grid-cols-1 gap-4 ${currentResults.cableByShortCircuit ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <div className="p-4 rounded-lg border"><p className="text-xs text-muted-foreground">Ampacidade</p><p className="text-2xl font-bold">{currentResults.cableByAmpacity} mm²</p></div>
              <div className="p-4 rounded-lg border"><p className="text-xs text-muted-foreground">Queda de tensão</p><p className="text-2xl font-bold">{currentResults.cableByVoltageDrop} mm²</p></div>
              <div className="p-4 rounded-lg border"><p className="text-xs text-muted-foreground">Seção mínima</p><p className="text-2xl font-bold">2,5 mm²</p></div>
              {currentResults.cableByShortCircuit && (
                <div className="p-4 rounded-lg border"><p className="text-xs text-muted-foreground">Curto-circuito</p><p className="text-2xl font-bold">{currentResults.cableByShortCircuit} mm²</p></div>
              )}
            </div>
            <div className="bg-slate-900 text-white p-6 rounded-xl text-center">
              <p className="text-sm text-slate-400">Critério limitante: {limitingLabel}</p>
              <p className="text-5xl font-bold text-primary mt-2">{currentResults.finalCableSection} mm²</p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 text-left">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex gap-3">
              <TriangleAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-950">Proteção principal ainda requer verificação complementar</h3>
                <p className="text-sm text-amber-900 mt-1">O aplicativo não seleciona automaticamente a proteção de curto-circuito sem Icc, Icu/Icn, curva e dados de coordenação. Isso evita apresentar uma proteção como “validada” sem os dados necessários.</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border">
              <p className="font-semibold">Circuito de comando</p>
              <p className="text-sm text-slate-600 mt-2">A base inclui referência de disjuntor auxiliar de 6 A. A aplicação final deve ser conferida conforme tensão de comando e cargas conectadas.</p>
            </div>
          </div>
        );

      case 7: {
        const starter = currentInputs.starterType;
        const lines: string[] = [];
        if (starter === 'direta') lines.push(`1 contator com referência de corrente ≥ ${ib.toFixed(1)} A`, `1 relé térmico cuja faixa cubra ${ib.toFixed(1)} A`);
        if (starter === 'reversao') lines.push(`2 contatores com referência de corrente ≥ ${ib.toFixed(1)} A`, `1 relé térmico cuja faixa cubra ${ib.toFixed(1)} A`);
        if (starter === 'estrelaTriangulo') lines.push(`Contatores K1/K2: referência ≥ ${(ib * 0.58).toFixed(1)} A`, `Contator K3: referência ≥ ${(ib * 0.33).toFixed(1)} A`, `Relé térmico: faixa cobrindo ${(ib * 0.58).toFixed(1)} A`, 'Relé de tempo estrela-triângulo');
        if (starter === 'softStarter') lines.push(`Soft-starter: corrente nominal ≥ ${ib.toFixed(1)} A; confirmar tensão e coordenação no manual do fabricante`);
        if (starter === 'inversor') lines.push(`Inversor: corrente nominal de saída ≥ ${ib.toFixed(1)} A; confirmar tensão, sobrecarga e aplicação no manual do fabricante`);
        return (
          <div className="space-y-6 text-left">
            <p className="text-slate-600">A base de componentes é usada como referência inicial. Modelo, tensão, categoria de utilização e código comercial precisam ser confirmados no catálogo vigente.</p>
            <div className="bg-white p-6 rounded-xl border space-y-3">
              {lines.map((line) => <div key={line} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /><p className="text-sm">{line}</p></div>)}
            </div>
          </div>
        );
      }

      case 8:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-700"><CheckCircle2 className="w-10 h-10" /></div>
            <h3 className="text-2xl font-bold text-foreground">Cálculo concluído</h3>
            <p className="text-slate-600 max-w-xl mx-auto">Foram calculados corrente nominal, corrente de projeto, ampacidade com fatores de correção, seção mínima e queda de tensão pelo modelo informado.{currentResults.shortCircuitCheckPerformed ? ' A verificação térmica do cabo sob curto-circuito também foi incluída com os dados informados.' : ' A verificação térmica de curto-circuito depende de Icc e tempo de atuação.'} A capacidade de interrupção e a coordenação final da proteção permanecem como verificações do profissional.</p>
            <Button onClick={() => setView('results')} className="mt-4">Voltar aos resultados</Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-7">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setView('results')} className="text-muted-foreground font-semibold hover:text-primary">
          <ChevronLeft className="w-4 h-4 mr-2" /> Voltar ao resultado
        </Button>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
          <BookOpen className="w-3 h-3" /> Modo educacional
        </div>
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <span className="eyebrow">Memorial de cálculo</span>
        <h1 className="page-heading mt-2">Como este dimensionamento foi calculado</h1>
        <p className="text-sm md:text-base text-slate-500 mt-2">Percorra cada etapa para entender os dados, fórmulas e critérios usados no resultado.</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500">Etapa {step} de {steps.length}</span>
          <span className="text-xs font-semibold text-primary">{steps[step - 1]}</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / steps.length) * 100}%` }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {steps.map((label, index) => {
            const indexStep = index + 1;
            return (
              <button
                key={label}
                onClick={() => setStep(indexStep)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${indexStep === step
                  ? 'border-blue-200 bg-blue-50 text-primary'
                  : indexStep < step
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'}`}
              >
                {indexStep}. {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[18px] border border-slate-200 bg-white p-5 md:p-8 shadow-sm min-h-[420px] flex flex-col justify-center">{renderStep()}</div>

      <div className="flex justify-between gap-3 sticky bottom-4 rounded-[14px] border border-slate-200 bg-white/95 backdrop-blur p-2 shadow-lg">
        <Button variant="outline" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}><ChevronLeft className="w-4 h-4 mr-2" /> Anterior</Button>
        <Button onClick={() => step === steps.length ? setView('results') : setStep((value) => Math.min(steps.length, value + 1))}>
          {step === steps.length ? 'Concluir' : 'Próxima'} {step < steps.length && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
};
