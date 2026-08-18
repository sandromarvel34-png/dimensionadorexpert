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
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getMotorCatalogFilters, getMotorsByFilter } from '@/lib/catalog/motors.functions';

export const CalculatorWizard = () => {
  const { setView, setCalculation, currentInputs } = useAppStore();
  const [isCalculating, setIsCalculating] = useState(false);
  const [dataSource, setDataSource] = useState<'manual' | 'catalog'>(currentInputs?.dataSource || 'manual');
  
  // Catalog selection state
  const [filters, setFilters] = useState<any[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>(currentInputs?.motorCatalogData?.line || '');
  const [selectedType, setSelectedType] = useState<string>(currentInputs?.motorCatalogData?.speedType || '');
  const [selectedPoles, setSelectedPoles] = useState<string>(currentInputs?.motorCatalogData?.poles?.toString() || '');
  const [selectedPower, setSelectedPower] = useState<string>(currentInputs?.motorCatalogData?.power?.toString() || '');
  const [selectedVoltage, setSelectedVoltage] = useState<string>(currentInputs?.motorCatalogData?.voltage?.toString() || '');
  const [availableMotors, setAvailableMotors] = useState<any[]>([]);
  const [selectedMotorId, setSelectedMotorId] = useState<string>(currentInputs?.motorCatalogData?.id || '');
  const availableLines = useMemo(() => Array.from(new Set(filters.map(f => f.line))), [filters]);
  const availableTypes = useMemo(() => Array.from(new Set(filters.filter(f => f.line === selectedLine).map(f => f.speed_type))), [filters, selectedLine]);
  const availablePoles = useMemo(() => Array.from(new Set(filters.filter(f => f.line === selectedLine && (!selectedType || selectedType === '_all' || f.speed_type === selectedType)).map(f => f.poles))), [filters, selectedLine, selectedType]);
  const availablePowers = useMemo(() => Array.from(new Set(filters.filter(f => 
    f.line === selectedLine && 
    (!selectedType || selectedType === '_all' || f.speed_type === selectedType) &&
    (!selectedPoles || selectedPoles === '_all' || f.poles === selectedPoles)
  ).map(f => f.power_cv))).sort((a,b) => a-b), [filters, selectedLine, selectedType, selectedPoles]);
  const availableVoltages = useMemo(() => Array.from(new Set(filters.filter(f => 
    f.line === selectedLine && 
    (!selectedType || selectedType === '_all' || f.speed_type === selectedType) &&
    (!selectedPoles || selectedPoles === '_all' || f.poles === selectedPoles) &&
    (!selectedPower || selectedPower === '_all' || f.power_cv.toString() === selectedPower)
  ).map(f => f.voltage))).sort((a,b) => a-b), [filters, selectedLine, selectedType, selectedPoles, selectedPower]);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await getMotorCatalogFilters();
        setFilters(data);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const loadMotors = async () => {
      if (selectedLine) {
        try {
          const motors = await getMotorsByFilter({
            data: {
              line: selectedLine,
              speed_type: (selectedType && selectedType !== '_all') ? selectedType : undefined,
              poles: (selectedPoles && selectedPoles !== '_all') ? selectedPoles : undefined,
              power_cv: (selectedPower && selectedPower !== '_all') ? parseFloat(selectedPower) : undefined,
              voltage: (selectedVoltage && selectedVoltage !== '_all') ? parseFloat(selectedVoltage) : undefined
            }
          });
          setAvailableMotors(motors);
        } catch (error) {
          console.error('Error loading motors:', error);
        }
      } else {
        setAvailableMotors([]);
      }
    };
    loadMotors();
  }, [selectedLine, selectedType, selectedPoles, selectedPower, selectedVoltage]);

  const selectedMotor = availableMotors.find(m => m.id === selectedMotorId);

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
          id: selectedMotor.id,
          manufacturer: 'WEG',
          line: selectedMotor.line,
          speedType: selectedMotor.speed_type,
          poles: selectedMotor.poles,
          model: selectedMotor.model_code || selectedMotor.line,
          nominalCurrent: selectedMotor.nominal_current,
          powerFactor: selectedMotor.power_factor,
          efficiency: selectedMotor.efficiency,
          power: selectedMotor.power_cv,
          powerUnit: 'cv',
          voltage: selectedMotor.voltage,
          rpm: selectedMotor.rpm,
          frame: selectedMotor.frame,
          catalogReference: selectedMotor.catalog_reference
        },
        power: selectedMotor.power_cv,
        powerUnit: 'cv',
        voltage: selectedMotor.voltage,
        phase: 'trifasico',
        distance: parseFloat(formData.get('distance') as string) || 5,
        starterType: formData.get('starterType') as any,
        maxVoltageDrop: parseFloat(formData.get('maxVoltageDrop') as string) || 2,
        preferredManufacturer: formData.get('manufacturer') as string || undefined,
        groupingType: formData.get('groupingType') as string || 'B1',
        groupingCount: parseInt(formData.get('groupingCount') as string) || 1,
        ambientTempFactor: CalculationEngine.TEMPERATURE_FACTORS[formData.get('ambientTemp') as string] || 1.0,
        powerFactor: selectedMotor.power_factor,
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
        distance: parseFloat(formData.get('distance') as string) || 5,
        starterType: formData.get('starterType') as any,
        maxVoltageDrop: parseFloat(formData.get('maxVoltageDrop') as string) || 2,
        preferredManufacturer: formData.get('manufacturer') as string || undefined,
        groupingType: formData.get('groupingType') as string || 'B1',
        groupingCount: parseInt(formData.get('groupingCount') as string) || 1,
        ambientTempFactor: CalculationEngine.TEMPERATURE_FACTORS[formData.get('ambientTemp') as string] || 1.0,
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
      toast.error("'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                        \n                                            \n                                            Faça uma auditoria e apresente um relatório completo");
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
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dimensionador Expert</h1>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Potência do motor</Label>
                    <div className="flex gap-2">
                      <Input name="power" type="number" step="0.01" defaultValue={currentInputs?.power?.toString() || "5"} className="h-12 text-base" required />
                      <Select name="powerUnit" defaultValue={currentInputs?.powerUnit || "cv"}>
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
                    <Select name="voltage" defaultValue={currentInputs?.voltage?.toString() || "220"}>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Fator de Serviço (FS)</Label>
                    <div className="relative">
                      <Input name="serviceFactor" type="number" step="0.01" defaultValue={currentInputs?.serviceFactor ? Number(currentInputs.serviceFactor).toFixed(2) : "1.00"} className="h-12 text-base" required />
                      <p className="mt-1 text-[10px] text-slate-500 font-medium">Multiplicador de carga máxima contínua (ex: 1.15)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Sistema</Label>
                    <Select name="phase" defaultValue={currentInputs?.phase || "trifasico"}>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground font-medium text-xs">cos φ</Label>
                        <Input name="powerFactor" type="number" step="0.01" defaultValue={currentInputs?.powerFactor ? Number(currentInputs.powerFactor).toFixed(2) : "0.85"} placeholder="Ex: 0.85" className="h-11" required={dataSource === 'manual'} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground font-medium text-xs">Rendimento (η)</Label>
                        <Input name="efficiency" type="number" step="0.01" defaultValue={currentInputs?.efficiency ? Number(currentInputs.efficiency).toFixed(2) : "0.90"} placeholder="Ex: 0.90" className="h-11" required={dataSource === 'manual'} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Fabricante do Motor</Label>
                    <div className="h-12 flex items-center px-4 bg-muted/50 rounded-[10px] border border-border text-foreground font-medium">
                      WEG
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Linha</Label>
                    <Select value={selectedLine} onValueChange={(val) => {
                      setSelectedLine(val);
                      setSelectedType('');
                      setSelectedPoles('');
                      setSelectedPower('');
                      setSelectedVoltage('');
                      setSelectedMotorId('');
                    }}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecionar linha" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {availableLines.map(line => (
                          <SelectItem key={line} value={line}>{line}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Tipo de Motor</Label>
                    <Select value={selectedType} onValueChange={setSelectedType} disabled={!selectedLine}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Qualquer tipo" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="_all">Todos</SelectItem>
                        {availableTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Número de Polos</Label>
                    <Select value={selectedPoles} onValueChange={setSelectedPoles} disabled={!selectedLine}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Qualquer polo" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="_all">Todos</SelectItem>
                        {availablePoles.map(poles => (
                          <SelectItem key={poles} value={poles}>{poles} Polos</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Potência (CV)</Label>
                    <Select value={selectedPower} onValueChange={setSelectedPower} disabled={!selectedLine}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Qualquer potência" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="_all">Todas</SelectItem>
                        {availablePowers.map(power => (
                          <SelectItem key={power} value={power.toString()}>{power} CV</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Tensão (V)</Label>
                    <Select value={selectedVoltage} onValueChange={setSelectedVoltage} disabled={!selectedLine}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Qualquer tensão" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="_all">Todas</SelectItem>
                        {availableVoltages.map(v => (
                          <SelectItem key={v} value={v.toString()}>{v} V</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-foreground font-semibold">Modelo Exato</Label>
                  <Select 
                    value={selectedMotorId} 
                    onValueChange={setSelectedMotorId}
                    disabled={availableMotors.length === 0}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={availableMotors.length === 0 ? "Filtre para ver os modelos" : "Selecionar modelo"} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {availableMotors.map(motor => (
                        <SelectItem key={motor.id} value={motor.id}>{motor.model_code} - {motor.power_cv}CV {motor.poles}P {motor.voltage}V</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.power_cv} CV</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Tensão</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.voltage}V</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">In (Corrente)</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.nominal_current} A</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Cos φ</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.power_factor?.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Rendimento</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.efficiency?.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Polos / Tipo</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.poles}P / {selectedMotor.speed_type}</p>
                      </div>
                      <div className="col-span-full mt-2 text-[9px] text-muted-foreground italic border-t pt-2">
                        Fonte: {selectedMotor.catalog_reference || 'Catálogo Oficial WEG'}
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-background/50 border border-border rounded-lg space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <Label className="text-foreground font-semibold text-xs">Informações Complementares</Label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5">
                            Fator de Serviço (FS)
                            <Info className="w-3 h-3 text-muted-foreground/50" />
                          </Label>
                          <Input name="serviceFactor" type="number" step="0.01" defaultValue={currentInputs?.serviceFactor ? Number(currentInputs.serviceFactor).toFixed(2) : "1.00"} className="h-10 bg-background border-border" required />
                          <p className="text-[9px] text-muted-foreground italic">Padrão: 1.0 (verifique a placa do motor)</p>
                        </div>
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
                  <Input name="distance" type="number" defaultValue={currentInputs?.distance || "5"} className="h-12 pr-16 text-base" required />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">metros</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Tipo de partida</Label>
                <Select name="starterType" defaultValue={currentInputs?.starterType || "direta"}>
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
                <Select name="maxVoltageDrop" defaultValue={currentInputs?.maxVoltageDrop?.toString() || "2"}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="1">1%</SelectItem>
                    <SelectItem value="2">2%</SelectItem>
                    <SelectItem value="3">3%</SelectItem>
                    <SelectItem value="4">4%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="7">7%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ocultado conforme solicitação #4: O fabricante é escolhido na Proposta Comercial */}
            <div className="hidden">
              <Label className="text-foreground font-semibold">Fabricante dos Dispositivos</Label>
              <Select name="manufacturer" defaultValue={currentInputs?.preferredManufacturer || "WEG"}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="any">Qualquer (Melhor preço)</SelectItem>
                  <SelectItem value="WEG">WEG</SelectItem>
                  <SelectItem value="Schneider">Schneider</SelectItem>
                  <SelectItem value="Siemens">Siemens</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Método de Instalação</Label>
                <Select name="groupingType" defaultValue={currentInputs?.groupingType || "B1"}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="A1">Método A1: Condutores ou cabos unipolares em eletroduto embutido em parede.</SelectItem>
                    <SelectItem value="A2">Método A2: Cabo multipolar em eletroduto embutido em parede.</SelectItem>
                    <SelectItem value="B1">Método B1: Condutores ou cabos unipolares em eletroduto aparente na parede ou teto.</SelectItem>
                    <SelectItem value="B2">Método B2: Cabo multipolar em eletroduto aparente.</SelectItem>
                    <SelectItem value="C">Método C: Cabos unipolares ou multipolares fixados diretamente sobre a parede ou em canaletas fechadas não embutidas.</SelectItem>
                    <SelectItem value="D">Método D: Cabos unipolares ou multipolares enterrados no solo diretamente ou em eletrodutos enterrados.</SelectItem>
                    <SelectItem value="E">Método E: Cabos unipolares ou multipolares ao ar livre, fixados em perfilados, prateleiras ou leitos para cabos.</SelectItem>
                    <SelectItem value="F_G">Métodos F e G: Cabos unipolares dispostos em formação específica (trevo ou espaçados) ao ar livre.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Número de Circuitos Agrupados</Label>
                <Select name="groupingCount" defaultValue={currentInputs?.groupingCount?.toString() || "1"}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} circuito{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Temperatura Ambiente</Label>
                <Select name="ambientTemp" defaultValue={Object.keys(CalculationEngine.TEMPERATURE_FACTORS).find(key => CalculationEngine.TEMPERATURE_FACTORS[key] === currentInputs?.ambientTempFactor) || "30"}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="10">10°C</SelectItem>
                    <SelectItem value="15">15°C</SelectItem>
                    <SelectItem value="20">20°C</SelectItem>
                    <SelectItem value="25">25°C</SelectItem>
                    <SelectItem value="30">30°C</SelectItem>
                    <SelectItem value="35">35°C</SelectItem>
                    <SelectItem value="40">40°C</SelectItem>
                    <SelectItem value="45">45°C</SelectItem>
                    <SelectItem value="50">50°C</SelectItem>
                    <SelectItem value="55">55°C</SelectItem>
                    <SelectItem value="60">60°C</SelectItem>
                  </SelectContent>
                </Select>
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