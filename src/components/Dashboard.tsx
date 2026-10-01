import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  ArrowRight,
  Cable,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const Dashboard = () => {
  const { setView, history, openHistoryItem, proposals } = useAppStore();
  const [showAll, setShowAll] = useState(false);

  const proposalCount = proposals.length;
  const latestDate =
    history.length > 0 ? new Date(history[0]!.date).toLocaleDateString("pt-BR") : "—";
  const visibleHistory = showAll ? history : history.slice(0, 5);

  return (
    <div className="page-shell">
      <section className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.55fr] gap-6 mb-8">
        <div className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-blue-50" />
          <div className="relative max-w-3xl">
            <span className="eyebrow">Dimensionamento de comandos elétricos</span>
            <h1 className="page-heading mt-3 max-w-2xl">
              Dimensione com clareza técnica e gere a documentação do serviço.
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Calcule condutores, verifique queda de tensão, organize componentes e transforme o
              resultado em uma proposta técnica.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <button onClick={() => setView("wizard")} className="btn-primary sm:w-auto">
                <Plus className="w-5 h-5" /> Novo dimensionamento
              </button>
              {history.length > 0 && (
                <button
                  onClick={() => openHistoryItem(history[0]!)}
                  className="btn-secondary sm:w-auto"
                >
                  Abrir último cálculo <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {proposals.length > 0 && (
                <button onClick={() => setView("proposals")} className="btn-secondary sm:w-auto">
                  Ver propostas <FileText className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-7 border-t border-slate-100">
              {(
                [
                  ["Condutores", "Ampacidade + ΔV", Cable],
                  ["Correções", "Temperatura e agrupamento", ShieldCheck],
                  ["Componentes", "Catálogo auditado", CheckCircle2],
                  ["Proposta", "Materiais e serviços", FileText],
                ] as const
              ).map(([title, desc, Icon]) => (
                <div key={String(title)} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{String(title)}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      {String(desc)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
          <div className="metric-card flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Dimensionamentos</p>
              <p className="text-3xl font-bold tracking-tight mt-1">{history.length}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <button
            onClick={() => setView("proposals")}
            className="metric-card flex items-center justify-between text-left hover:border-slate-300 transition-colors"
          >
            <div>
              <p className="text-xs font-medium text-slate-500">Propostas salvas</p>
              <p className="text-3xl font-bold tracking-tight mt-1">{proposalCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </button>
          <div className="metric-card flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Última atividade</p>
              <p className="text-xl font-bold tracking-tight mt-1">{latestDate}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock3 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="eyebrow">Histórico</span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
              Últimos dimensionamentos
            </h2>
          </div>
          {history.length > 5 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="btn-secondary h-10 px-4 text-sm"
            >
              {showAll ? "Mostrar recentes" : "Ver histórico completo"}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-slate-300 bg-slate-50/60 py-14 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 mt-5">Nenhum dimensionamento salvo</h3>
            <p className="text-sm text-slate-500 mt-1">
              Crie o primeiro cálculo para iniciar seu histórico.
            </p>
            <button onClick={() => setView("wizard")} className="btn-primary h-11 mt-5 mx-auto">
              <Plus className="w-4 h-4" /> Criar primeiro cálculo
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[14px] border border-slate-200">
            <div className="hidden md:grid grid-cols-[1.1fr_1fr_1fr_0.8fr_0.6fr_auto] gap-4 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Motor</span>
              <span>Sistema</span>
              <span>Partida</span>
              <span>Data</span>
              <span>Seção</span>
              <span></span>
            </div>
            <div className="divide-y divide-slate-200 bg-white">
              {visibleHistory.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_1fr_0.8fr_0.6fr_auto] gap-3 md:gap-4 px-5 py-4 items-center hover:bg-slate-50/70 transition-colors"
                >
                  <div>
                    <p className="text-xs text-slate-400 md:hidden">Motor</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.power} {item.powerUnit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 md:hidden">Sistema</p>
                    <p className="text-sm font-medium text-slate-700">
                      {item.voltage} V • {item.phase}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 md:hidden">Partida</p>
                    <p className="text-sm font-medium text-slate-700">{item.starterType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 md:hidden">Data</p>
                    <p className="text-sm text-slate-600">
                      {new Date(item.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 md:hidden">Seção</p>
                    <span className="status-pill border-blue-100 bg-blue-50 text-blue-700">
                      {item.finalCableSection} mm²
                    </span>
                  </div>
                  <button
                    onClick={() => openHistoryItem(item)}
                    className="btn-secondary h-9 px-4 text-sm w-full md:w-auto"
                  >
                    Abrir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
