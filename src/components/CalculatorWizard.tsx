import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CalculationInputs } from '@/types';
import { CalculationEngine } from '@/lib/engine/CalculationEngine';
import { ArrowLeft } from 'lucide-react';

export const CalculatorWizard = () => {
  const { setView, setCalculation } = useAppStore();
  
  const handleCalculate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const inputs: CalculationInputs = {
      power: parseFloat(formData.get('power') as string),
      powerUnit: formData.get('powerUnit') as any,
      voltage: parseFloat(formData.get('voltage') as string),
      phase: formData.get('phase') as any,
      distance: parseFloat(formData.get('distance') as string),
      starterType: formData.get('starterType') as any,
      maxVoltageDrop: parseFloat(formData.get('maxVoltageDrop') as string),
      preferredManufacturer: formData.get('manufacturer') as string || undefined,
      quantity: 1
    };

    if (isNaN(inputs.power) || inputs.power <= 0) {
      toast.error('Informe uma potência válida.');
      return;
    }

    try {
      const results = CalculationEngine.performFullCalculation(inputs);
      setCalculation(inputs, results);
      setView('results');
    } catch (error) {
      toast.error('Erro ao realizar o cálculo. Verifique os parâmetros.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Novo Dimensionamento</h2>
          <p className="text-slate-500">Preencha os dados técnicos do motor e da instalação.</p>
        </div>
        <button 
          onClick={() => setView('dashboard')}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </div>

      <form onSubmit={handleCalculate} className="card-panel shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <Label className="text-label uppercase tracking-wider">Potência do motor</Label>
            <div className="flex gap-2">
              <Input name="power" type="number" step="0.1" defaultValue="10" className="h-11 border-slate-200" required />
              <Select name="powerUnit" defaultValue="cv">
                <SelectTrigger className="h-11 w-24 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[100] bg-white border border-slate-200 shadow-lg min-w-[100px]">
                  <SelectItem value="cv">CV</SelectItem>
                  <SelectItem value="hp">HP</SelectItem>
                  <SelectItem value="kW">kW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-label uppercase tracking-wider">Tensão</Label>
            <Select name="voltage" defaultValue="380">
              <SelectTrigger className="h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100] bg-white border border-slate-200 shadow-lg min-w-[150px]">
                <SelectItem value="220">220 V</SelectItem>
                <SelectItem value="380">380 V</SelectItem>
                <SelectItem value="440">440 V</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-label uppercase tracking-wider">Sistema</Label>
            <Select name="phase" defaultValue="trifasico">
              <SelectTrigger className="h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100] bg-white border border-slate-200 shadow-lg min-w-[150px]">
                <SelectItem value="monofasico">Monofásico</SelectItem>
                <SelectItem value="trifasico">Trifásico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-label uppercase tracking-wider">Distância (metros)</Label>
            <Input name="distance" type="number" defaultValue="20" className="h-11 border-slate-200" required />
          </div>

          <div className="space-y-2 relative">
            <Label className="text-label uppercase tracking-wider">Tipo de partida</Label>
            <Select name="starterType" defaultValue="direta">
              <SelectTrigger className="h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100] bg-white border border-slate-200 shadow-lg min-w-[200px]">
                <SelectItem value="direta">Direta</SelectItem>
                <SelectItem value="reversao">Reversão</SelectItem>
                <SelectItem value="estrelaTriangulo">Estrela-Triângulo</SelectItem>
                <SelectItem value="softStarter">Soft Starter</SelectItem>
                <SelectItem value="inversor">Inversor de Frequência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-label uppercase tracking-wider">Fabricante Preferencial</Label>
            <Select name="manufacturer" defaultValue="WEG">
              <SelectTrigger className="h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100] bg-white border border-slate-200 shadow-lg min-w-[150px]">
                <SelectItem value="WEG">WEG</SelectItem>
                <SelectItem value="Schneider">Schneider</SelectItem>
                <SelectItem value="Siemens">Siemens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-label uppercase tracking-wider">Queda de tensão admissível (%)</Label>
            <Input name="maxVoltageDrop" type="number" step="0.1" defaultValue="4" className="h-11 border-slate-200" required />
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button type="submit" className="btn-primary w-full sm:w-auto px-10">
            Calcular Dimensionamento →
          </button>
        </div>
      </form>
    </div>
  );
};
