import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Printer, Save } from 'lucide-react';

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
      { id: '2', desc: 'Disjuntor de Proteção', qtd: 1, unit: 'un', price: 0 },
      { id: '3', desc: 'Contator de Potência', qtd: 1, unit: 'un', price: 0 },
      { id: '4', desc: 'Relé Térmico de Sobrecarga', qtd: 1, unit: 'un', price: 0 },
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

  const totalMaterials = items.reduce((acc, item) => acc + (item.qtd * item.price), 0);
  const totalLabor = labor.hours * labor.rate;
  const grandTotal = totalMaterials + totalLabor + costs.travel + costs.others - costs.discount;

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), desc: '', qtd: 1, unit: 'un', price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setView('results')}><ArrowLeft className="mr-2" /> Voltar aos Resultados</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 w-4 h-4" /> Imprimir</Button>
          <Button className="bg-accent text-black font-bold"><Save className="mr-2 w-4 h-4" /> Salvar Proposta</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-panel border-border">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-bold text-white">Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome / Razão Social</Label>
                  <Input value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} placeholder="Ex: Indústria Alfa" />
                </div>
                <div className="space-y-2">
                  <Label>CPF / CNPJ</Label>
                  <Input value={clientData.doc} onChange={e => setClientData({...clientData, doc: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={clientData.email} onChange={e => setClientData({...clientData, email: e.target.value})} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-panel border-border">
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Lista de Materiais</h3>
                <Button size="sm" variant="outline" onClick={addItem}><Plus className="mr-2 w-4 h-4" /> Add Item</Button>
              </div>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-end border-b border-border/50 pb-4">
                    <div className="col-span-5 space-y-2">
                      <Label className="text-[10px] uppercase text-muted">Descrição</Label>
                      <Input value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-[10px] uppercase text-muted">Qtd</Label>
                      <Input type="number" value={item.qtd} onChange={e => updateItem(item.id, 'qtd', parseFloat(e.target.value))} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-[10px] uppercase text-muted">Preço Un.</Label>
                      <Input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value))} />
                    </div>
                    <div className="col-span-2 text-right py-2">
                      <span className="text-sm font-mono text-white">R$ {(item.qtd * item.price).toFixed(2)}</span>
                    </div>
                    <div className="col-span-1 text-right">
                      <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-400" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-panel border-border">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-bold text-white">Mão de Obra e Prazos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tempo Estimado (Horas)</Label>
                  <Input type="number" value={labor.hours} onChange={e => setLabor({...labor, hours: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Valor Hora (R$)</Label>
                  <Input type="number" value={labor.rate} onChange={e => setLabor({...labor, rate: parseFloat(e.target.value)})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Observações do Serviço</Label>
                  <Textarea placeholder="Descreva o que será realizado..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-panel border-accent border-2 sticky top-24">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-bold text-white text-center">Resumo Financeiro</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Materiais</span>
                  <span className="text-white">R$ {totalMaterials.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Mão de Obra</span>
                  <span className="text-white">R$ {totalLabor.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-border space-y-3">
                  <div className="flex justify-between items-center text-muted">
                    <span>Deslocamento</span>
                    <Input className="w-24 h-8 text-right" type="number" value={costs.travel} onChange={e => setCosts({...costs, travel: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>Outros Custos</span>
                    <Input className="w-24 h-8 text-right" type="number" value={costs.others} onChange={e => setCosts({...costs, others: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="flex justify-between items-center text-red-400">
                    <span>Desconto</span>
                    <Input className="w-24 h-8 text-right border-red-900/50" type="number" value={costs.discount} onChange={e => setCosts({...costs, discount: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border text-center">
                <span className="text-muted text-xs uppercase font-bold tracking-widest">Valor Total do Serviço</span>
                <div className="text-4xl font-black text-accent mt-2">R$ {grandTotal.toFixed(2)}</div>
              </div>

              <Button className="w-full bg-accent hover:bg-accent/90 text-black font-bold h-12 text-lg">
                Gerar Proposta Final
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
