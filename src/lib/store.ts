import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalculationInputs, CalculationResults } from '@/types';

interface AppState {
  view: 'dashboard' | 'wizard' | 'results' | 'proposal';
  step: number;
  currentInputs: CalculationInputs | null;
  currentResults: CalculationResults | null;
  selectedProducts: Record<string, any>;
  history: any[];
  
  setView: (view: 'dashboard' | 'wizard' | 'results' | 'proposal') => void;
  setStep: (step: number) => void;
  setCalculation: (inputs: CalculationInputs, results: CalculationResults) => void;
  setSelectedProducts: (products: Record<string, any>) => void;
  addToHistory: (item: any) => void;
  openHistoryItem: (item: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'dashboard',
      step: 1,
      currentInputs: null,
      currentResults: null,
      history: [],

      setView: (view) => set({ view }),
      setStep: (step) => set({ step }),
      setCalculation: (inputs, results) => {
        const historyItem = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          ...inputs,
          ...results,
          hasProposal: false
        };
        set((state) => ({ 
          currentInputs: inputs, 
          currentResults: results,
          view: 'results',
          history: [historyItem, ...state.history].slice(0, 50)
        }));
      },
      openHistoryItem: (item) => {
        set({ 
          currentInputs: item, 
          currentResults: item.nominalCurrent ? item : null, // If item contains results, load them
          view: item.nominalCurrent ? 'results' : 'wizard' 
        });
      },
      addToHistory: (item) => set((state) => ({ 
        history: [item, ...state.history].slice(0, 50) 
      })),
    }),
    {
      name: 'calculadora-eletrica-pro-storage',
    }
  )
);
