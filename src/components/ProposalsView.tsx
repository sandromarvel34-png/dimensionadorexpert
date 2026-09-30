import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { generateCommercialProposalPdf, generateDescriptiveMemorialPdf } from '@/lib/pdf/generateProposalPdf';
import { Copy, FileDown, FileText, Pencil, Printer, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ProposalStatus, SavedProposal } from '@/types';

const statusLabel: Record<ProposalStatus, string> = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  aprovada: 'Aprovada',
  recusada: 'Recusada',
};

const statusClass: Record<ProposalStatus, string> = {
  rascunho: 'border-slate-200 bg-slate-50 text-slate-700',
  enviada: 'border-blue-200 bg-blue-50 text-blue-700',
  aprovada: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  recusada: 'border-red-200 bg-red-50 text-red-700',
};

const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ProposalsView = () => {
  const {
    proposals,
    openProposal,
    duplicateProposal,
    deleteProposal,
    setProposalStatus,
  } = useAppStore();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'todas' | ProposalStatus>('todas');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return proposals
      .filter(item => filter === 'todas' || item.status === filter)
      .filter(item => {
        if (!normalized) return true;
        return [
          item.clientData.name,
          item.clientData.doc,
          item.commercialData.serviceDescription,
          item.selectedManufacturer,
        ].some(value => String(value || '').toLowerCase().includes(normalized));
      })
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [proposals, query, filter]);

  const approved = proposals.filter(item => item.status === 'aprovada').length;
  const sent = proposals.filter(item => item.status === 'enviada').length;
  const totalApproved = proposals
    .filter(item => item.status === 'aprovada')
    .reduce((sum, item) => sum + (item.total || 0), 0);

  const pdfData = (proposal: SavedProposal) => ({
    companyProfile: proposal.companyProfile,
    clientData: proposal.clientData,
    commercialData: proposal.commercialData,
    observations: proposal.observations,
    items: proposal.items,
    labor: proposal.labor,
    costs: proposal.costs,
    selectedManufacturer: proposal.selectedManufacturer,
    currentInputs: proposal.currentInputs,
    currentResults: proposal.currentResults,
  });

  const handlePdf = async (proposal: SavedProposal, type: 'proposal' | 'memorial', action: 'save' | 'print') => {
    try {
      if (type === 'proposal') {
        await generateCommercialProposalPdf({ data: pdfData(proposal), action });
      } else {
        await generateDescriptiveMemorialPdf({ data: pdfData(proposal), action });
      }
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível gerar o documento.');
    }
  };

  const handleDelete = (proposal: SavedProposal) => {
    const label = proposal.clientData.name || 'esta proposta';
    if (!window.confirm(`Excluir a proposta de ${label}? Esta ação não pode ser desfeita.`)) return;
    deleteProposal(proposal.id);
    toast.success('Proposta excluída.');
  };

  return (
    <div className="page-shell">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
        <div>
          <span className="eyebrow">Gestão comercial</span>
          <h1 className="page-heading mt-2">Propostas</h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Consulte, edite e reutilize as propostas criadas a partir dos seus dimensionamentos.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 min-w-0 lg:min-w-[420px]">
          <div className="metric-card">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-2xl font-bold mt-1">{proposals.length}</p>
          </div>
          <div className="metric-card">
            <p className="text-xs text-slate-500">Aprovadas</p>
            <p className="text-2xl font-bold mt-1">{approved}</p>
          </div>
          <div className="metric-card">
            <p className="text-xs text-slate-500">Valor aprovado</p>
            <p className="text-lg font-bold mt-1">{money(totalApproved)}</p>
          </div>
        </div>
      </div>

      <section className="section-card">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
          <div className="relative w-full xl:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por cliente, documento ou serviço..."
              className="h-11 w-full rounded-[10px] border border-slate-300 bg-white pl-10 pr-4 text-sm focus:border-primary focus:ring-3 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              ['todas', 'Todas'],
              ['rascunho', 'Rascunhos'],
              ['enviada', `Enviadas ${sent ? `(${sent})` : ''}`],
              ['aprovada', 'Aprovadas'],
              ['recusada', 'Recusadas'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`h-9 px-3 rounded-lg border text-sm font-semibold transition-all ${
                  filter === value
                    ? 'border-primary bg-blue-50 text-primary'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-slate-300 bg-slate-50/60 py-14 px-6 text-center">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-slate-900 mt-4">
              {proposals.length === 0 ? 'Nenhuma proposta salva' : 'Nenhuma proposta encontrada'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {proposals.length === 0
                ? 'Crie uma proposta a partir de um dimensionamento e use “Salvar dados da proposta”.'
                : 'Altere a busca ou o filtro selecionado.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(proposal => (
              <article key={proposal.id} className="rounded-[16px] border border-slate-200 bg-white p-4 md:p-5 hover:border-slate-300 transition-colors">
                <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr_auto] gap-5 xl:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-950 truncate">
                        {proposal.clientData.name || 'Cliente não informado'}
                      </h3>
                      <span className={`status-pill ${statusClass[proposal.status]}`}>
                        {statusLabel[proposal.status]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {proposal.commercialData.serviceDescription || 'Serviço sem descrição'}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
                      <span>Atualizada em {new Date(proposal.updatedAt).toLocaleDateString('pt-BR')}</span>
                      <span>{proposal.currentInputs.power} {proposal.currentInputs.powerUnit} • {proposal.currentInputs.voltage} V</span>
                      <span>{proposal.selectedManufacturer}</span>
                    </div>
                  </div>

                  <div className="xl:text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Valor</p>
                    <p className="text-2xl font-bold text-slate-950 mt-1">
                      {proposal.total > 0 ? money(proposal.total) : 'A definir'}
                    </p>
                    <select
                      value={proposal.status}
                      onChange={e => setProposalStatus(proposal.id, e.target.value as ProposalStatus)}
                      className="mt-2 h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
                    >
                      <option value="rascunho">Rascunho</option>
                      <option value="enviada">Enviada</option>
                      <option value="aprovada">Aprovada</option>
                      <option value="recusada">Recusada</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap xl:justify-end gap-2">
                    <button onClick={() => openProposal(proposal.id)} className="btn-primary h-9 px-3 text-sm">
                      <Pencil className="w-4 h-4" /> Abrir
                    </button>
                    <button onClick={() => duplicateProposal(proposal.id)} className="btn-secondary h-9 px-3 text-sm" title="Duplicar">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handlePdf(proposal, 'proposal', 'save')} className="btn-secondary h-9 px-3 text-sm" title="Salvar proposta em PDF">
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => handlePdf(proposal, 'proposal', 'print')} className="btn-secondary h-9 px-3 text-sm" title="Imprimir proposta">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(proposal)} className="h-9 px-3 rounded-[10px] border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button onClick={() => handlePdf(proposal, 'memorial', 'save')} className="text-xs font-semibold text-slate-600 hover:text-primary">
                    Salvar memorial PDF
                  </button>
                  <span className="text-slate-300">•</span>
                  <button onClick={() => handlePdf(proposal, 'memorial', 'print')} className="text-xs font-semibold text-slate-600 hover:text-primary">
                    Imprimir memorial
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
