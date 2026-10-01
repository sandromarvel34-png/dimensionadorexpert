import { describe, expect, test, vi } from "vitest";
import { createWorkspaceStore, emptyCompany, workspaceCacheKey, LEGACY_KEY } from "./store";
import type { WorkspaceRepository, WorkspaceData } from "./repository";
import type { CalculationInputs, CalculationResults, SavedProposal } from "@/types";
const inputs: CalculationInputs = {
  dataSource: "manual",
  power: 10,
  powerUnit: "cv",
  voltage: 380,
  phase: "trifasico",
  distance: 20,
  starterType: "direta",
  maxVoltageDrop: 4,
  quantity: 1,
  installationMethod: "B1",
};
const results: CalculationResults = {
  nominalCurrent: 15,
  cableByAmpacity: 2.5,
  cableByVoltageDrop: 2.5,
  finalCableSection: 2.5,
  voltageDropCalculated: 1,
  limitingCriterion: "ampacity",
  technicalRequirements: [],
  compatibleProducts: {},
  protections: {},
  references: [],
};
const proposal = (id: string = crypto.randomUUID()): SavedProposal => ({
  id,
  calculationHistoryId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "rascunho",
  clientData: { name: "Cliente A", doc: "", phone: "", email: "" },
  commercialData: { serviceDescription: "", technicianName: "", executingCompany: "" },
  observations: "",
  items: [],
  labor: { hours: 0, rate: 0 },
  costs: { travel: 0, others: 0, discount: 0, validity: 30 },
  selectedManufacturer: "WEG",
  companyProfile: emptyCompany(),
  currentInputs: inputs,
  currentResults: results,
  total: 0,
});
const empty = (): WorkspaceData => ({ calculations: [], proposals: [], company: null });
function setup() {
  const data = new Map<string, WorkspaceData>();
  const values = new Map<string, string>();
  const local = {
    getItem: (k: string) => values.get(k) || null,
    setItem: (k: string, v: string) => {
      values.set(k, v);
    },
  };
  const get = (id: string) => {
    if (!data.has(id)) data.set(id, empty());
    return data.get(id)!;
  };
  const repo: WorkspaceRepository = {
    load: vi.fn(async (id) => structuredClone(get(id))),
    saveCalculation: vi.fn(async (id, record) => {
      const d = get(id);
      d.calculations = [
        ...d.calculations.filter((r) => r.id !== record.id),
        structuredClone(record),
      ];
    }),
    saveProposal: vi.fn(async (id, p) => {
      const d = get(id);
      d.proposals = [...d.proposals.filter((r) => r.id !== p.id), structuredClone(p)];
    }),
    saveCompany: vi.fn(async (id, company) => {
      get(id).company = structuredClone(company);
    }),
    deleteProposal: vi.fn(async (id, p) => {
      get(id).proposals = get(id).proposals.filter((r) => r.id !== p);
    }),
    clear: vi.fn(async (id, kind) => {
      const d = get(id);
      if (kind !== "proposals") {
        d.calculations = [];
        d.proposals = d.proposals.map((p) => ({ ...p, calculationHistoryId: null }));
      }
      if (kind !== "calculations") d.proposals = [];
    }),
  };
  return { data, values, local, repo, store: createWorkspaceStore(repo, () => local) };
}
const drain = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};
describe("workspace ownership and cloud persistence", () => {
  test("logout clears company, results, proposals and drafts from memory; B never sees A", async () => {
    const { store } = setup();
    await store.getState().initialize("A");
    await store.getState().setCalculation(inputs, results);
    store.getState().saveProposal(proposal());
    store.getState().setCompanyProfile({ companyName: "Empresa A" });
    await drain();
    store.getState().detach();
    expect(store.getState().history).toEqual([]);
    expect(store.getState().companyProfile.companyName).toBe("");
    await store.getState().initialize("B");
    expect(store.getState().proposals).toEqual([]);
    expect(store.getState().currentResults).toBeNull();
    await store.getState().initialize("A");
    expect(store.getState().history).toHaveLength(1);
    expect(store.getState().proposals).toHaveLength(1);
    expect(store.getState().companyProfile.companyName).toBe("Empresa A");
  });
  test("fresh device restores full inputs/results/company and proposals from cloud", async () => {
    const { repo, store } = setup();
    await store.getState().initialize("A");
    await store.getState().setCalculation(inputs, results);
    const p = { ...proposal(), calculationHistoryId: store.getState().currentHistoryId };
    store.getState().saveProposal(p);
    store
      .getState()
      .setCompanyProfile({ logoDataUrl: "data:image/png;base64,test", companyName: "A" });
    await drain();
    const fresh = createWorkspaceStore(repo, () => null);
    await fresh.getState().initialize("A");
    expect(fresh.getState().proposals[0]).toEqual(p);
    fresh.getState().openHistoryItem(fresh.getState().history[0]!);
    expect(fresh.getState().currentInputs).toEqual(inputs);
    expect(fresh.getState().currentResults).toEqual(results);
    expect(fresh.getState().companyProfile.companyName).toBe("A");
  });
  test("late A reads cannot populate B workspace", async () => {
    const { repo, store } = setup();
    let resolve!: (d: WorkspaceData) => void;
    vi.mocked(repo.load).mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const a = store.getState().initialize("A");
    await store.getState().initialize("B");
    resolve({ ...empty(), proposals: [proposal()] });
    await a;
    expect(store.getState().ownerId).toBe("B");
    expect(store.getState().proposals).toEqual([]);
  });
  test("late A writes cannot change B and queued A writes are cancelled on switch", async () => {
    const { repo, store } = setup();
    await store.getState().initialize("A");
    let resolve!: () => void;
    vi.mocked(repo.saveCalculation).mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const first = store
      .getState()
      .setCalculation(inputs, results)
      .catch(() => undefined);
    const second = store
      .getState()
      .setCalculation(inputs, results)
      .catch(() => undefined);
    await drain();
    await store.getState().initialize("B");
    resolve();
    await Promise.all([first, second]);
    expect(repo.saveCalculation).toHaveBeenCalledTimes(1);
    expect(store.getState().ownerId).toBe("B");
    expect(store.getState().history).toEqual([]);
  });
  test("failed calculation is not falsely saved or shown as success", async () => {
    const { repo, store } = setup();
    await store.getState().initialize("A");
    vi.mocked(repo.saveCalculation).mockRejectedValueOnce(new Error("offline"));
    await expect(store.getState().setCalculation(inputs, results)).rejects.toThrow("offline");
    expect(store.getState().history).toEqual([]);
    expect(store.getState().view).toBe("dashboard");
  });
  test("offline draft survives reload, is isolated by user and retries into cloud", async () => {
    const { repo, store, local, values } = setup();
    await store.getState().initialize("A");
    vi.mocked(repo.saveProposal).mockRejectedValueOnce(new Error("offline"));
    const p = proposal();
    store.getState().saveProposal(p);
    await drain();
    expect(store.getState().pending.proposals[p.id]).toEqual(p);
    expect(values.get(workspaceCacheKey("A"))).toContain(p.id);
    const b = createWorkspaceStore(repo, () => local);
    await b.getState().initialize("B");
    expect(b.getState().proposals).toEqual([]);
    const reloaded = createWorkspaceStore(repo, () => local);
    await reloaded.getState().initialize("A");
    await drain();
    expect(reloaded.getState().proposals[0]).toEqual(p);
    expect(reloaded.getState().pending.proposals).toEqual({});
    expect((await repo.load("A")).proposals[0]).toEqual(p);
  });
  test("rapid edits serialize and preserve newest revision", async () => {
    const { store, repo } = setup();
    await store.getState().initialize("A");
    const p = proposal();
    store.getState().saveProposal(p);
    store.getState().saveProposal({ ...p, observations: "latest", total: 100 });
    await drain();
    expect((await repo.load("A")).proposals[0]?.observations).toBe("latest");
    expect(store.getState().pending.proposals).toEqual({});
  });
  test("duplicate/status/delete persist and do not resurrect deleted records on reload", async () => {
    const { store, repo } = setup();
    await store.getState().initialize("A");
    const p = proposal();
    store.getState().saveProposal(p);
    await drain();
    store.getState().duplicateProposal(p.id);
    await drain();
    const copy = store.getState().proposals.find((r) => r.id !== p.id)!;
    expect(copy.id).toMatch(/^[\da-f-]{36}$/);
    store.getState().setProposalStatus(copy.id, "aprovada");
    await drain();
    expect((await repo.load("A")).proposals.find((r) => r.id === copy.id)?.status).toBe("aprovada");
    await store.getState().deleteProposal(p.id);
    await store.getState().initialize("A");
    expect(store.getState().proposals.map((r) => r.id)).toEqual([copy.id]);
  });
  test("clear calculations preserves proposals and clears their FK; clear proposals updates history flags", async () => {
    const { store } = setup();
    await store.getState().initialize("A");
    await store.getState().setCalculation(inputs, results);
    store
      .getState()
      .saveProposal({ ...proposal(), calculationHistoryId: store.getState().currentHistoryId });
    await drain();
    await store.getState().clearProposals();
    expect(store.getState().history[0]?.hasProposal).toBe(false);
    store
      .getState()
      .saveProposal({ ...proposal(), calculationHistoryId: store.getState().currentHistoryId });
    await drain();
    await store.getState().clearCalculations();
    expect(store.getState().proposals[0]?.calculationHistoryId).toBeNull();
    await store.getState().initialize("A");
    expect(store.getState().history).toEqual([]);
    expect(store.getState().proposals).toHaveLength(1);
  });
  test("legacy data is never automatically assigned; explicit import is idempotent and preserves backup", async () => {
    const { store, values, repo } = setup();
    const p = proposal("legacy-short-id");
    values.set(
      LEGACY_KEY,
      JSON.stringify({
        state: {
          history: [{ ...inputs, ...results, id: "short", date: p.createdAt }],
          proposals: [{ ...p, calculationHistoryId: "short" }],
        },
      }),
    );
    const backup = values.get(LEGACY_KEY);
    await store.getState().initialize("A");
    expect(store.getState().proposals).toEqual([]);
    await store.getState().importLegacy();
    await store.getState().importLegacy();
    expect((await repo.load("A")).calculations).toHaveLength(1);
    expect((await repo.load("A")).proposals).toHaveLength(1);
    expect(values.get(LEGACY_KEY)).toBe(backup);
    await store.getState().initialize("B");
    await expect(store.getState().importLegacy()).rejects.toThrow("outra conta");
  });
  test("does not silently discard records after 50 calculations", async () => {
    const { store } = setup();
    await store.getState().initialize("A");
    for (let i = 0; i < 51; i++) await store.getState().setCalculation(inputs, results);
    expect(store.getState().history).toHaveLength(51);
    await store.getState().initialize("A");
    expect(store.getState().history).toHaveLength(51);
  });
  test("failed company writes remain owned by A and recover after reload", async () => {
    const { repo, store, local } = setup();
    await store.getState().initialize("A");
    vi.mocked(repo.saveCompany).mockRejectedValueOnce(new Error("offline"));
    store.getState().setCompanyProfile({ companyName: "Empresa A" });
    await drain();
    expect(store.getState().pending.company?.companyName).toBe("Empresa A");
    const b = createWorkspaceStore(repo, () => local);
    await b.getState().initialize("B");
    expect(b.getState().companyProfile.companyName).toBe("");
    const a = createWorkspaceStore(repo, () => local);
    await a.getState().initialize("A");
    expect((await repo.load("A")).company?.companyName).toBe("Empresa A");
  });
  test("failed loading never enables an empty workspace that could overwrite cloud data", async () => {
    const { repo, store } = setup();
    vi.mocked(repo.load).mockRejectedValueOnce(new Error("offline"));
    await store.getState().initialize("A");
    expect(store.getState().ready).toBe(false);
    expect(store.getState().loadError).toBe("offline");
    await expect(store.getState().setCalculation(inputs, results)).rejects.toThrow("carregamento");
    expect(repo.saveCalculation).not.toHaveBeenCalled();
  });
  test("clearing calculations retains unsaved proposal drafts and removes their stale FK", async () => {
    const { repo, store } = setup();
    await store.getState().initialize("A");
    await store.getState().setCalculation(inputs, results);
    vi.mocked(repo.saveProposal).mockRejectedValueOnce(new Error("offline"));
    const p = { ...proposal(), calculationHistoryId: store.getState().currentHistoryId };
    store.getState().saveProposal(p);
    await drain();
    await store.getState().clearCalculations();
    expect((await repo.load("A")).proposals[0]?.calculationHistoryId).toBeNull();
    expect(store.getState().proposals).toHaveLength(1);
    expect(store.getState().pending.proposals).toEqual({});
  });
});
