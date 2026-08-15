import { describe, test, expect } from 'vitest';
import { CalculationEngine } from './CalculationEngine';
import { CalculationInputs } from '../../types';


describe('CalculationEngine', () => {
  const defaultInputs: CalculationInputs = {
    dataSource: 'manual',
    power: 10,
    powerUnit: 'cv',
    voltage: 380,
    phase: 'trifasico',
    distance: 20,
    starterType: 'direta',
    maxVoltageDrop: 4,
    quantity: 1
  };

  test('deve calcular a corrente nominal corretamente para motor trifásico', () => {
    const current = CalculationEngine.calculateNominalCurrent(10, 'cv', 380, 'trifasico');
    // P = 7355W. I = 7355 / (380 * 1.732 * 0.8) ~= 13.97A
    expect(current).toBeGreaterThan(13);
    expect(current).toBeLessThan(15);
  });

  test('deve selecionar a seção correta por ampacidade', () => {
    const section = CalculationEngine.getSectionByAmpacity(15); // Tabela diz 1.5mm2 até 17.5A
    expect(section).toBe(1.5);
    
    const sectionHigh = CalculationEngine.getSectionByAmpacity(50); // Deve ser 10mm2 (57A)
    expect(sectionHigh).toBe(10);
  });

  test('deve respeitar o critério de queda de tensão', () => {
    const inputs = { ...defaultInputs, distance: 200 }; // Distância longa
    const results = CalculationEngine.performFullCalculation(inputs);
    
    // Para 200m, a queda de tensão deve forçar um cabo maior que a ampacidade
    expect(results.limitingCriterion).toBe('voltageDrop');
    expect(results.finalCableSection).toBeGreaterThan(results.cableByAmpacity);
  });

  test('deve aplicar seção mínima da NBR 5410', () => {
    const tinyMotor: CalculationInputs = {
      ...defaultInputs,
      power: 0.1,
      distance: 1
    };
    const results = CalculationEngine.performFullCalculation(tinyMotor);
    expect(results.finalCableSection).toBe(2.5); // Mínimo para força em trifásico
  });
});
