import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Printer, Save, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import katex from 'katex';

const getProtectiveConductorSection = (phaseSection: number) => {
  const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];
  const required = phaseSection <= 16 ? phaseSection : phaseSection <= 35 ? 16 : phaseSection / 2;
  return standardSections.find(section => section >= required) ?? required;
};

export const ProposalFlow = () => {
  const { setView, currentResults, currentInputs, selectedManufacturer, setSelectedManufacturer, markProposalSaved } = useAppStore();
  const [clientData, setClientData] = useState({
    name: '',
    doc: '',
    phone: '',
    email: ''
  });
  
  const [commercialData, setCommercialData] = useState({
    serviceDescription: '',
    technicianName: '',
    executingCompany: ''
  });
  
  const [items, setItems] = useState<any[]>(() => {
    if (!currentResults || !currentInputs) return [];
    
    // Regra: se trifásico 3x, se monofásico 2x a distância
    const phaseMultiplier = currentInputs.phase === 'trifasico' ? 3 : 2;
    const cableQty = Math.round((currentInputs.distance || 1) * phaseMultiplier);
    const groundQty = Math.round(currentInputs.distance || 1);
    const groundSection = getProtectiveConductorSection(currentResults.finalCableSection);


    const initialItems: any[] = [
      { id: 'cable', desc: `Cabo de potência flexível Cu/PVC 70°C 0,6/1 kV ${currentResults.finalCableSection}mm² (Fases)`, qtd: cableQty, unit: 'm', price: '' },
      { id: 'cable-ground', desc: `Cabo de potência flexível Cu/PVC 70°C 0,6/1 kV ${groundSection}mm² (PE/Terra)`, qtd: groundQty, unit: 'm', price: '' }

    ];

    // Mapear produtos baseados no fabricante selecionado
    // A ordem aqui seguirá a ordem do CalculationEngine, mas garantimos os principais primeiro
    currentResults.technicalRequirements.forEach(req => {
      const product = currentResults.compatibleProducts[req.label]?.[selectedManufacturer]?.[0];
      if (product) {
        let categoryPrefix = '';
        if (req.category === 'contator') categoryPrefix = 'Contator ';
        else if (req.category === 'disjuntorMotor') categoryPrefix = 'Disjuntor Motor ';
        else if (req.category === 'releTermico') categoryPrefix = 'Relé Térmico ';
        else if (req.category === 'releTempo') categoryPrefix = 'Relé de Tempo ';
        else if (req.category === 'fusivel') categoryPrefix = 'Fusível ';
        else if (req.category === 'disjuntor') categoryPrefix = 'Disjuntor ';

        initialItems.push({
          id: Math.random().toString(36).substr(2, 9),
          desc: `${categoryPrefix}${selectedManufacturer}${req.current !== undefined ? ` — mínimo ${req.current.toFixed(1)} A` : ''} (modelo a confirmar)`,
          qtd: req.quantity || 1,
          unit: 'un',
          price: ''
        });
      }
    });

    // Inclusão dinâmica de materiais auxiliares conforme tipo de partida/comando (Requisito #10)
    if (currentInputs.starterType === 'direta' || currentInputs.starterType === 'reversao' || currentInputs.starterType === 'estrelaTriangulo') {
      initialItems.push({ id: 'panel', desc: 'Painel Metálico com Placa de Montagem', qtd: 1, unit: 'un', price: '' });
      initialItems.push({ id: 'btn-on', desc: 'Botão de Comando Verde (NA)', qtd: currentInputs.starterType === 'reversao' ? 2 : 1, unit: 'un', price: '' });
      initialItems.push({ id: 'btn-off', desc: 'Botão de Comando Vermelho (NF)', qtd: 1, unit: 'un', price: '' });
      initialItems.push({ id: 'led-on', desc: 'Sinaleiro LED Verde (Em operação)', qtd: 1, unit: 'un', price: '' });
      initialItems.push({ id: 'led-fail', desc: 'Sinaleiro LED Vermelho (Falha)', qtd: 1, unit: 'un', price: '' });
      initialItems.push({ id: 'term-force', desc: 'Bornes de Passagem - Força', qtd: 6, unit: 'un', price: '' });
      initialItems.push({ id: 'term-cmd', desc: 'Bornes de Passagem - Comando', qtd: 12, unit: 'un', price: '' });
      initialItems.push({ id: 'din', desc: 'Trilho DIN Metálico', qtd: 1, unit: 'm', price: '' });
      initialItems.push({ id: 'cable-cmd', desc: 'Cabo de Comando 1,0mm²', qtd: 15, unit: 'm', price: '' });
      initialItems.push({ id: 'canaleta', desc: 'Canaleta Recortada 30x50mm', qtd: 2, unit: 'm', price: '' });
    }

    return initialItems;
  });

  const [labor, setLabor] = useState({
    hours: 0,
    rate: 150
  });

  const [costs, setCosts] = useState({
    travel: 0,
    others: 0,
    discount: 0,
    validity: 30
  });

  const totalMaterials = items.reduce((acc, item) => acc + (item.qtd * (item.price || 0)), 0);
  const totalLabor = (labor.hours || 0) * (labor.rate || 0);
  const grandTotal = totalMaterials + totalLabor + (costs.travel || 0) + (costs.others || 0) - (costs.discount || 0);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), desc: '', qtd: 1, unit: 'un', price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSave = () => {
    // Save to local storage
    const proposalData = {
      clientData,
      commercialData,
      items,
      labor,
      costs,
      date: new Date().toISOString()
    };
    localStorage.setItem('last_proposal', JSON.stringify(proposalData));
    markProposalSaved();
    toast.success('Proposta salva com sucesso!');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 print:p-0 print:py-0">
      <div className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-8 print:hidden">
        <div className="space-y-2">
          <button 
            onClick={() => setView('results')}
            className="btn-ghost px-0 h-auto gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar aos resultados
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Proposta Comercial</h2>
          <p className="text-muted-foreground text-base md:text-lg">Personalize e gere o orçamento profissional.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['WEG', 'Siemens', 'Schneider'].map((mfr) => (
              <button
                key={mfr}
                onClick={() => {
                  setSelectedManufacturer(mfr as any);
                  toast.info(`Fabricante alterado para ${mfr}`);
                  
                  // Atualizar a lista de itens baseada no novo fabricante
                  if (currentResults && currentInputs) {
                    const multiplier = currentInputs.phase === 'trifasico' ? 3 : 2;
                    const cableQty = (currentInputs.distance || 1) * multiplier;
                    
                    const newItems: any[] = [
                      { id: 'cable', desc: `Cabo Flexível ${currentResults.finalCableSection}mm² 750V`, qtd: cableQty, unit: 'm', price: '' }
                    ];

                    currentResults.technicalRequirements.forEach(req => {
                      const product = currentResults.compatibleProducts[req.label]?.[mfr as any]?.[0];
                      if (product) {
                        let categoryPrefix = '';
                        if (req.category === 'contator') categoryPrefix = 'Contator ';
                        else if (req.category === 'disjuntorMotor') categoryPrefix = 'Disjuntor Motor ';
                        else if (req.category === 'releTermico') categoryPrefix = 'Relé Térmico ';
                        else if (req.category === 'releTempo') categoryPrefix = 'Relé de Tempo ';
                        else if (req.category === 'fusivel') categoryPrefix = 'Fusível ';
                        else if (req.category === 'disjuntor') categoryPrefix = 'Disjuntor ';

                        newItems.push({
                          id: Math.random().toString(36).substr(2, 9),
                          desc: `${categoryPrefix}${mfr}${req.current !== undefined ? ` — mínimo ${req.current.toFixed(1)} A` : ''} (modelo a confirmar)`,
                          qtd: req.quantity || 1,
                          unit: 'un',
                          price: ''
                        });
                      }
                    });

                    // Auxiliares
                    if (currentInputs.starterType === 'direta' || currentInputs.starterType === 'reversao' || currentInputs.starterType === 'estrelaTriangulo') {
                      newItems.push({ id: 'panel', desc: 'Painel Metálico com Placa de Montagem', qtd: 1, unit: 'un', price: '' });
                      newItems.push({ id: 'btn-on', desc: 'Botão de Comando Verde (NA)', qtd: currentInputs.starterType === 'reversao' ? 2 : 1, unit: 'un', price: '' });
                      newItems.push({ id: 'btn-off', desc: 'Botão de Comando Vermelho (NF)', qtd: 1, unit: 'un', price: '' });
                      newItems.push({ id: 'led-on', desc: 'Sinaleiro LED Verde (Em operação)', qtd: 1, unit: 'un', price: '' });
                      newItems.push({ id: 'led-fail', desc: 'Sinaleiro LED Vermelho (Falha)', qtd: 1, unit: 'un', price: '' });
                      newItems.push({ id: 'term-force', desc: 'Bornes de Passagem - Força', qtd: 6, unit: 'un', price: '' });
                      newItems.push({ id: 'term-cmd', desc: 'Bornes de Passagem - Comando', qtd: 12, unit: 'un', price: '' });
                      newItems.push({ id: 'din', desc: 'Trilho DIN Metálico', qtd: 1, unit: 'm', price: '' });
                      newItems.push({ id: 'cable-cmd', desc: 'Cabo de Comando 1,0mm²', qtd: 15, unit: 'm', price: '' });
                      newItems.push({ id: 'canaleta', desc: 'Canaleta Recortada 30x50mm', qtd: 2, unit: 'm', price: '' });
                    }
                    setItems(newItems);
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                  selectedManufacturer === mfr 
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mfr}
              </button>
            ))}
          </div>
          <button onClick={() => window.print()} className="btn-secondary">
            <Printer className="w-5 h-5" /> Imprimir PDF
          </button>
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-5 h-5" /> Salvar Proposta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8 print:col-span-3">
          {/* Client Data Form - Hidden in Print if Empty */}
          <div className="card-panel space-y-6 print:hidden">
            <h3 className="text-card-title">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-widest text-[10px]">Nome / Razão Social</Label>
                <Input value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} placeholder="Ex: Indústria Metalúrgica SA" />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-widest text-[10px]">CPF / CNPJ</Label>
                <Input value={clientData.doc} onChange={e => setClientData({...clientData, doc: e.target.value})} placeholder="00.000.000/0001-00" />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-widest text-[10px]">Telefone</Label>
                <Input value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-widest text-[10px]">E-mail</Label>
                <Input value={clientData.email} onChange={e => setClientData({...clientData, email: e.target.value})} placeholder="cliente@email.com" />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label className="text-label uppercase tracking-widest text-[10px]">Descrição do Serviço</Label>
              <Textarea 
                value={commercialData.serviceDescription} 
                onChange={e => setCommercialData({...commercialData, serviceDescription: e.target.value})} 
                placeholder="Ex: Instalação de comando elétrico para acionamento de motor trifásico de 50 CV, incluindo montagem de painel, fiação e testes de funcionamento." 
                className="min-h-[100px]"
              />
            </div>
          </div>

          {/* PDF Preview Container */}
          <div className="bg-white border border-border rounded-[14px] shadow-2xl overflow-hidden print:border-0 print:shadow-none print:rounded-none">
            <div className="p-4 md:p-10 print:p-0 print:block">
              {/* PDF Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start mb-10 border-b pb-8 border-slate-100 gap-4">
                <div className="flex items-center gap-3 text-primary">
                  <Zap className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                  <div>
                    <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Dimensionador Expert</h1>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Memorial e Orçamento Técnico</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <h2 className="text-lg md:text-xl font-bold text-foreground">PROPOSTA TÉCNICA</h2>
                  <p className="text-metadata font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
                  {commercialData.technicianName && (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                      {commercialData.executingCompany ? `${commercialData.executingCompany} — ` : ''}
                      Técnico: {commercialData.technicianName}
                    </p>
              )}
              
              {/* Service Description in PDF */}
              {commercialData.serviceDescription && (
                <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10 print:mb-4">
                  <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Descrição do Serviço</p>
                  <p className="text-sm text-foreground whitespace-pre-line">{commercialData.serviceDescription}</p>
                </div>
              )}
                </div>
              </div>

              {/* Client Info in PDF */}
              {(clientData.name || clientData.email) && (
                <div className="mb-6 grid grid-cols-2 gap-8 bg-muted/30 p-4 rounded-xl border border-border print:mb-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Cliente</p>
                    <p className="font-bold text-foreground text-lg">{clientData.name || '—'}</p>
                    <p className="text-sm text-muted-foreground">{clientData.doc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Contato</p>
                    <p className="text-sm font-semibold">{clientData.email}</p>
                    <p className="text-sm text-muted-foreground">{clientData.phone}</p>
                  </div>
                </div>
              )}

              {/* Technical Data Table */}
              <div className="mb-6 print:mb-4">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-[10px] text-primary uppercase font-bold tracking-[0.2em]">Dados Técnicos da Carga</h3>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Fonte: {currentInputs?.dataSource === 'catalog' ? 'Catálogo WEG' : 'Dados da Placa'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-foreground/5 rounded-xl border border-foreground/10">
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Potência</p>
                    <p className="text-sm font-bold">{currentInputs?.power} {currentInputs?.powerUnit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Tensão</p>
                    <p className="text-sm font-bold">{currentInputs?.voltage} V</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold" dangerouslySetInnerHTML={{ __html: katex.renderToString('I_{b}', { throwOnError: false }) }} />
                    <p className="text-sm font-bold text-primary">{((currentResults?.nominalCurrent || 0) * (currentInputs?.serviceFactor || 1)).toFixed(1)} A</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Distância</p>
                    <p className="text-sm font-bold">{currentInputs?.distance} m</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Partida</p>
                    <p className="text-sm font-bold capitalize">{currentInputs?.starterType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold" dangerouslySetInnerHTML={{ __html: katex.renderToString('\\cos \\varphi / \\eta / FS', { throwOnError: false }) }} />
                    <p className="text-sm font-bold">{(currentInputs?.powerFactor || 0.85).toFixed(2)} / {(currentInputs?.efficiency || 0.90).toFixed(2)} / {(currentInputs?.serviceFactor || 1.0).toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Critério</p>
                    <p className="text-sm font-bold truncate">{currentResults?.limitingCriterion === 'ampacity' ? 'Ampacidade' : currentResults?.limitingCriterion === 'voltageDrop' ? 'Queda ΔV' : 'Seção mínima'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Seção Final</p>
                    <p className="text-sm font-bold text-primary">{currentResults?.finalCableSection} mm²</p>
                  </div>
                  {currentInputs?.dataSource === 'catalog' && (
                    <div className="col-span-4 mt-2 pt-2 border-t border-foreground/5 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Motor Selecionado</p>
                        <p className="text-sm font-bold">WEG {currentInputs.motorCatalogData?.line} - {currentInputs.motorCatalogData?.model}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Carcaça / Rotação</p>
                        <p className="text-sm font-bold">{currentInputs.motorCatalogData?.frame || '—'} / {currentInputs.motorCatalogData?.rpm || '—'} RPM</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Materials Table */}
              <div className="mb-6 print:mb-4 print-page-break">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-[10px] text-primary uppercase font-bold tracking-[0.2em]">Lista de Materiais e Equipamentos</h3>
                  <button onClick={addItem} className="text-xs font-bold text-primary hover:underline no-print flex items-center gap-1">
                    <Plus className="w-3 h-3" /> ADICIONAR ITEM
                  </button>
                </div>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="p-2 md:p-3 font-bold text-[9px] md:text-[10px] uppercase tracking-wider w-1/2">Descrição</th>
                        <th className="p-2 md:p-3 font-bold text-[9px] md:text-[10px] uppercase tracking-wider text-center">Qtd</th>
                        <th className="p-2 md:p-3 font-bold text-[9px] md:text-[10px] uppercase tracking-wider text-right">Preço</th>
                        <th className="p-2 md:p-3 font-bold text-[9px] md:text-[10px] uppercase tracking-wider text-right">Total</th>
                        <th className="p-2 md:p-3 no-print"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((item) => (
                        <tr key={item.id} className="group hover:bg-muted/30 transition-colors break-inside-avoid">
                          <td className="p-2 print:p-1">
                            <Input value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} className="h-8 border-transparent bg-transparent focus:bg-white text-sm font-medium print:text-[8pt] print:h-auto print:p-0" />
                          </td>
                          <td className="p-2 print:p-1">
                            <Input 
                              type="number" 
                              value={item.qtd} 
                              onChange={e => updateItem(item.id, 'qtd', parseFloat(e.target.value) || 0)} 
                              className="h-8 w-24 mx-auto text-center border-transparent bg-transparent focus:bg-white text-sm font-bold print:text-[8pt] print:h-auto print:p-0 no-arrows" 
                            />
                          </td>
                          <td className="p-2 print:p-1">
                            <Input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="h-8 w-24 ml-auto text-right border-transparent bg-transparent focus:bg-white text-sm print:text-[8pt] print:h-auto print:p-0" />
                          </td>
                          <td className="p-3 text-right font-bold text-foreground print:p-1 print:text-[8pt]">
                            R$ {(item.qtd * (item.price || 0)).toFixed(2)}
                          </td>
                          <td className="p-2 no-print text-right">
                            <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Labor and Totals */}
              <div className="grid grid-cols-2 gap-6 print:gap-4">
                <div className="space-y-6 print:space-y-4">
                  <div>
                    <h3 className="text-[10px] text-primary uppercase font-bold tracking-[0.2em] mb-4">Mão de Obra e Serviços</h3>
                    <div className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border">
                      <div className="flex justify-between items-center no-print">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Horas Estimadas</Label>
                        <Input type="number" className="w-20 h-8 text-right" value={labor.hours} onChange={e => setLabor({...labor, hours: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-muted-foreground">Valor Estimado</span>
                        <span className="text-sm font-bold text-foreground">R$ {totalLabor.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] text-primary uppercase font-bold tracking-[0.2em] mb-4">Observações Gerais</h3>
                    <Textarea className="min-h-[80px] text-xs border-border" placeholder="Ex: Prazo de entrega de 5 dias úteis. Garantia de 12 meses nos equipamentos." />
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex flex-col justify-between print:bg-transparent print:border-slate-200 print:p-2">
                  <div className="space-y-3 print:space-y-1">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest print:text-[8pt]">
                      <span>Subtotal Materiais</span>
                      <span>R$ {totalMaterials.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest print:text-[8pt]">
                      <span>Subtotal Serviços</span>
                      <span>R$ {totalLabor.toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-primary/10 space-y-2 no-print">
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                        <span>Deslocamento (R$)</span>
                        <Input type="number" className="w-20 h-7 text-right text-xs" value={costs.travel} onChange={e => setCosts({...costs, travel: parseFloat(e.target.value) || 0})} />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-destructive uppercase">
                        <span>Desconto (R$)</span>
                        <Input type="number" className="w-20 h-7 text-right text-xs text-destructive border-destructive/20" value={costs.discount} onChange={e => setCosts({...costs, discount: parseFloat(e.target.value) || 0})} />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-primary/20 text-center print:pt-2">
                    <p className="text-[10px] text-primary uppercase font-black tracking-[0.3em] mb-2 print:mb-0 print:text-[7pt]">Total Geral</p>
                    <p className="text-4xl font-black text-primary print:text-xl">R$ {grandTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* PDF Footer */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-end print:mt-2 print:pt-2">
                <div className="text-[9px] text-muted-foreground max-w-sm leading-relaxed print:text-[7pt]">
                  * Proposta válida por {costs.validity} dias. O dimensionamento utiliza os critérios configurados na ferramenta e deve ser conferido com as condições reais da instalação, coordenação das proteções, documentação dos fabricantes e responsabilidade técnica aplicável antes da execução.
                </div>
                <div className="text-center w-64 print:w-48">
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1 print:text-[8pt]">
                    {commercialData.technicianName}
                  </div>
                  {commercialData.executingCompany && (
                    <div className="text-[9px] text-muted-foreground uppercase mb-1 print:text-[7pt]">
                      {commercialData.executingCompany}
                    </div>
                  )}
                  <div className="border-b border-foreground h-1 w-full mb-2 print:h-1 print:mb-1"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest print:text-[7pt]">Assinatura do Técnico</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Sidebar - Hidden in Print */}
        <div className="lg:col-span-1 space-y-8 print:hidden">
          <div className="card-panel space-y-8">
            <h3 className="text-card-title">Configurações Comerciais</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-widest text-[10px]">Técnico Responsável</Label>
                <Input 
                  value={commercialData.technicianName} 
                  onChange={e => setCommercialData({...commercialData, technicianName: e.target.value})} 
                  placeholder="Nome completo do técnico" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-widest text-[10px]">Empresa Executora (Opcional)</Label>
                <Input 
                  value={commercialData.executingCompany} 
                  onChange={e => setCommercialData({...commercialData, executingCompany: e.target.value})} 
                  placeholder="Nome da empresa" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-widest text-[10px]">Validade da Proposta (Dias)</Label>
                <Input type="number" value={costs.validity} onChange={e => setCosts({...costs, validity: parseInt(e.target.value) || 30})} />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-widest text-[10px]">Valor da Hora Técnica (R$)</Label>
                <Input type="number" value={labor.rate} onChange={e => setLabor({...labor, rate: parseFloat(e.target.value) || 0})} />
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-metadata leading-relaxed">
                As informações técnicas do memorial são extraídas automaticamente do seu cálculo mais recente.
              </p>
            </div>

            <button onClick={() => window.print()} className="btn-primary w-full shadow-lg shadow-primary/20">
              <Printer className="w-5 h-5" /> Imprimir Documento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};