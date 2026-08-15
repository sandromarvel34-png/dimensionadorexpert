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
import { ArrowLeft, Loader2, Database, ClipboardList, Info, CheckCircle2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { WEG_MOTOR_CATALOG } from '@/lib/catalog/motors';
import { cn } from '@/lib/utils';

export const CalculatorWizard = () => {
  const { setView, setCalculation } = useAppStore();
  const [isCalculating, setIsCalculating] = useState(false);
  
  const handleCalculate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCalculating) return;

    const formData = new FormData(e.currentTarget);
    
    const inputs: CalculationInputs = {
      dataSource: 'manual',
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

    // Validation
    let hasError = false;
    if (isNaN(inputs.power) || inputs.power <= 0) {
      toast.error('Informe uma potência de motor válida.');
      hasError = true;
    }
    if (isNaN(inputs.distance) || inputs.distance <= 0) {
      toast.error('Informe uma distância válida.');
      hasError = true;
    }

    if (hasError) return;

    setIsCalculating(true);

    // Artificial delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const results = CalculationEngine.performFullCalculation(inputs);
      setCalculation(inputs, results);
      setView('results');
    } catch (error) {
      toast.error('Erro ao realizar o cálculo. Verifique os parâmetros técnicos.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => setView('dashboard')}
            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Novo Dimensionamento</h1>
          <p className="text-muted-foreground text-lg">Informe os dados técnicos do motor e da instalação para iniciar o cálculo.</p>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="card-panel shadow-lg border-primary/5">
        <div className="space-y-10">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Potência do motor</Label>
              <div className="flex gap-2">
                <Input name="power" type="number" step="0.1" defaultValue="5" className="h-12 text-base" required />
                <Select name="powerUnit" defaultValue="cv">
                  <SelectTrigger className="w-32 h-12">
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

            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Tensão de alimentação</Label>
              <Select name="voltage" defaultValue="220">
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="220">220 V</SelectItem>
                  <SelectItem value="380">380 V</SelectItem>
                  <SelectItem value="440">440 V</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Sistema</Label>
              <Select name="phase" defaultValue="trifasico">
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="monofasico">Monofásico</SelectItem>
                  <SelectItem value="trifasico">Trifásico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Distância até o ponto de alimentação</Label>
              <div className="relative">
                <Input name="distance" type="number" defaultValue="5" className="h-12 pr-16 text-base" required />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">metros</span>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Tipo de partida</Label>
              <Select name="starterType" defaultValue="direta">
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="direta">Partida Direta</SelectItem>
                  <SelectItem value="reversao">Reversão</SelectItem>
                  <SelectItem value="estrelaTriangulo">Estrela-Triângulo</SelectItem>
                  <SelectItem value="softStarter">Soft Starter</SelectItem>
                  <SelectItem value="inversor">Inversor de Frequência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Queda de tensão admissível</Label>
              <div className="relative">
                <Input name="maxVoltageDrop" type="number" step="0.1" defaultValue="2" className="h-12 pr-12 text-base" required />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">%</span>
              </div>
            </div>
          </div>

          {/* Advanced / Technical Data */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Parâmetros Técnicos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-xs">Fabricante Preferencial</Label>
                <Select name="manufacturer" defaultValue="WEG">
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="WEG">WEG</SelectItem>
                    <SelectItem value="Schneider">Schneider</SelectItem>
                    <SelectItem value="Siemens">Siemens</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground font-medium text-xs">Fator de Potência (cos φ)</Label>
                <Input name="powerFactor" type="number" step="0.01" defaultValue="0.86" className="h-11" required />
              </div>

              <div className="space-y-3">
                <Label className="text-foreground font-medium text-xs">Rendimento (η)</Label>
                <Input name="efficiency" type="number" step="0.01" defaultValue="0.85" className="h-11" required />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <button 
            type="button"
            onClick={() => setView('dashboard')}
            className="btn-secondary w-full sm:w-auto px-8"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isCalculating}
            className="btn-primary w-full sm:w-auto px-12 relative"
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Calculando...
              </>
            ) : (
              'Calcular Dimensionamento →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};