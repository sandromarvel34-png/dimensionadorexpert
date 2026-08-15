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
      groupingFactor: parseFloat(formData.get('groupingFactor') as string) || 1.0,
      ambientTempFactor: parseFloat(formData.get('tempFactor') as string) || 1.0,
      powerFactor: parseFloat(formData.get('powerFactor') as string) || 0.86,
      serviceFactor: parseFloat(formData.get('serviceFactor') as string) || 1.0,
      efficiency: parseFloat(formData.get('efficiency') as string) || 0.85,
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
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10 flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Novo Dimensionamento</h2>
          <p className="text-muted-foreground text-lg">Informe os parâmetros técnicos da carga e instalação.</p>
        </div>
        <button 
          onClick={() => setView('dashboard')}
          className="btn-secondary"
        >
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
      </div>

      <form onSubmit={handleCalculate} className="card-panel">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-2">
            <Label className="text-label uppercase tracking-widest text-[11px]">Potência do motor</Label>
            <div className="flex gap-2">
              <Input name="power" type="number" step="0.1" defaultValue="5" required />
              <Select name="powerUnit" defaultValue="cv">
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="cv">CV</SelectItem>
                  <SelectItem value="hp">HP</SelectItem>
                  <SelectItem value="kW">kW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-label uppercase tracking-widest text-[11px]">Tensão (V)</Label>
            <Select name="voltage" defaultValue="220">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="220">220 V</SelectItem>
                <SelectItem value="380">380 V</SelectItem>
                <SelectItem value="440">440 V</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-label uppercase tracking-widest text-[11px]">Sistema</Label>
            <Select name="phase" defaultValue="trifasico">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="monofasico">Monofásico</SelectItem>
                <SelectItem value="trifasico">Trifásico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-label uppercase tracking-widest text-[11px]">Distância (metros)</Label>
            <Input name="distance" type="number" defaultValue="5" required />
          </div>

          <div className="space-y-2 relative">
            <Label className="text-label uppercase tracking-widest text-[11px]">Tipo de partida</Label>
            <Select name="starterType" defaultValue="direta">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="direta">Direta</SelectItem>
                <SelectItem value="reversao">Reversão</SelectItem>
                <SelectItem value="estrelaTriangulo">Estrela-Triângulo</SelectItem>
                <SelectItem value="softStarter">Soft Starter</SelectItem>
                <SelectItem value="inversor">Inversor de Frequência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-label uppercase tracking-widest text-[11px]">Fabricante Preferencial</Label>
            <Select name="manufacturer" defaultValue="WEG">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="WEG">WEG</SelectItem>
                <SelectItem value="Schneider">Schneider</SelectItem>
                <SelectItem value="Siemens">Siemens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-label uppercase tracking-widest text-[11px]">Queda Admissível (%)</Label>
            <Input name="maxVoltageDrop" type="number" step="0.1" defaultValue="2" required />
          </div>
          <div className="space-y-2 relative">
            <Label className="text-label uppercase tracking-widest text-[11px]">Agrupamento</Label>
            <Select name="groupingFactor" defaultValue="1.0">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="1.0">1 Circuito (1.00)</SelectItem>
                <SelectItem value="0.8">2 Circuitos (0.80)</SelectItem>
                <SelectItem value="0.7">3 Circuitos (0.70)</SelectItem>
                <SelectItem value="0.65">4 Circuitos (0.65)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-label uppercase tracking-widest text-[11px]">Temperatura</Label>
            <Select name="tempFactor" defaultValue="1.0">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="1.06">25°C (1.06)</SelectItem>
                <SelectItem value="1.0">30°C (1.00)</SelectItem>
                <SelectItem value="0.94">35°C (0.94)</SelectItem>
                <SelectItem value="0.87">40°C (0.87)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-label uppercase tracking-widest text-[11px]">Fator de Potência (cos φ)</Label>
            <Input name="powerFactor" type="number" step="0.01" defaultValue="0.86" required />
          </div>

          <div className="space-y-2">
            <Label className="text-label uppercase tracking-widest text-[11px]">Fator de Serviço (FS)</Label>
            <Input name="serviceFactor" type="number" step="0.01" defaultValue="1.0" required />
          </div>

          <div className="space-y-2">
            <Label className="text-label uppercase tracking-widest text-[11px]">Rendimento (η)</Label>
            <Input name="efficiency" type="number" step="0.01" defaultValue="0.85" required />
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button type="submit" className="btn-primary px-12">
            Calcular Dimensionamento →
          </button>
        </div>
      </form>
    </div>
  );
};
