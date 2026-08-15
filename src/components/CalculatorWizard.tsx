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
  const [dataSource, setDataSource] = useState<'manual' | 'catalog'>('manual');
  
  // Catalog selection state
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  
  const catalogLines = useMemo(() => {
    return Array.from(new Set(WEG_MOTOR_CATALOG.map(m => m.line)));
  }, []);
  
  const modelsInLine = useMemo(() => {
    if (!selectedLine) return [];
    return WEG_MOTOR_CATALOG.filter(m => m.line === selectedLine);
  }, [selectedLine]);
  
  const selectedMotor = useMemo(() => {
    return WEG_MOTOR_CATALOG.find(m => m.id === selectedModelId);
  }, [selectedModelId]);

  const handleCalculate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCalculating) return;

    const formData = new FormData(e.currentTarget);
    
    let inputs: CalculationInputs;

    if (dataSource === 'catalog') {
      if (!selectedMotor) {
        toast.error('Selecione um motor do catálogo WEG.');
        return;
      }

      inputs = {
        dataSource: 'catalog',
        motorCatalogData: {
          manufacturer: 'WEG',
          line: selectedMotor.line,
          model: selectedMotor.model,
          nominalCurrent: selectedMotor.nominalCurrent,
          powerFactor: selectedMotor.powerFactor,
          efficiency: selectedMotor.efficiency,
          power: selectedMotor.power,
          powerUnit: selectedMotor.powerUnit
        },
        power: selectedMotor.power,
        powerUnit: selectedMotor.powerUnit,
        voltage: selectedMotor.voltage,
        phase: 'trifasico',
        distance: parseFloat(formData.get('distance') as string),
        starterType: formData.get('starterType') as any,
        maxVoltageDrop: parseFloat(formData.get('maxVoltageDrop') as string),
        preferredManufacturer: formData.get('manufacturer') as string || undefined,
        groupingFactor: parseFloat(formData.get('groupingFactor') as string) || 1.0,
        ambientTempFactor: parseFloat(formData.get('tempFactor') as string) || 1.0,
        powerFactor: selectedMotor.powerFactor,
        serviceFactor: parseFloat(formData.get('serviceFactor') as string) || 1.0,
        efficiency: selectedMotor.efficiency,
        quantity: 1
      };
    } else {
      const pf = parseFloat(formData.get('powerFactor') as string);
      const eff = parseFloat(formData.get('efficiency') as string);

      if (isNaN(pf) || pf <= 0) {
        toast.error('Informe o Fator de Potência (cos φ).');
        return;
      }
      if (isNaN(eff) || eff <= 0) {
        toast.error('Informe o Rendimento (η).');
        return;
      }

      inputs = {
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
        powerFactor: pf,
        serviceFactor: parseFloat(formData.get('serviceFactor') as string) || 1.0,
        efficiency: eff,
        quantity: 1
      };
    }

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
          {/* Data Source Selection */}
          <div className="space-y-4">
            <Label className="text-foreground font-semibold">Como deseja informar os dados do motor?</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDataSource('manual')}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-[10px] border-2 transition-all text-left",
                  dataSource === 'manual' 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-border hover:border-muted-foreground/30 bg-card text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  dataSource === 'manual' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Informar dados da placa</p>
                  <p className="text-xs opacity-80">Inserir manualmente os dados técnicos</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDataSource('catalog')}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-[10px] border-2 transition-all text-left",
                  dataSource === 'catalog' 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-border hover:border-muted-foreground/30 bg-card text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  dataSource === 'catalog' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Selecionar motor WEG</p>
                  <p className="text-xs opacity-80">Carregar dados do catálogo oficial</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Dados do Motor</h3>
            
            {dataSource === 'manual' ? (
              <div className="space-y-8">
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
                    <Label className="text-foreground font-semibold italic text-xs block text-muted-foreground mb-1">
                      Seu motor não é WEG? Informe os dados disponíveis na placa do motor.
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground font-medium text-xs">Fator de Potência (cos φ)</Label>
                        <Input name="powerFactor" type="number" step="0.01" placeholder="Ex: 0.86" className="h-11" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground font-medium text-xs">Rendimento (η)</Label>
                        <Input name="efficiency" type="number" step="0.01" placeholder="Ex: 0.85" className="h-11" required />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Fabricante</Label>
                    <div className="h-12 flex items-center px-4 bg-muted/50 rounded-[10px] border border-border text-foreground font-medium">
                      WEG
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Linha</Label>
                    <Select value={selectedLine} onValueChange={setSelectedLine}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecionar linha" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {catalogLines.map(line => (
                          <SelectItem key={line} value={line}>{line}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Modelo</Label>
                    <Select 
                      value={selectedModelId} 
                      onValueChange={setSelectedModelId}
                      disabled={!selectedLine}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecionar modelo" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {modelsInLine.map(model => (
                          <SelectItem key={model.id} value={model.id}>{model.model} ({model.voltage}V)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedMotor && (
                  <div className="bg-primary/5 border border-primary/20 rounded-[14px] p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Dados técnicos do catálogo WEG</h4>
                        <p className="text-xs text-primary/70 italic">Valores carregados automaticamente para o modelo selecionado.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Potência</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.power} {selectedMotor.powerUnit.toUpperCase()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Tensão</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.voltage}V</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">In (Corrente)</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.nominalCurrent} A</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Cos φ</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.powerFactor}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Rendimento</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.efficiency}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Dados da Instalação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Distância até a alimentação</Label>
                <div className="relative">
                  <Input name="distance" type="number" defaultValue="5" className="h-12 pr-16 text-base" required />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">metros</span>
                </div>
              </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-xs">Fator de Serviço (FS)</Label>
                <Input name="serviceFactor" type="number" step="0.01" defaultValue="1.0" className="h-11" required />
              </div>
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-xs">Agrupamento (F1)</Label>
                <Input name="groupingFactor" type="number" step="0.01" defaultValue="1.0" className="h-11" required />
              </div>
              <div className="space-y-3">
                <Label className="text-foreground font-medium text-xs">Temperatura (F2)</Label>
                <Input name="tempFactor" type="number" step="0.01" defaultValue="1.0" className="h-11" required />
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