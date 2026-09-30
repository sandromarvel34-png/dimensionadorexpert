import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalculationInputs, CalculationResults, CompanyProfile } from '@/types';

interface AppState {
  view: 'dashboard' | 'wizard' | 'results' | 'proposal' | 'educational';
  step: number;
  currentInputs: CalculationInputs | null;
  currentResults: CalculationResults | null;
  currentHistoryId: string | null;
  selectedProducts: Record<string, any>;
  selectedManufacturer: 'WEG' | 'Siemens' | 'Schneider';
  history: any[];
  companyProfile: CompanyProfile;

  setView: (view: AppState['view']) => void;
  setStep: (step: number) => void;
  setCalculation: (inputs: CalculationInputs, results: CalculationResults) => void;
  setSelectedProducts: (products: Record<string, any>) => void;
  setSelectedManufacturer: (manufacturer: 'WEG' | 'Siemens' | 'Schneider') => void;
  addToHistory: (item: any) => void;
  openHistoryItem: (item: any) => void;
  markProposalSaved: () => void;
  setCompanyProfile: (profile: Partial<CompanyProfile>) => void;
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
      },

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
      markProposalSaved: () => set((state) => ({
        history: state.history.map(item => item.id === state.currentHistoryId ? { ...item, hasProposal: true } : item),
      })),
      addToHistory: (item) => set((state) => ({
        history: [item, ...state.history].slice(0, 50),
      })),
    }),
    { name: 'calculadora-eletrica-pro-storage' },
  ),
);
