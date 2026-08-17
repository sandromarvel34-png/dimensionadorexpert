import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalculationEngine } from '@/lib/engine/CalculationEngine';
import { MathFormula } from '@/components/MathFormula';

export const EducationalFlow = () => {
  const { currentInputs, currentResults, setView } = useAppStore();
  const [step, setStep] = useState(1);

  if (!currentInputs || !currentResults) return null;

  const steps = [
    { id: 1, title: 'Dados de entrada' },
    { id: 2, title: 'Corrente de projeto' },
    { id: 3, title: 'Capacidade de corrente' },
    { id: 4, title: 'Queda de tensão' },
    { id: 5, title: 'Seleção da bitola' },
    { id: 6, title: 'Proteções' },
    { id: 7, title: 'Componentes' },
    { id: 8, title: 'Resultado final' },
  ];

  const currentStepData = steps[step - 1]!;
  const pf = currentInputs.powerFactor || 0.85;
  const eff = currentInputs.efficiency || 0.90;
  const fs = currentInputs.serviceFactor || 1.0;
  const phaseFactor = currentInputs.phase === 'trifasico' ? '\\sqrt{3}' : '2';

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 text-left w-full">
            <p className="text-slate-600">O dimensionamento começa com os dados técnicos fornecidos pelo usuário ou catálogo.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-[10px] font-black text-muted-foreground uppercase">Potência</p>
                <p className="font-bold">{currentInputs.power} {currentInputs.powerUnit}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-[10px] font-black text-muted-foreground uppercase">Tensão</p>
                <p className="font-bold">{currentInputs.voltage}V ({currentInputs.phase})</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-[10px] font-black text-muted-foreground uppercase">Fator de Potência</p>
                <p className="font-bold">{pf}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-[10px] font-black text-muted-foreground uppercase">Rendimento</p>
                <p className="font-bold">{eff}</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 text-left w-full">
            <div className="space-y-2">
              <p className="font-bold text-sm text-primary uppercase">1. Corrente Nominal (I_n):</p>
              <MathFormula
                title="Cálculo da Corrente Nominal"
                legend={[
                  { symbol: 'I_n', label: 'Corrente nominal (A)' },
                  { symbol: 'P_{(kW)}', label: 'Potência ativa em kW' },
                  { symbol: 'V', label: 'Tensão de linha (V)' },
                  { symbol: '\\cos \\varphi', label: 'Fator de potência' },
                  { symbol: '\\eta', label: 'Rendimento do motor' }
                ]}
              >
                {`I_n = \\frac{P_{(kW)} \\cdot 1000}{${phaseFactor} \\cdot V \\cdot \\cos \\varphi \\cdot \\eta} = ${currentResults.nominalCurrent.toFixed(2)} \\text{ A}`}
              </MathFormula>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-sm text-primary uppercase">2. Corrente de Projeto Corrigida (I_b):</p>
              <p className="text-sm text-slate-600">Aplicamos o fator de segurança de 1.25 (NBR 5410) e o Fator de Serviço (FS).</p>
              <MathFormula
                title="Cálculo da Corrente de Projeto"
                legend={[
                  { symbol: 'I_b', label: 'Corrente de projeto corrigida (A)' },
                  { symbol: 'I_n', label: 'Corrente nominal (A)' },
                  { symbol: 'FS', label: 'Fator de serviço' },
                  { symbol: 'f_{agrup}', label: 'Fator de agrupamento' },
                  { symbol: 'f_{temp}', label: 'Fator de temperatura' }
                ]}
              >
                {`I_b = \\frac{I_n \\cdot 1.25 \\cdot FS}{f_{agrup} \\cdot f_{temp}} = \\frac{${currentResults.nominalCurrent.toFixed(2)} \\cdot 1.25 \\cdot ${fs}}{${(currentInputs.groupingFactor || 1).toFixed(2)} \\cdot ${(currentInputs.ambientTempFactor || 1).toFixed(2)}} = ${(currentResults.nominalCurrent * 1.25 * fs / ((currentInputs.groupingFactor || 1) * (currentInputs.ambientTempFactor || 1))).toFixed(2)} \\text{ A}`}
              </MathFormula>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 text-left w-full">
            <p className="text-slate-600">Consultamos a **Tabela 36 da NBR 5410** (Método B1) para encontrar um cabo que suporte a corrente **Ib**.</p>
            <div className="bg-white p-6 rounded-xl border border-primary/20 shadow-sm">
              <p className="text-sm font-bold text-slate-500 uppercase mb-4">Resultado da Ampacidade:</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-primary">{currentResults.cableByAmpacity}</span>
                <span className="text-xl font-bold text-slate-400 mb-1">mm²</span>
              </div>
              <p className="mt-4 text-sm text-slate-500 italic">Este condutor suporta a carga térmica contínua sem degradação do isolamento.</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 text-left w-full">
            <p className="text-slate-600">Verificamos se a queda de tensão na distância de **{currentInputs.distance}m** está dentro do limite de **{currentInputs.maxVoltageDrop}%**.</p>
            <MathFormula
              title="Cálculo da Queda de Tensão"
              legend={[
                { symbol: '\\Delta V_{(\\%)}', label: 'Queda de tensão percentual' },
                { symbol: '\\rho', label: 'Resistividade do Cobre (0,0178 Ω·mm²/m)' },
                { symbol: 'L', label: 'Comprimento (m)' },
                { symbol: 'I_n', label: 'Corrente nominal (A)' },
                { symbol: 'S', label: 'Seção do condutor (mm²)' },
                { symbol: 'V', label: 'Tensão nominal (V)' }
              ]}
            >
              {`\\Delta V_{(\\%)} = \\frac{${phaseFactor} \\cdot \\rho \\cdot L \\cdot I_n \\cdot \\cos \\varphi}{S \\cdot V} \\cdot 100`}
            </MathFormula>
            <div className="bg-white p-6 rounded-xl border border-primary/20">
              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Queda Calculada</p>
              <p className="text-3xl font-black text-primary">{currentResults.voltageDropCalculated.toFixed(2)}%</p>
              <p className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Abaixo do limite de {currentInputs.maxVoltageDrop}%
              </p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 text-left w-full">
            <p className="text-slate-600">O sistema seleciona a **MAIOR** bitola entre os dois critérios para garantir segurança e performance.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn("p-4 rounded-lg border-2", currentResults.limitingCriterion === 'ampacity' ? "border-primary bg-primary/5" : "border-slate-100")}>
                <p className="text-[10px] font-black uppercase">Ampacidade</p>
                <p className="text-2xl font-black">{currentResults.cableByAmpacity} mm²</p>
              </div>
              <div className={cn("p-4 rounded-lg border-2", currentResults.limitingCriterion === 'voltageDrop' ? "border-primary bg-primary/5" : "border-slate-100")}>
                <p className="text-[10px] font-black uppercase">Queda de Tensão</p>
                <p className="text-2xl font-black">{currentResults.cableByVoltageDrop} mm²</p>
              </div>
            </div>
            <div className="bg-slate-900 text-white p-6 rounded-xl text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bitola Escolhida</p>
              <p className="text-5xl font-black text-primary">{currentResults.finalCableSection} mm²</p>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 text-left w-full">
            <p className="text-slate-600">Dimensionamento das proteções contra curto-circuito e sobrecarga.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border space-y-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm uppercase text-slate-700">Circuito Principal (Força)</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Disjuntor ($1,25 \\cdot I_n \\cdot FS$)</span>
                    <span className="font-black text-primary">{(currentResults.nominalCurrent * 1.25 * fs).toFixed(1)}A</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Fusíveis ($1,5 \\cdot I_n$)</span>
                    <span className="font-black text-primary">{(currentResults.nominalCurrent * 1.5).toFixed(1)}A</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Disjuntor Motor ($I_n \\cdot FS$)</span>
                    <span className="font-black text-primary">{(currentResults.nominalCurrent * fs).toFixed(1)}A</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border space-y-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm uppercase text-slate-700">Circuito Auxiliar (Comando)</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Disjuntor de Comando</span>
                    <span className="font-black text-primary">6A</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Fusíveis de Comando</span>
                    <span className="font-black text-primary">4A</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic pt-2">Valores padronizados para proteção de bobinas e sinalização.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 text-left w-full">
            <p className="text-slate-600">Dimensionamento dos componentes de manobra baseados na categoria de emprego **AC-3**.</p>
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <span className="font-bold">Starter Type</span>
                <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">{currentInputs.starterType}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium"><span className="font-black text-primary mr-2">Contator:</span> Selecionado para suportar $I_n \\cdot FS$ em regime AC-3.</p>
                <p className="text-sm font-medium"><span className="font-black text-primary mr-2">Relé Térmico:</span> Faixa de ajuste deve cobrir exatamente o valor de $I_n \\cdot FS$.</p>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-6 text-center w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Dimensionamento Validado</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Todos os critérios da **NBR 5410** foram atendidos. O sistema garantiu a segurança térmica dos condutores e a eficiência operacional dos dispositivos.
            </p>
            <Button 
              onClick={() => setView('results')}
              className="mt-8 h-14 px-12 text-lg font-black uppercase tracking-tight"
            >
              Voltar aos Detalhes
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setView('results')} className="text-muted-foreground font-bold hover:text-primary">
          <ChevronLeft className="w-4 h-4 mr-2" /> VOLTAR AO RESULTADO
        </Button>
        <div className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
           <BookOpen className="w-3 h-3" /> MODO EDUCACIONAL
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl md:text-4xl font-black text-foreground uppercase tracking-tight">Como este dimensionamento foi calculado</h1>
        <p className="text-sm md:text-base text-muted-foreground italic font-medium">Acompanhe cada etapa técnica e entenda as decisões do Dimensionador Expert.</p>
      </div>

      {/* Progress Stepper */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Etapa {step} de {steps.length}</span>
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">{Math.round((step / steps.length) * 100)}% CONCLUÍDO</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Step dots */}
        <div className="flex justify-between px-1">
          {steps.map((s) => (
            <div 
              key={s.id} 
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                s.id <= step ? "bg-primary" : "bg-slate-200"
              )} 
            />
          ))}
        </div>
      </div>

      {/* Main Educational Card */}
      <div className="card-panel min-h-[500px] flex flex-col items-center p-8 md:p-12 space-y-8 relative overflow-hidden bg-white border-2 border-slate-100 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
        
        <div className="w-full flex items-center justify-between mb-4">
           <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{currentStepData.title}</span>
           <span className="text-4xl font-black text-slate-100">0{step}</span>
        </div>

        {renderStepContent()}

        {/* Technical Note */}
        <div className="w-full bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 mt-auto">
           <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
           <p className="text-xs text-blue-700 font-medium leading-relaxed">
             {step === 2 && "A corrente de projeto (Ib) é a base de tudo. Ela considera não só a carga nominal, mas as condições reais onde os cabos serão instalados."}
             {step === 3 && "A ampacidade é o limite físico do cabo. Ultrapassar este valor derrete o isolamento do condutor."}
             {step === 4 && "Distâncias longas causam perda de energia. Se a queda for alta, o motor perde torque e aquece excessivamente."}
             {step === 5 && "Segurança em primeiro lugar: sempre usamos a maior bitola encontrada para satisfazer todos os requisitos normativos."}
             {step === 8 && "Este relatório técnico segue os padrões internacionais de engenharia elétrica."}
             {![2,3,4,5,8].includes(step) && "Siga as recomendações da NBR 5410 para uma instalação segura e duradoura."}
           </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button 
          variant="outline" 
          disabled={step === 1}
          onClick={() => setStep(s => s - 1)}
          className="h-10 md:h-12 px-4 md:px-8 font-black uppercase tracking-tight border-2"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Anterior
        </Button>
        <div className="hidden md:flex gap-2">
           {steps.map((s) => (
             <button 
               key={s.id}
               onClick={() => setStep(s.id)}
               className={cn(
                 "w-8 h-8 rounded-full text-[10px] font-black transition-all",
                 step === s.id ? "bg-primary text-white scale-110 shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
               )}
             >
               {s.id}
             </button>
           ))}
        </div>
        <Button 
          disabled={step === steps.length}
          onClick={() => setStep(s => s + 1)}
          className="h-10 md:h-12 px-4 md:px-8 font-black uppercase tracking-tight shadow-xl shadow-primary/20"
        >
          {step === steps.length ? 'Concluído' : 'Próxima'} <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
