import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Printer, Save, CheckCircle2 } from 'lucide-react';

export const ProposalFlow = () => {
  const { setView, currentResults, currentInputs } = useAppStore();
  const [clientData, setClientData] = useState({
    name: '',
    doc: '',
    company: '',
    phone: '',
    email: '',
    address: ''
  });
  
  const [items, setItems] = useState<any[]>(
    currentResults ? [
      { id: '1', desc: `Cabo Flexível ${currentResults.finalCableSection}mm²`, qtd: currentInputs?.distance || 1, unit: 'm', price: 0 },
      { id: '2', desc: currentResults.protections.breaker?.model || 'Disjuntor de Proteção', qtd: 1, unit: 'un', price: 0 },
      { id: '3', desc: currentResults.protections.contactor?.[0]?.model || 'Contator de Potência', qtd: 1, unit: 'un', price: 0 },
      { id: '4', desc: currentResults.protections.thermalRelay?.model || 'Relé Térmico', qtd: 1, unit: 'un', price: 0 },
    ] : []
  );

  const [labor, setLabor] = useState({
    hours: 0,
    rate: 150,
    total: 0
  });

  const [costs, setCosts] = useState({
    travel: 0,
    others: 0,
    discount: 0
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
    toast.success('Proposta salva com sucesso!');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 pb-32 print:pb-0 print:py-0 print:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 print:mb-8">
        <div className="space-y-1">
          <button 
            onClick={() => setView('results')}
            className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-2 no-print"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Resultado
          </button>
          <h1 className="text-3xl font-semibold text-slate-900">Proposta Comercial</h1>
          <p className="text-slate-500 no-print">Transforme seu dimensionamento em um orçamento profissional.</p>
          <div className="hidden print:block text-slate-500 text-sm">
            Gerado em: {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Salvar Proposta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Client Data */}
          <div className="card-panel space-y-6">
            <h3 className="text-card-title">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-wider">Nome / Razão Social</Label>
                <Input className="h-11 border-slate-200" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} placeholder="Ex: Indústria Metalúrgica SA" />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-wider">CPF / CNPJ</Label>
                <Input className="h-11 border-slate-200" value={clientData.doc} onChange={e => setClientData({...clientData, doc: e.target.value})} placeholder="00.000.000/0001-00" />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-wider">Telefone</Label>
                <Input className="h-11 border-slate-200" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-wider">E-mail</Label>
                <Input className="h-11 border-slate-200" value={clientData.email} onChange={e => setClientData({...clientData, email: e.target.value})} placeholder="cliente@email.com" />
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="card-panel space-y-6 print:space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-card-title">Lista de Materiais</h3>
              <button onClick={addItem} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 no-print">
                <Plus className="w-4 h-4" /> Adicionar Item
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-2 text-metadata font-bold uppercase tracking-wider">
                <div className="col-span-6">Descrição</div>
                <div className="col-span-2 text-center">Qtd</div>
                <div className="col-span-2 text-right">Preço Un.</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-2 border border-slate-50 rounded-lg hover:border-slate-200 transition-colors group">
                    <div className="col-span-6">
                      <Input value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} className="h-9 border-transparent bg-transparent hover:border-slate-200 focus:bg-white focus:border-blue-200 transition-all" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" value={item.qtd} onChange={e => updateItem(item.id, 'qtd', parseFloat(e.target.value) || 0)} className="h-9 text-center border-transparent bg-transparent hover:border-slate-200 focus:bg-white focus:border-blue-200" />
                    </div>
                    <div className="col-span-2">
                      <Input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="h-9 text-right border-transparent bg-transparent hover:border-slate-200 focus:bg-white focus:border-blue-200" />
                    </div>
                    <div className="col-span-1 text-right text-sm font-semibold text-slate-700">
                      R$ {(item.qtd * (item.price || 0)).toFixed(2)}
                    </div>
                    <div className="col-span-1 text-right">
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Labor */}
          <div className="card-panel space-y-6">
            <h3 className="text-card-title">Mão de Obra e Prazos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-wider">Tempo Estimado (Horas)</Label>
                <Input type="number" className="h-11 border-slate-200" value={labor.hours} onChange={e => setLabor({...labor, hours: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label className="text-label uppercase tracking-wider">Valor Hora (R$)</Label>
                <Input type="number" className="h-11 border-slate-200" value={labor.rate} onChange={e => setLabor({...labor, rate: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-label uppercase tracking-wider">Observações do Serviço</Label>
                <Textarea className="min-h-[100px] border-slate-200" placeholder="Ex: Instalação, testes e entrega técnica inclusos..." />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="space-y-6 print:space-y-4">
          <div className="card-panel border-blue-600 border-2 sticky top-24 space-y-8 print:static print:border-1 print:space-y-4">
            <h3 className="text-card-title text-center">Resumo Financeiro</h3>
            
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Materiais</span>
                <span className="text-slate-900">R$ {totalMaterials.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Mão de Obra</span>
                <span className="text-slate-900">R$ {totalLabor.toFixed(2)}</span>
              </div>
              
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Deslocamento</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">R$</span>
                    <input type="number" className="w-20 text-right bg-slate-50 border-none rounded p-1 text-slate-900 focus:ring-1 focus:ring-blue-600 outline-none" value={costs.travel} onChange={e => setCosts({...costs, travel: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Outros Custos</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">R$</span>
                    <input type="number" className="w-20 text-right bg-slate-50 border-none rounded p-1 text-slate-900 focus:ring-1 focus:ring-blue-600 outline-none" value={costs.others} onChange={e => setCosts({...costs, others: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-red-500">
                  <span>Desconto</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">- R$</span>
                    <input type="number" className="w-20 text-right bg-red-50 border-none rounded p-1 text-red-600 focus:ring-1 focus:ring-red-600 outline-none" value={costs.discount} onChange={e => setCosts({...costs, discount: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 text-center">
              <p className="text-metadata font-bold uppercase tracking-widest mb-1">Valor Total da Proposta</p>
              <div className="text-4xl font-black text-blue-600">R$ {grandTotal.toFixed(2)}</div>
            </div>

            <button onClick={handleSave} className="btn-primary w-full h-14 text-lg shadow-xl shadow-blue-100 no-print">
              Gerar Proposta Final
            </button>
            
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              * Valores sujeitos a alteração conforme disponibilidade de estoque dos fornecedores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
