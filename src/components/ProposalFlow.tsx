import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Building2, CheckCircle2, ImagePlus, Plus, Printer, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateCommercialProposalPdf, generateDescriptiveMemorialPdf } from '@/lib/pdf/generateProposalPdf';

const getProtectiveConductorSection = (phaseSection: number) => {
  const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];
  const required = phaseSection <= 16 ? phaseSection : phaseSection <= 35 ? 16 : phaseSection / 2;
  return standardSections.find(section => section >= required) ?? required;
};

export const ProposalFlow = () => {
  const {
    setView,
    currentResults,
    currentInputs,
    selectedManufacturer,
    setSelectedManufacturer,
    companyProfile,
    setCompanyProfile,
    proposals,
    currentProposalId,
    saveProposal,
  } = useAppStore();

  const savedProposal = proposals.find(item => item.id === currentProposalId) || null;
  const proposalIdRef = useRef(currentProposalId || Math.random().toString(36).slice(2, 11));
  const createdAtRef = useRef(savedProposal?.createdAt || new Date().toISOString());
  const hasAutoSavedRef = useRef(false);
  const [clientData, setClientData] = useState(savedProposal?.clientData || {
    name: '',
    doc: '',
    phone: '',
    email: ''
  });
  
  const [commercialData, setCommercialData] = useState(savedProposal?.commercialData || {
    serviceDescription: '',
    technicianName: companyProfile.responsibleName,
    executingCompany: companyProfile.companyName
  });

  const [observations, setObservations] = useState(savedProposal?.observations || '');
  
  const [items, setItems] = useState<any[]>(() => {
    if (savedProposal?.items?.length) return savedProposal.items.map(item => ({ ...item }));
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
          desc: product.verificationStatus === 'verified-exact'
            ? `${categoryPrefix}${selectedManufacturer} ${product.model}${product.commercialCode ? ` — Ref. ${product.commercialCode}` : ''}`
            : `${categoryPrefix}${selectedManufacturer}${req.current !== undefined ? ` — mínimo ${req.current.toFixed(1)} A` : ''}`,
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

  const [labor, setLabor] = useState(savedProposal?.labor || {
    hours: 0,
    rate: 150
  });

  const [costs, setCosts] = useState(savedProposal?.costs || {
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


  useEffect(() => {
    if (!currentInputs || !currentResults) return;

    const delay = hasAutoSavedRef.current ? 450 : 0;
    const timer = window.setTimeout(() => {
      saveProposal({
        id: proposalIdRef.current,
        calculationHistoryId: useAppStore.getState().currentHistoryId,
        createdAt: createdAtRef.current,
        updatedAt: new Date().toISOString(),
        status: savedProposal?.status || 'rascunho',
        clientData: { ...clientData },
        commercialData: {
          ...commercialData,
          technicianName: companyProfile.responsibleName || commercialData.technicianName,
          executingCompany: companyProfile.companyName || commercialData.executingCompany,
        },
        observations,
        items: items.map(item => ({ ...item })),
        labor: { ...labor },
        costs: { ...costs },
        selectedManufacturer,
        companyProfile: { ...companyProfile },
        currentInputs: { ...currentInputs },
        currentResults,
        total: grandTotal,
      });
      hasAutoSavedRef.current = true;
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    clientData,
    commercialData,
    observations,
    items,
    labor,
    costs,
    selectedManufacturer,
    companyProfile,
    currentInputs,
    currentResults,
    grandTotal,
    saveProposal,
    savedProposal?.status,
  ]);

  const getPdfData = () => {
    if (!currentInputs || !currentResults) return null;

    return {
      companyProfile,
      clientData,
      commercialData: {
        ...commercialData,
        technicianName: companyProfile.responsibleName || commercialData.technicianName,
        executingCompany: companyProfile.companyName || commercialData.executingCompany,
      },
      observations,
      items,
      labor,
      costs,
      selectedManufacturer,
      currentInputs,
      currentResults,
    };
  };



  const handlePrintProposal = async () => {
    const data = getPdfData();
    if (!data) {
      toast.error('Não há dimensionamento disponível para imprimir a proposta.');
      return;
    }

    try {
      await generateCommercialProposalPdf({ data, action: 'print' });
      toast.success('Proposta aberta para impressão.');
    } catch (error) {
      console.error('Erro ao imprimir proposta comercial:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível abrir a proposta para impressão.');
    }
  };

  const handlePrintMemorial = async () => {
    const data = getPdfData();
    if (!data) {
      toast.error('Não há dimensionamento disponível para imprimir o memorial.');
      return;
    }

    try {
      await generateDescriptiveMemorialPdf({ data, action: 'print' });
      toast.success('Memorial aberto para impressão.');
    } catch (error) {
      console.error('Erro ao imprimir memorial descritivo:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível abrir o memorial para impressão.');
    }
  };

  const handleLogoUpload = (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.error('Use uma logomarca em PNG ou JPG.');
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error('A logomarca deve ter no máximo 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCompanyProfile({ logoDataUrl: String(reader.result || '') });
      toast.success('Logomarca salva para os próximos documentos.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 print:p-0 print:py-0">
      <div className="mb-7 flex flex-col xl:flex-row xl:items-end justify-between gap-5 print:hidden">
        <div>
          <button 
            onClick={() => setView('results')}
            className="btn-ghost px-0 h-auto gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar aos resultados
          </button>
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <span className="eyebrow">{savedProposal ? 'Editando proposta' : 'Nova proposta'}</span>
            <span className="status-pill border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Salva automaticamente
            </span>
          </div>
          <h2 className="page-heading mt-2">{savedProposal ? (savedProposal.clientData.name || 'Proposta comercial') : 'Proposta comercial'}</h2>
          <p className="text-slate-600 text-base md:text-lg mt-2">Complete os dados do cliente, revise os materiais e prepare o documento para apresentação.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[10px] border border-slate-200">
            {['WEG', 'Siemens', 'Schneider'].map((mfr) => (
              <button
                key={mfr}
                onClick={() => {
                  setSelectedManufacturer(mfr as any);
                  toast.info(`Fabricante alterado para ${mfr}`);
                  
                  // Atualizar a lista de itens baseada no novo fabricante
                  if (currentResults && currentInputs) {
                    const multiplier = currentInputs.phase === 'trifasico' ? 3 : 2;
                    const cableQty = Math.round((currentInputs.distance || 1) * multiplier);
                    const groundQty = Math.round(currentInputs.distance || 1);
                    const groundSection = getProtectiveConductorSection(currentResults.finalCableSection);
                    
                    const newItems: any[] = [
                      { id: 'cable', desc: `Cabo de potência flexível Cu/PVC 70°C 0,6/1 kV ${currentResults.finalCableSection}mm² (Fases)`, qtd: cableQty, unit: 'm', price: '' },
                      { id: 'cable-ground', desc: `Cabo de potência flexível Cu/PVC 70°C 0,6/1 kV ${groundSection}mm² (PE/Terra)`, qtd: groundQty, unit: 'm', price: '' }
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
                          desc: product.verificationStatus === 'verified-exact'
                            ? `${categoryPrefix}${mfr} ${product.model}${product.commercialCode ? ` — Ref. ${product.commercialCode}` : ''}`
                            : `${categoryPrefix}${mfr}${req.current !== undefined ? ` — mínimo ${req.current.toFixed(1)} A` : ''}`,
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
                  "px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                  selectedManufacturer === mfr 
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mfr}
              </button>
            ))}
          </div>
          <button onClick={handlePrintProposal} className="btn-secondary">
            <Printer className="w-5 h-5" /> Imprimir proposta
          </button>
          <button onClick={handlePrintMemorial} className="btn-secondary">
            <Printer className="w-5 h-5" /> Imprimir memorial
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8">
        <div className="space-y-6 print:col-span-3">
          <div className="section-card print:hidden">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="section-heading mb-0">
                <div className="section-index">1</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-950">Identidade profissional</h3>
                    <span className="status-pill border-emerald-200 bg-emerald-50 text-emerald-700">Salva automaticamente</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">Sua marca será aplicada em todas as propostas e memoriais gerados.</p>
                </div>
              </div>
              <label className="btn-secondary h-10 px-4 text-sm cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                {companyProfile.logoDataUrl ? 'Trocar logomarca' : 'Adicionar logomarca'}
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={e => handleLogoUpload(e.target.files?.[0])}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-6">
              <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 min-h-[140px] flex items-center justify-center p-4">
                {companyProfile.logoDataUrl ? (
                  <div className="w-full text-center">
                    <img src={companyProfile.logoDataUrl} alt="Logomarca da empresa" className="max-w-full max-h-20 object-contain mx-auto" />
                    <button type="button" onClick={() => setCompanyProfile({ logoDataUrl: '' })} className="text-xs font-semibold text-slate-500 hover:text-red-600 mt-3">
                      Remover logo
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto" />
                    <p className="text-xs font-semibold mt-2">Sua marca aqui</p>
                    <p className="text-[11px] mt-1">PNG ou JPG • até 1 MB</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">Nome da empresa / profissional</Label>
                  <Input value={companyProfile.companyName} onChange={e => setCompanyProfile({ companyName: e.target.value })} placeholder="Ex: Silva Automação Industrial" />
                </div>
                <div className="space-y-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">CPF / CNPJ</Label>
                  <Input value={companyProfile.document} onChange={e => setCompanyProfile({ document: e.target.value })} placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">Responsável</Label>
                  <Input value={companyProfile.responsibleName} onChange={e => setCompanyProfile({ responsibleName: e.target.value })} placeholder="Nome do profissional responsável" />
                </div>
                <div className="space-y-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">CREA / CFT / Registro</Label>
                  <Input value={companyProfile.professionalRegistration} onChange={e => setCompanyProfile({ professionalRegistration: e.target.value })} placeholder="Ex: CFT-BR 0000000000" />
                </div>
                <div className="space-y-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">Telefone</Label>
                  <Input value={companyProfile.phone} onChange={e => setCompanyProfile({ phone: e.target.value })} placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">E-mail</Label>
                  <Input value={companyProfile.email} onChange={e => setCompanyProfile({ email: e.target.value })} placeholder="contato@empresa.com.br" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">Endereço</Label>
                  <Input value={companyProfile.address} onChange={e => setCompanyProfile({ address: e.target.value })} placeholder="Rua, número, bairro" />
                </div>
                <div className="space-y-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">Cidade / UF</Label>
                  <Input value={companyProfile.cityState} onChange={e => setCompanyProfile({ cityState: e.target.value })} placeholder="São Paulo / SP" />
                </div>
                <div className="space-y-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">Site / Instagram</Label>
                  <Input value={companyProfile.website} onChange={e => setCompanyProfile({ website: e.target.value })} placeholder="www.suaempresa.com.br" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">Cor da marca</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(companyProfile.brandColor) ? companyProfile.brandColor : '#2563EB'}
                      onChange={e => setCompanyProfile({ brandColor: e.target.value })}
                      className="h-11 w-16 rounded-lg border border-slate-300 bg-white p-1 cursor-pointer"
                      aria-label="Cor da marca"
                    />
                    <Input value={companyProfile.brandColor} onChange={e => setCompanyProfile({ brandColor: e.target.value })} className="max-w-40 uppercase" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-label uppercase tracking-widest text-[10px]">Fundo da logomarca</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['light', 'Claro'],
                      ['dark', 'Escuro'],
                      ['brand', 'Cor da marca'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCompanyProfile({ logoBackground: value as 'light' | 'dark' | 'brand' })}
                        className={cn(
                          'h-10 px-4 rounded-lg border text-sm font-semibold transition-all',
                          companyProfile.logoBackground === value
                            ? 'border-primary bg-blue-50 text-primary'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Apenas o bloco da logo muda de fundo; o cabeçalho do documento permanece claro.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Data Form - Hidden in Print if Empty */}
          <div className="section-card print:hidden">
            <div className="section-heading">
              <div className="section-index">2</div>
              <div>
                <h3 className="text-lg font-bold text-slate-950">Cliente e serviço</h3>
                <p className="text-sm text-slate-500 mt-0.5">Informações que aparecerão na proposta comercial.</p>
              </div>
            </div>
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
          <div className="bg-white border border-slate-200 rounded-[18px] shadow-lg shadow-slate-900/5 overflow-hidden print:border-0 print:shadow-none print:rounded-none">
            <div className="p-4 md:p-10 print:p-0 print:block">
              {/* PDF Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start mb-10 border-b pb-8 border-slate-100 gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-24 h-16 rounded-xl border border-slate-200 flex items-center justify-center p-2 shrink-0"
                    style={{
                      backgroundColor: companyProfile.logoBackground === 'dark'
                        ? '#0F172A'
                        : companyProfile.logoBackground === 'brand'
                          ? companyProfile.brandColor
                          : '#F8FAFC'
                    }}
                  >
                    {companyProfile.logoDataUrl ? (
                      <img src={companyProfile.logoDataUrl} alt="" className="max-h-12 max-w-20 object-contain" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-lg md:text-2xl font-black tracking-tight">{companyProfile.companyName || 'Sua empresa'}</h1>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground">
                      {[companyProfile.document, companyProfile.professionalRegistration].filter(Boolean).join(' • ') || 'Documento profissional personalizado'}
                    </p>
                    {(companyProfile.phone || companyProfile.email) && (
                      <p className="text-[10px] text-slate-500 mt-1">{[companyProfile.phone, companyProfile.email].filter(Boolean).join(' • ')}</p>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <h2 className="text-lg md:text-xl font-bold text-foreground">PROPOSTA COMERCIAL</h2>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Solução, escopo e investimento</p>
                  <p className="text-metadata font-bold mt-1">{new Date().toLocaleDateString('pt-BR')}</p>
                  {companyProfile.responsibleName && (
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                      Responsável: {companyProfile.responsibleName}
                      {companyProfile.professionalRegistration ? ` • ${companyProfile.professionalRegistration}` : ''}
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

              {/* Commercial Service Summary */}
              <div className="mb-6 print:mb-4">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: companyProfile.brandColor }}>Resumo do Serviço</h3>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Fabricante de referência: {selectedManufacturer}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-foreground/5 rounded-xl border border-foreground/10">
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Carga</p>
                    <p className="text-sm font-bold">{currentInputs?.power} {currentInputs?.powerUnit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Alimentação</p>
                    <p className="text-sm font-bold">{currentInputs?.voltage} V</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Acionamento</p>
                    <p className="text-sm font-bold capitalize">{currentInputs?.starterType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Distância aproximada</p>
                    <p className="text-sm font-bold">{currentInputs?.distance} m</p>
                  </div>
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
                    <Textarea
                      value={observations}
                      onChange={e => setObservations(e.target.value)}
                      className="min-h-[80px] text-xs border-border"
                      placeholder="Ex: Prazo de entrega, garantia, condições de pagamento ou observações específicas do serviço."
                    />
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
                  * Proposta válida por {costs.validity} dias. Alterações de escopo, materiais ou condições de campo não previstas poderão exigir revisão de valores e prazos.
                </div>
                <div className="text-center w-64 print:w-48">
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1 print:text-[8pt]">
                    {companyProfile.responsibleName || 'Responsável pelo serviço'}
                  </div>
                  {companyProfile.professionalRegistration && (
                    <div className="text-[9px] text-muted-foreground uppercase mb-1 print:text-[7pt]">
                      {companyProfile.professionalRegistration}
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
        <div className="space-y-6 print:hidden">
          <div className="section-card space-y-6 xl:sticky xl:top-24">
            <div>
              <span className="eyebrow">Configuração</span>
              <h3 className="text-lg font-bold text-slate-950 mt-1">Dados comerciais</h3>
              <p className="text-sm text-slate-500 mt-1">Defina os parâmetros comerciais. A identidade profissional vem do perfil salvo acima.</p>
            </div>
            
            <div className="space-y-4">

              <div className="space-y-2">
                <Label className="text-label uppercase tracking-widest text-[10px]">Validade da Proposta (Dias)</Label>
                <Input type="number" value={costs.validity} onChange={e => setCosts({...costs, validity: parseInt(e.target.value) || 30})} />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-widest text-[10px]">Valor da Hora Técnica (R$)</Label>
                <Input type="number" value={labor.rate} onChange={e => setLabor({...labor, rate: parseFloat(e.target.value) || 0})} />
              </div>
            </div>

            <div className="pt-5 border-t border-border">
              <div className="space-y-3">
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                  <p className="text-xs font-semibold text-slate-900">Proposta comercial</p>
                  <p className="text-[11px] text-slate-600 mt-1">Escopo, materiais, preços, investimento, validade e aceite do cliente.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-900">Memorial descritivo</p>
                  <p className="text-[11px] text-slate-600 mt-1">Documento técnico narrativo com sistema, instalação, execução e comissionamento — sem preços.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-900">Salvamento automático</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">As alterações desta proposta são gravadas automaticamente.</p>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Documentos</p>
                <button onClick={handlePrintProposal} className="btn-secondary w-full h-10 px-3 text-sm">
                  <Printer className="w-4 h-4" /> Imprimir proposta
                </button>
                <button onClick={handlePrintMemorial} className="btn-secondary w-full h-10 px-3 text-sm">
                  <Printer className="w-4 h-4" /> Imprimir memorial
                </button>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Na janela de impressão, o usuário também pode escolher “Salvar como PDF”.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};