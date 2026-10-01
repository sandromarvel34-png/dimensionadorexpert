import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalculationInputs, CalculationResults, CompanyProfile, ProposalStatus, SavedProposal } from '@/types';

interface AppState {
  view: 'dashboard' | 'wizard' | 'results' | 'proposal' | 'proposals' | 'educational' | 'account' | 'admin';
  step: number;
  currentInputs: CalculationInputs | null;
  currentResults: CalculationResults | null;
  currentHistoryId: string | null;
  selectedProducts: Record<string, any>;
  selectedManufacturer: 'WEG' | 'Siemens' | 'Schneider';
  history: any[];
  companyProfile: CompanyProfile;
  proposals: SavedProposal[];
  currentProposalId: string | null;

  setView: (view: AppState['view']) => void;
  setStep: (step: number) => void;
  setCalculation: (inputs: CalculationInputs, results: CalculationResults) => void;
  setSelectedProducts: (products: Record<string, any>) => void;
  setSelectedManufacturer: (manufacturer: 'WEG' | 'Siemens' | 'Schneider') => void;
  addToHistory: (item: any) => void;
  openHistoryItem: (item: any) => void;
  markProposalSaved: () => void;
  setCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  saveProposal: (proposal: SavedProposal) => void;
  openProposal: (id: string) => void;
  startNewProposal: () => void;
  duplicateProposal: (id: string) => void;
  deleteProposal: (id: string) => void;
  setProposalStatus: (id: string, status: ProposalStatus) => void;
  clearCalculations: () => void;
  clearProposals: () => void;
  resetWorkspace: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'dashboard',
      step: 1,
      currentInputs: null,
      currentResults: null,
      currentHistoryId: null,
      selectedProducts: {},
      selectedManufacturer: 'WEG',
      history: [],
      companyProfile: {
        companyName: '',
        document: '',
        responsibleName: '',
        professionalRegistration: '',
        phone: '',
        email: '',
        address: '',
        cityState: '',
        website: '',
        logoDataUrl: '',
        brandColor: '#2563EB',
        logoBackground: 'light',
      },
      proposals: [],
      currentProposalId: null,

      setView: (view) => set({ view }),
      setStep: (step) => set({ step }),
      setCalculation: (inputs, results) => {
        const id = Math.random().toString(36).slice(2, 11);
        const historyItem = {
          id,
          date: new Date().toISOString(),
          ...inputs,
          ...results,
          hasProposal: false,
        };
        set((state) => ({
          currentInputs: inputs,
          currentResults: results,
          currentHistoryId: id,
          selectedManufacturer: inputs.preferredManufacturer && inputs.preferredManufacturer !== 'any'
            ? inputs.preferredManufacturer as any
            : state.selectedManufacturer,
          selectedProducts: {},
          currentProposalId: null,
          view: 'results',
          history: [historyItem, ...state.history].slice(0, 50),
        }));
      },
      setSelectedProducts: (products) => set({ selectedProducts: products }),
      setSelectedManufacturer: (manufacturer) => set({ selectedManufacturer: manufacturer }),
      openHistoryItem: (item) => {
        set({
          currentInputs: item,
          currentResults: item.nominalCurrent ? item : null,
          currentHistoryId: item.id ?? null,
          selectedProducts: {},
          view: item.nominalCurrent ? 'results' : 'wizard',
        });
      },
      setCompanyProfile: (profile) => set((state) => ({
        companyProfile: { ...state.companyProfile, ...profile },
      })),
      saveProposal: (proposal) => set((state) => {
        const exists = state.proposals.some(item => item.id === proposal.id);
        return {
          proposals: exists
            ? state.proposals.map(item => item.id === proposal.id ? proposal : item)
            : [proposal, ...state.proposals],
          currentProposalId: proposal.id,
          history: state.history.map(item =>
            item.id === proposal.calculationHistoryId ? { ...item, hasProposal: true } : item
          ),
        };
      }),
      openProposal: (id) => set((state) => {
        const proposal = state.proposals.find(item => item.id === id);
        if (!proposal) return {};
        return {
          currentProposalId: proposal.id,
          currentInputs: proposal.currentInputs,
          currentResults: proposal.currentResults,
          currentHistoryId: proposal.calculationHistoryId,
          selectedManufacturer: proposal.selectedManufacturer,
          selectedProducts: {},
          view: 'proposal',
        };
      }),
      startNewProposal: () => set({
        currentProposalId: null,
        view: 'proposal',
      }),
      duplicateProposal: (id) => set((state) => {
        const source = state.proposals.find(item => item.id === id);
        if (!source) return {};
        const now = new Date().toISOString();
        const copy: SavedProposal = {
          ...source,
          id: Math.random().toString(36).slice(2, 11),
          createdAt: now,
          updatedAt: now,
          status: 'rascunho',
          clientData: { ...source.clientData, name: source.clientData.name ? `${source.clientData.name} - Cópia` : 'Cópia' },
          items: source.items.map(item => ({ ...item, id: Math.random().toString(36).slice(2, 11) })),
        };
        return { proposals: [copy, ...state.proposals] };
      }),
      deleteProposal: (id) => set((state) => ({
        proposals: state.proposals.filter(item => item.id !== id),
        currentProposalId: state.currentProposalId === id ? null : state.currentProposalId,
      })),
      setProposalStatus: (id, status) => set((state) => ({
        proposals: state.proposals.map(item =>
          item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
        ),
      })),
      markProposalSaved: () => set((state) => ({
        history: state.history.map(item => item.id === state.currentHistoryId ? { ...item, hasProposal: true } : item),
      })),
      addToHistory: (item) => set((state) => ({
        history: [item, ...state.history].slice(0, 50),
      })),
      clearCalculations: () => set({
        currentInputs: null,
        currentResults: null,
        currentHistoryId: null,
        selectedProducts: {},
        currentProposalId: null,
        history: [],
        view: 'dashboard',
        step: 1,
      }),
      clearProposals: () => set({
        proposals: [],
        currentProposalId: null,
      }),
      resetWorkspace: () => set({
        view: 'dashboard',
        step: 1,
        currentInputs: null,
        currentResults: null,
        currentHistoryId: null,
        selectedProducts: {},
        selectedManufacturer: 'WEG',
        history: [],
        proposals: [],
        currentProposalId: null,
      }),
    }),
    { name: 'calculadora-eletrica-pro-storage' },
  ),
);
