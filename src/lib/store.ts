import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalculationInputs, CalculationResults } from '@/types';

interface AppState {
  view: 'dashboard' | 'wizard' | 'results' | 'proposal';
  step: number;
  currentInputs: CalculationInputs | null;
  currentResults: CalculationResults | null;
  history: any[];
  
  setView: (view: 'dashboard' | 'wizard' | 'results' | 'proposal') => void;
  setStep: (step: number) => void;
  setCalculation: (inputs: CalculationInputs, results: CalculationResults) => void;
  addToHistory: (item: any) => void;
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
      setCalculation: (inputs, results) => set({ currentInputs: inputs, currentResults: results }),
      addToHistory: (item) => set((state) => ({ 
        history: [item, ...state.history].slice(0, 50) 
      })),
    }),
    {
      name: 'calculadora-eletrica-pro-storage',
    }
  )
);
