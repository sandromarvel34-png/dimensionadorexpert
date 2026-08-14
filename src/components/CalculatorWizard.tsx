import { MotorPhase, PowerUnit, StarterType, CalculationInputs } from '@/types';
import { CalculationEngine } from '@/lib/engine/CalculationEngine';
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

export const CalculatorWizard = () => {
  const { step, setStep, setView, setCalculation } = useAppStore();
  
  const handleCalculate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const inputs: CalculationInputs = {
      power: parseFloat(formData.get('power') as string),
      powerUnit: formData.get('powerUnit') as PowerUnit,
      voltage: parseFloat(formData.get('voltage') as string),
      phase: formData.get('phase') as MotorPhase,
      distance: parseFloat(formData.get('distance') as string),
      starterType: formData.get('starterType') as StarterType,
      maxVoltageDrop: parseFloat(formData.get('maxVoltageDrop') as string),
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
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Novo Dimensionamento</h2>
        <p className="text-slate-500">Preencha os dados técnicos para iniciar o cálculo profissional.</p>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6 bg-panel p-6 rounded-xl border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="power">Potência do Motor</Label>
            <div className="flex gap-2">
              <Input id="power" name="power" type="number" step="0.1" defaultValue="10" required />
              <Select name="powerUnit" defaultValue="cv">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cv">CV</SelectItem>
                  <SelectItem value="hp">HP</SelectItem>
                  <SelectItem value="kW">kW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voltage">Tensão (V)</Label>
            <Select name="voltage" defaultValue="380">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="220">220 V</SelectItem>
                <SelectItem value="380">380 V</SelectItem>
                <SelectItem value="440">440 V</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase">Sistema</Label>
            <Select name="phase" defaultValue="trifasico">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monofasico">Monofásico</SelectItem>
                <SelectItem value="trifasico">Trifásico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="distance">Distância (m)</Label>
            <Input id="distance" name="distance" type="number" defaultValue="20" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="starterType">Tipo de Partida</Label>
            <Select name="starterType" defaultValue="direta">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direta">Direta</SelectItem>
                <SelectItem value="reversao">Reversão</SelectItem>
                <SelectItem value="estrelaTriangulo">Estrela-Triângulo</SelectItem>
                <SelectItem value="softStarter">Soft Starter</SelectItem>
                <SelectItem value="inversor">Inversor de Frequência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxVoltageDrop">Queda de Tensão Máx. (%)</Label>
            <Input id="maxVoltageDrop" name="maxVoltageDrop" type="number" step="0.1" defaultValue="4" required />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => setView('dashboard')}>Cancelar</Button>
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-black font-bold px-8">Calcular Solução</Button>
        </div>
      </form>
    </div>
  );
};
