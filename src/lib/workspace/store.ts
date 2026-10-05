import { create } from "zustand";
import { refreshManufacturerReferences } from "../catalog/selection";
import { proposalTotals } from "../proposal/validation";
import type {
  CalculationInputs,
  CalculationResults,
  CompanyProfile,
  ProposalStatus,
  SavedProposal,
  ManufacturerProduct,
} from "@/types";
import type { CalculationRecord, WorkspaceRepository } from "./repository";

export const LEGACY_KEY = "calculadora-eletrica-pro-storage";
export const workspaceCacheKey = (id: string) => `dimensionador-workspace-v2:${id}`;
export const emptyCompany = (): CompanyProfile => ({
  companyName: "",
  document: "",
  responsibleName: "",
  professionalRegistration: "",
  phone: "",
  email: "",
  address: "",
  cityState: "",
  website: "",
  logoDataUrl: "",
  brandColor: "#2563EB",
  logoBackground: "light",
});
type Pending = { proposals: Record<string, SavedProposal>; company: CompanyProfile | null };
type History = CalculationInputs &
  CalculationResults & {
    id: string;
    date: string;
    hasProposal: boolean;
    inputs: CalculationInputs;
    results: CalculationResults;
    manufacturer: SavedProposal["selectedManufacturer"];
  };
export interface AppState {
  ownerId: string | null;
  ready: boolean;
  loading: boolean;
  loadError: string;
  syncError: string;
  syncing: number;
  pending: Pending;
  view:
    | "dashboard"
    | "wizard"
    | "results"
    | "proposal"
    | "proposals"
    | "educational"
    | "account"
    | "admin";
  step: number;
  currentInputs: CalculationInputs | null;
  currentResults: CalculationResults | null;
  currentHistoryId: string | null;
  selectedProducts: Record<string, ManufacturerProduct>;
  selectedManufacturer: SavedProposal["selectedManufacturer"];
  history: History[];
  companyProfile: CompanyProfile;
  proposals: SavedProposal[];
  currentProposalId: string | null;
  initialize: (id: string) => Promise<void>;
  detach: () => void;
  retrySync: () => Promise<void>;
  setView: (view: AppState["view"]) => void;
  setStep: (step: number) => void;
  setCalculation: (inputs: CalculationInputs, results: CalculationResults) => Promise<void>;
  setSelectedProducts: (products: Record<string, ManufacturerProduct>) => void;
  setSelectedManufacturer: (manufacturer: SavedProposal["selectedManufacturer"]) => void;
  openHistoryItem: (item: History) => void;
  setCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  saveProposal: (proposal: SavedProposal) => void;
  openProposal: (id: string) => void;
  startNewProposal: () => void;
  duplicateProposal: (id: string) => void;
  deleteProposal: (id: string) => Promise<void>;
  setProposalStatus: (id: string, status: ProposalStatus) => void;
  clearCalculations: () => Promise<void>;
  clearProposals: () => Promise<void>;
  resetWorkspace: () => Promise<void>;
  importLegacy: () => Promise<void>;
}
const initialData = () => ({
  ownerId: null,
  ready: false,
  loading: false,
  loadError: "",
  syncError: "",
  syncing: 0,
  pending: { proposals: {}, company: null } as Pending,
  view: "dashboard" as AppState["view"],
  step: 1,
  currentInputs: null,
  currentResults: null,
  currentHistoryId: null,
  selectedProducts: {},
  selectedManufacturer: "WEG" as const,
  history: [] as History[],
  companyProfile: emptyCompany(),
  proposals: [] as SavedProposal[],
  currentProposalId: null,
});
const historyRecord = (r: CalculationRecord, proposals: SavedProposal[]): History => ({
  ...r.inputs,
  ...r.results,
  ...r,
  hasProposal: proposals.some((p) => p.calculationHistoryId === r.id),
});
const message = (error: unknown) =>
  error instanceof Error ? error.message : "Não foi possível salvar os dados na conta.";

// Separate store instances are injectable for isolation and race-condition tests.
export function createWorkspaceStore(
  repository: WorkspaceRepository,
  storage: () => Pick<Storage, "getItem" | "setItem"> | null,
) {
  let epoch = 0;
  let writes: Promise<unknown> = Promise.resolve();
  return create<AppState>()((set, get) => {
    const cache = () => {
      const s = get();
      if (!s.ownerId) return;
      try {
        storage()?.setItem(
          workspaceCacheKey(s.ownerId),
          JSON.stringify({ ownerId: s.ownerId, pending: s.pending }),
        );
      } catch {
        set({
          syncError:
            "O navegador não conseguiu guardar o rascunho. Mantenha a página aberta até o salvamento na conta terminar.",
        });
      }
    };
    const context = () => {
      const s = get();
      if (!s.ownerId || !s.ready) throw new Error("Aguarde o carregamento da sua conta.");
      return { userId: s.ownerId, generation: epoch };
    };
    const valid = (c: { userId: string; generation: number }) =>
      c.generation === epoch && get().ownerId === c.userId;
    const enqueue = (task: (userId: string) => Promise<void>, done?: () => void): Promise<void> => {
      const c = context();
      set((s) => ({ syncing: s.syncing + 1 }));
      const next = writes
        .catch(() => undefined)
        .then(async () => {
          if (!valid(c)) throw new Error("A conta foi alterada.");
          await task(c.userId);
          if (!valid(c)) throw new Error("A conta foi alterada.");
          done?.();
        });
      writes = next;
      return next
        .catch((error) => {
          if (valid(c)) set({ syncError: message(error) });
          throw error;
        })
        .finally(() => {
          if (valid(c)) set((s) => ({ syncing: Math.max(0, s.syncing - 1) }));
        });
    };
    const flushProposal = (p: SavedProposal) => {
      // Each edit is durable locally under its owner before the network starts.
      void enqueue(
        async (userId) => {
          if (get().pending.proposals[p.id] !== p) return;
          await repository.saveProposal(userId, p);
        },
        () => {
          if (get().pending.proposals[p.id] !== p) return;
          set((s) => {
            const proposals = { ...s.pending.proposals };
            delete proposals[p.id];
            return { pending: { ...s.pending, proposals }, syncError: "" };
          });
          cache();
        },
      ).catch(() => undefined);
    };
    const flushCompany = (company: CompanyProfile) => {
      void enqueue(
        async (userId) => {
          if (get().pending.company === company) await repository.saveCompany(userId, company);
        },
        () => {
          if (get().pending.company === company) {
            set((s) => ({ pending: { ...s.pending, company: null }, syncError: "" }));
            cache();
          }
        },
      ).catch(() => undefined);
    };
    const clear = async (kind: "calculations" | "proposals" | "all") => {
      await enqueue(
        (userId) => repository.clear(userId, kind),
        () => {
          set((s) => ({
            ...(kind !== "proposals"
              ? {
                  history: [],
                  currentInputs: null,
                  currentResults: null,
                  currentHistoryId: null,
                  currentProposalId: null,
                  selectedProducts: {},
                  view: "dashboard" as const,
                  step: 1,
                }
              : {}),
            ...(kind === "proposals"
              ? { history: s.history.map((h) => ({ ...h, hasProposal: false })) }
              : {}),
            proposals:
              kind === "calculations"
                ? s.proposals.map((p) => ({ ...p, calculationHistoryId: null }))
                : [],
            pending: {
              ...s.pending,
              proposals:
                kind === "calculations"
                  ? Object.fromEntries(
                      Object.entries(s.pending.proposals).map(([id, p]) => [
                        id,
                        { ...p, calculationHistoryId: null },
                      ]),
                    )
                  : {},
            },
            currentProposalId: null,
            syncError: "",
          }));
          cache();
        },
      );
      if (kind === "calculations") await get().retrySync();
    };
    return {
      ...initialData(),
      detach: () => {
        epoch++;
        writes = Promise.resolve();
        set(initialData());
      },
      initialize: async (id) => {
        epoch++;
        const generation = epoch;
        writes = Promise.resolve();
        set({ ...initialData(), ownerId: id, loading: true });
        let pending: Pending = { proposals: {}, company: null };
        try {
          const raw = storage()?.getItem(workspaceCacheKey(id));
          if (raw) {
            const saved = JSON.parse(raw);
            if (saved.ownerId === id) pending = saved.pending;
          }
        } catch {
          /* An unusable local cache never authorizes access to another workspace. */
        }
        try {
          const cloud = await repository.load(id);
          if (generation !== epoch || get().ownerId !== id) return;
          const proposals = [
            ...cloud.proposals.filter((p) => !pending.proposals[p.id]),
            ...Object.values(pending.proposals),
          ];
          set({
            ready: true,
            loading: false,
            proposals,
            pending,
            history: cloud.calculations.map((r) => historyRecord(r, proposals)),
            companyProfile: pending.company || cloud.company || emptyCompany(),
          });
          await get().retrySync();
        } catch (error) {
          if (generation === epoch) set({ loading: false, loadError: message(error) });
        }
      },
      retrySync: async () => {
        const c = context();
        Object.values(get().pending.proposals).forEach(flushProposal);
        if (get().pending.company) flushCompany(get().pending.company!);
        await writes.catch(() => undefined);
        if (valid(c) && !Object.keys(get().pending.proposals).length && !get().pending.company)
          set({ syncError: "" });
      },
      setView: (view) => set({ view }),
      setStep: (step) => set({ step }),
      setCalculation: async (inputs, results) => {
        const r: CalculationRecord = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          inputs,
          results,
          manufacturer:
            inputs.preferredManufacturer && inputs.preferredManufacturer !== "any"
              ? (inputs.preferredManufacturer as SavedProposal["selectedManufacturer"])
              : get().selectedManufacturer,
        };
        await enqueue(
          (userId) => repository.saveCalculation(userId, r),
          () =>
            set((s) => ({
              currentInputs: inputs,
              currentResults: results,
              currentHistoryId: r.id,
              selectedManufacturer: r.manufacturer,
              selectedProducts: {},
              currentProposalId: null,
              view: "results",
              history: [historyRecord(r, s.proposals), ...s.history],
              syncError: "",
            })),
        );
      },
      setSelectedProducts: (selectedProducts) => set({ selectedProducts }),
      setSelectedManufacturer: (selectedManufacturer) => set({ selectedManufacturer }),
      openHistoryItem: (item) =>
        set({
          currentInputs: item.inputs,
          currentResults: refreshManufacturerReferences(item.results, item.inputs),
          currentHistoryId: item.id,
          selectedManufacturer: item.manufacturer,
          selectedProducts: {},
          currentProposalId: null,
          view: "results",
        }),
      setCompanyProfile: (profile) => {
        context();
        const company = { ...get().companyProfile, ...profile };
        set((s) => ({ companyProfile: company, pending: { ...s.pending, company } }));
        cache();
        flushCompany(company);
      },
      saveProposal: (proposal) => {
        proposal = { ...proposal, total: proposalTotals(proposal).total };
        context();
        set((s) => ({
          proposals: s.proposals.some((p) => p.id === proposal.id)
            ? s.proposals.map((p) => (p.id === proposal.id ? proposal : p))
            : [proposal, ...s.proposals],
          currentProposalId: proposal.id,
          history: s.history.map((h) =>
            h.id === proposal.calculationHistoryId ? { ...h, hasProposal: true } : h,
          ),
          pending: { ...s.pending, proposals: { ...s.pending.proposals, [proposal.id]: proposal } },
        }));
        cache();
        flushProposal(proposal);
      },
      openProposal: (id) => {
        const p = get().proposals.find((p) => p.id === id);
        if (!p) return;
        set({
          currentProposalId: p.id,
          currentInputs: p.currentInputs,
          currentResults: refreshManufacturerReferences(p.currentResults, p.currentInputs),
          currentHistoryId: p.calculationHistoryId,
          selectedManufacturer: p.selectedManufacturer,
          selectedProducts: {},
          view: "proposal",
        });
      },
      startNewProposal: () => set({ currentProposalId: null, view: "proposal" }),
      duplicateProposal: (id) => {
        const p = get().proposals.find((p) => p.id === id);
        if (!p) return;
        const now = new Date().toISOString();
        get().saveProposal({
          ...p,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          status: "rascunho",
          clientData: { ...p.clientData, name: `${p.clientData.name || "Proposta"} - Cópia` },
          items: p.items.map((i) => ({ ...i, id: crypto.randomUUID() })),
        });
      },
      deleteProposal: async (id) => {
        await enqueue(
          (userId) => repository.deleteProposal(userId, id),
          () => {
            set((s) => {
              const proposals = s.proposals.filter((p) => p.id !== id);
              const pending = { ...s.pending.proposals };
              delete pending[id];
              return {
                proposals,
                pending: { ...s.pending, proposals: pending },
                currentProposalId: s.currentProposalId === id ? null : s.currentProposalId,
                history: s.history.map((h) => ({
                  ...h,
                  hasProposal: proposals.some((p) => p.calculationHistoryId === h.id),
                })),
                syncError: "",
              };
            });
            cache();
          },
        );
      },
      setProposalStatus: (id, status) => {
        const p = get().proposals.find((p) => p.id === id);
        if (p) get().saveProposal({ ...p, status, updatedAt: new Date().toISOString() });
      },
      clearCalculations: () => clear("calculations"),
      clearProposals: () => clear("proposals"),
      resetWorkspace: () => clear("all"),
      importLegacy: async () => {
        const c = context();
        const local = storage();
        if (!local) throw new Error("Armazenamento local indisponível.");
        const owner = local.getItem(`${LEGACY_KEY}:import-owner`);
        if (owner && owner !== c.userId)
          throw new Error("Os dados antigos já foram vinculados a outra conta.");
        const raw = local.getItem(LEGACY_KEY);
        if (!raw) return;
        const old = JSON.parse(raw).state;
        // Stable mapping makes retries idempotent, including a partial network failure.
        const mapKey = `${workspaceCacheKey(c.userId)}:legacy-ids`;
        const ids: Record<string, string> = JSON.parse(local.getItem(mapKey) || "{}");
        const uuid = (id: string) => (ids[id] ||= crypto.randomUUID());
        for (const h of old.history || []) uuid(`c:${h.id}`);
        for (const p of old.proposals || []) uuid(`p:${p.id}`);
        local.setItem(mapKey, JSON.stringify(ids));
        local.setItem(`${LEGACY_KEY}:import-owner`, c.userId);
        await enqueue(async (userId) => {
          for (const h of old.history || []) {
            if (!valid(c)) throw new Error("A conta foi alterada.");
            await repository.saveCalculation(userId, {
              id: uuid(`c:${h.id}`),
              date: h.date,
              inputs: h,
              results: h,
              manufacturer: old.selectedManufacturer || "WEG",
            });
          }
          for (const p of old.proposals || []) {
            if (!valid(c)) throw new Error("A conta foi alterada.");
            await repository.saveProposal(userId, {
              ...p,
              id: uuid(`p:${p.id}`),
              calculationHistoryId:
                p.calculationHistoryId && ids[`c:${p.calculationHistoryId}`]
                  ? ids[`c:${p.calculationHistoryId}`]!
                  : null,
            });
          }
          if (old.companyProfile)
            await repository.saveCompany(userId, { ...emptyCompany(), ...old.companyProfile });
        });
        if (valid(c)) {
          local.setItem(`${workspaceCacheKey(c.userId)}:legacy-imported`, "yes");
          await get().initialize(c.userId);
        }
      },
    };
  });
}
