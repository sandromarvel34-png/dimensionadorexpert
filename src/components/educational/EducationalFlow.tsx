import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EducationalFlow = () => {
  const { currentInputs, currentResults, setView } = useAppStore();
  const [step, setStep] = useState(1);

  if (!currentInputs || !currentResults) return null;

  const steps = [
    { id: 1, title: 'Dados de entrada', component: 'Resumo dos dados básicos do motor.' },
    { id: 2, title: 'Corrente de projeto', component: 'Cálculo da corrente nominal e fatores de correção.' },
    { id: 3, title: 'Capacidade de corrente', component: 'Análise da bitola pela ampacidade.' },
    { id: 4, title: 'Queda de tensão', component: 'Cálculo e verificação da queda de tensão.' },
    { id: 5, title: 'Seleção da bitola', component: 'Critério final de bitola.' },
    { id: 6, title: 'Proteções', component: 'Dimensionamento de disjuntores e fusíveis.' },
    { id: 7, title: 'Componentes', component: 'Seleção de contatores e relés.' },
    { id: 8, title: 'Resultado final', component: 'Conclusão.' },
  ];

  const currentStepData = steps[step - 1];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <Button variant="ghost" onClick={() => setView('results')} className="mb-4">
        <ChevronLeft className="w-4 h-4 mr-2" /> Voltar ao Resultado
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-foreground">Como este dimensionamento foi calculado</h1>
        <p className="text-muted-foreground italic">Acompanhe cada etapa do cálculo e entenda por que o sistema chegou a este resultado.</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-black uppercase text-slate-500">
          <span>Etapa {step} de {steps.length}</span>
          <span>{Math.round((step / steps.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="card-panel min-h-[400px] flex flex-col items-center justify-center text-center p-12 space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tight">{currentStepData.title}</h2>
        <p className="text-lg text-slate-600">{currentStepData.component}</p>
        
        {/* Step-specific explanation logic would go here */}
        <div className="w-full bg-slate-50 p-6 rounded-xl border border-slate-100 text-left space-y-2">
           <p className="font-bold text-sm text-slate-500 uppercase">Fórmula aplicada:</p>
           <code className="text-sm bg-white p-2 border rounded block">
             Ib = (In * 1.25 * FS) / (fGroup * fTemp)
           </code>
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          disabled={step === 1}
          onClick={() => setStep(s => s - 1)}
        >
          Anterior
        </Button>
        <Button 
          disabled={step === steps.length}
          onClick={() => setStep(s => s + 1)}
        >
          Próximo <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
