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
  const [installationMethod, setInstallationMethod] = useState<string>(currentInputs?.installationMethod || 'B1');
  
  // Catalog selection state
  const [catalogError, setCatalogError] = useState('');
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
        setCatalogError('');
      } catch (error) {
        setCatalogError(error instanceof Error ? error.message : 'Catálogo indisponível.');
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAvailableMotors([]);
    setSelectedMotorId('');
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
          if (!cancelled) setAvailableMotors(motors);
        } catch (error) {
          if (!cancelled) setCatalogError(error instanceof Error ? error.message : 'Catálogo indisponível.');
        }
      } else {
        setAvailableMotors([]);
      }
    };
    loadMotors();
    return () => { cancelled = true; };
  }, [selectedLine, selectedType, selectedPoles, selectedPower, selectedVoltage]);

  const selectedMotor = availableMotors.find(m => m.id === selectedMotorId);

  const handleCalculate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCalculating) return;

    const formData = new FormData(e.currentTarget);
    const shortCircuitCurrentRaw = parseFloat(formData.get('shortCircuitCurrentKA') as string);
    const shortCircuitDurationRaw = parseFloat(formData.get('shortCircuitDurationSeconds') as string);
    const shortCircuitCurrentKA = Number.isFinite(shortCircuitCurrentRaw) ? shortCircuitCurrentRaw : undefined;
    const shortCircuitDurationSeconds = Number.isFinite(shortCircuitDurationRaw) ? shortCircuitDurationRaw : undefined;
    
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
        distance: parseFloat(formData.get('distance') as string),
        starterType: formData.get('starterType') as any,
        maxVoltageDrop: parseFloat(formData.get('maxVoltageDrop') as string),
        preferredManufacturer: formData.get('manufacturer') as string || undefined,
        installationMethod: formData.get('groupingType') as string || 'B1',
        groupingType: formData.get('groupingType') as string || 'B1',
        groupingCount: parseInt(formData.get('groupingCount') as string),
        ambientTemperature: parseFloat(formData.get('ambientTemp') as string),
        soilThermalResistivity: parseFloat(formData.get('soilThermalResistivity') as string) || 2.5,
        buriedCableConfiguration: (formData.get('buriedCableConfiguration') as 'unipolarDuct' | 'multipolarDuct') || 'unipolarDuct',
        voltageDropArrangement: (formData.get('voltageDropArrangement') as CalculationInputs['voltageDropArrangement']) || 'auto',
        ...(shortCircuitCurrentKA !== undefined ? { shortCircuitCurrentKA } : {}),
        ...(shortCircuitDurationSeconds !== undefined ? { shortCircuitDurationSeconds } : {}),
        powerFactor: selectedMotor.power_factor,
        serviceFactor: parseFloat(formData.get('serviceFactor') as string),
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
        installationMethod: formData.get('groupingType') as string || 'B1',
        groupingType: formData.get('groupingType') as string || 'B1',
        groupingCount: parseInt(formData.get('groupingCount') as string),
        ambientTemperature: parseFloat(formData.get('ambientTemp') as string),
        soilThermalResistivity: parseFloat(formData.get('soilThermalResistivity') as string) || 2.5,
        buriedCableConfiguration: (formData.get('buriedCableConfiguration') as 'unipolarDuct' | 'multipolarDuct') || 'unipolarDuct',
        voltageDropArrangement: (formData.get('voltageDropArrangement') as CalculationInputs['voltageDropArrangement']) || 'auto',
        ...(shortCircuitCurrentKA !== undefined ? { shortCircuitCurrentKA } : {}),
        ...(shortCircuitDurationSeconds !== undefined ? { shortCircuitDurationSeconds } : {}),
        powerFactor: pf,
        serviceFactor: parseFloat(formData.get('serviceFactor') as string),
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
    if (!Number.isFinite(inputs.voltage) || inputs.voltage <= 0) {
      toast.error('Informe uma tensão válida.');
      hasError = true;
    }
    if ((inputs.powerFactor ?? 0) <= 0 || (inputs.powerFactor ?? 0) > 1) {
      toast.error('O fator de potência deve estar entre 0 e 1.');
      hasError = true;
    }
    if ((inputs.efficiency ?? 0) <= 0 || (inputs.efficiency ?? 0) > 1) {
      toast.error('O rendimento deve estar entre 0 e 1.');
      hasError = true;
    }
    if ((inputs.serviceFactor ?? 0) <= 0 || (inputs.serviceFactor ?? 0) > 2) {
      toast.error('Informe um fator de serviço válido.');
      hasError = true;
    }
    if (inputs.phase === 'monofasico' && inputs.starterType === 'estrelaTriangulo') {
      toast.error('Partida estrela-triângulo não é aplicável a motor monofásico.');
      hasError = true;
    }

    if (hasError) return;

    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const results = CalculationEngine.performFullCalculation(inputs);
      await setCalculation(inputs, results);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível concluir o dimensionamento.';
      toast.error('Erro no dimensionamento', { description: message });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-7">
        <button 
          onClick={() => setView('dashboard')}
          className="text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-1.5 text-sm font-semibold mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao dashboard
        </button>
        <span className="eyebrow block">Novo dimensionamento</span>
        <h1 className="page-heading mt-2">Configure os dados do cálculo</h1>
        <p className="text-slate-600 text-base md:text-lg mt-2 max-w-3xl">
          Preencha os dados do motor, as condições da instalação e os critérios que serão usados no dimensionamento.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-6 max-w-2xl">
          {[
            ['1', 'Motor'],
            ['2', 'Instalação'],
            ['3', 'Critérios'],
          ].map(([n, label]) => (
            <div key={n} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-primary text-xs font-bold flex items-center justify-center">{n}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-5">
        <div className="space-y-5">
          {/* Data Source Selection */}
          <div className="section-card space-y-4">
            <div className="section-heading mb-4">
              <div className="section-index">1</div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Origem dos dados do motor</h2>
                <p className="text-sm text-slate-500 mt-0.5">Use os dados da placa ou selecione um motor do catálogo disponível.</p>
              </div>
            </div>
            <Label className="sr-only">Como deseja informar os dados do motor?</Label>
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

          <div className="section-card">
            <div className="section-heading">
              <div className="section-index">2</div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Dados do motor</h2>
                <p className="text-sm text-slate-500 mt-0.5">Características elétricas usadas para calcular a corrente de projeto.</p>
              </div>
            </div>
            
            {dataSource === 'catalog' && catalogError && <p role="alert" className="text-sm text-red-700 mb-4">{catalogError}</p>}
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
                      <p className="mt-1 text-xs text-slate-500 font-medium">Multiplicador de carga máxima contínua (ex: 1.15)</p>
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
                        <h4 className="font-semibold text-primary text-sm">Dados técnicos do catálogo WEG</h4>
                        <p className="text-xs text-primary/70 italic">Valores carregados automaticamente para o modelo selecionado.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">Potência</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.power_cv} CV</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">Tensão</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.voltage}V</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">In (Corrente)</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.nominal_current} A</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">Cos φ</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.power_factor?.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">Rendimento</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.efficiency?.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">Polos / Tipo</p>
                        <p className="text-sm font-semibold text-foreground">{selectedMotor.poles}P / {selectedMotor.speed_type}</p>
                      </div>
                      <div className="col-span-full mt-2 text-xs text-muted-foreground italic border-t pt-2">
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
                          <Label className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                            Fator de Serviço (FS)
                            <Info className="w-3 h-3 text-muted-foreground/50" />
                          </Label>
                          <Input name="serviceFactor" type="number" step="0.01" defaultValue={currentInputs?.serviceFactor ? Number(currentInputs.serviceFactor).toFixed(2) : "1.00"} className="h-10 bg-background border-border" required />
                          <p className="text-xs text-muted-foreground italic">Padrão: 1.0 (verifique a placa do motor)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="section-card">
            <div className="section-heading">
              <div className="section-index">3</div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Instalação e acionamento</h2>
                <p className="text-sm text-slate-500 mt-0.5">Distância, partida e limite de queda de tensão do circuito.</p>
              </div>
            </div>
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
            <div className="mt-8 soft-panel p-5 md:p-6">
              <div className="mb-6">
                <p className="eyebrow">Condições de dimensionamento</p>
                <h3 className="text-base font-bold text-slate-900 mt-1">Como os condutores estão instalados</h3>
                <p className="text-sm text-slate-500 mt-1">Esses dados alteram a ampacidade e a verificação da queda de tensão.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Método de instalação</Label>
                <Select name="groupingType" value={installationMethod} onValueChange={setInstallationMethod}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="A1">A1 — condutores unipolares em eletroduto embutido</SelectItem>
                    <SelectItem value="A2">A2 — cabo multipolar em eletroduto embutido</SelectItem>
                    <SelectItem value="B1">B1 — condutores unipolares em eletroduto aparente</SelectItem>
                    <SelectItem value="B2">B2 — cabo multipolar em eletroduto aparente</SelectItem>
                    <SelectItem value="C">C — cabos fixados diretamente à superfície</SelectItem>
                    <SelectItem value="D">D — cabos em dutos individuais enterrados no solo</SelectItem>
                    <SelectItem value="E">E — cabo multipolar ao ar livre</SelectItem>
                    <SelectItem value="F2">F — 2 condutores carregados justapostos</SelectItem>
                    <SelectItem value="F3_TREFOIL">F — 3 condutores em trifólio</SelectItem>
                    <SelectItem value="F3_FLAT">F — 3 condutores no mesmo plano, justapostos</SelectItem>
                    <SelectItem value="G_HORIZONTAL">G — 3 condutores espaçados, horizontal</SelectItem>
                    <SelectItem value="G_VERTICAL">G — 3 condutores espaçados, vertical</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">A disposição física altera a ampacidade. Selecione a condição real da instalação.</p>
              </div>
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Número de circuitos agrupados</Label>
                <Select name="groupingCount" defaultValue={currentInputs?.groupingCount?.toString() || "1"}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} circuito{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Temperatura {installationMethod === 'D' ? 'do solo' : 'ambiente'}</Label>
                <Select name="ambientTemp" defaultValue={currentInputs?.ambientTemperature?.toString() || (installationMethod === 'D' ? "20" : "30")}>
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
                {installationMethod === 'D' && (
                  <p className="text-xs text-muted-foreground">Para o método D, use a temperatura do solo.</p>
                )}
              </div>
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Disposição dos condutores</Label>
                <Select name="voltageDropArrangement" defaultValue={currentInputs?.voltageDropArrangement || "auto"}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="auto">Automático pelo método de instalação</SelectItem>
                    <SelectItem value="adjacent">Condutores carregados, justapostos</SelectItem>
                    <SelectItem value="multipolar">Cabo multipolar</SelectItem>
                    <SelectItem value="spaced2D">Condutores carregados, no mesmo plano, espaçados</SelectItem>
                    <SelectItem value="trefoil">Três condutores carregados, em trifólio</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Terminologia apresentada conforme a ABNT NBR 5410. Se não souber a disposição, mantenha automático.</p>
              </div>
              {installationMethod === 'D' && (
                <>
                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Configuração enterrada</Label>
                    <Select name="buriedCableConfiguration" defaultValue={currentInputs?.buriedCableConfiguration || "unipolarDuct"}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="unipolarDuct">Cabos unipolares em dutos individuais</SelectItem>
                        <SelectItem value="multipolarDuct">Cabo multipolar em duto individual</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">O fator de agrupamento considera dutos em contato, condição conservadora quando o espaçamento não é informado.</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-foreground font-semibold">Resistividade térmica do solo</Label>
                    <Select name="soilThermalResistivity" defaultValue={currentInputs?.soilThermalResistivity?.toString() || "2.5"}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="0.5">0,5 K·m/W</SelectItem>
                        <SelectItem value="0.7">0,7 K·m/W</SelectItem>
                        <SelectItem value="1">1,0 K·m/W</SelectItem>
                        <SelectItem value="1.5">1,5 K·m/W</SelectItem>
                        <SelectItem value="2">2,0 K·m/W</SelectItem>
                        <SelectItem value="2.5">2,5 K·m/W (referência)</SelectItem>
                        <SelectItem value="3">3,0 K·m/W</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              </div>

              <div className="mt-6 rounded-[14px] border border-amber-200 bg-amber-50/60 p-5">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground">Verificação térmica de curto-circuito (opcional)</h4>
                  <p className="text-xs text-muted-foreground mt-1">Se você conhecer a corrente de falta presumida e o tempo de atuação da proteção, informe os dois dados para incluir este critério na seção final.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Icc presumida</Label>
                    <div className="relative">
                      <Input name="shortCircuitCurrentKA" type="number" min="0" step="0.01" defaultValue={currentInputs?.shortCircuitCurrentKA ?? ''} placeholder="Ex.: 10" className="h-11 pr-12" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kA</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tempo de atuação</Label>
                    <div className="relative">
                      <Input name="shortCircuitDurationSeconds" type="number" min="0" max="5" step="0.001" defaultValue={currentInputs?.shortCircuitDurationSeconds ?? ''} placeholder="Ex.: 0,1" className="h-11 pr-10" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 z-20 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-[16px] border border-slate-200 bg-white/95 backdrop-blur p-3 shadow-xl shadow-slate-900/10">
          <button 
            type="button"
            onClick={() => setView('dashboard')}
            className="btn-secondary w-full sm:w-auto px-6 h-11"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isCalculating}
            className="btn-primary w-full sm:w-auto px-8 h-11 relative"
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
