import { describe, expect, test } from 'vitest';
import { CalculationEngine } from './CalculationEngine';
import { AMPACITY_TABLES_NBR5410 } from './ampacity-tables';
import { getGroupingFactor, getTemperatureFactor } from './correction-factors';
import { CalculationInputs } from '../../types';

const baseInputs: CalculationInputs = {
  dataSource: 'manual',
  power: 10,
  powerUnit: 'cv',
  voltage: 380,
  phase: 'trifasico',
  distance: 20,
  starterType: 'direta',
  maxVoltageDrop: 4,
  quantity: 1,
  installationMethod: 'B1',
  groupingCount: 1,
  ambientTemperature: 30,
  powerFactor: 0.85,
  serviceFactor: 1.0,
  efficiency: 0.90,
};

describe('CalculationEngine — regressão técnica', () => {
  test('corrente nominal trifásica usa potência, tensão, FP e rendimento', () => {
    const current = CalculationEngine.calculateNominalCurrent(10, 'cv', 380, 'trifasico', 0.85, 0.90);
    expect(current).toBeCloseTo(14.6075, 3);
  });

  test('tabela B1/3 condutores reproduz valores de referência', () => {
    const table = AMPACITY_TABLES_NBR5410.find(t => t.method === 'B1' && t.conductors === 3)!;
    expect(table.table[2.5]).toBe(21);
    expect(table.table[25]).toBe(89);
    expect(table.table[240]).toBe(370);
  });

  test('método C/3 não aceita 25 mm² para necessidade de 100 A', () => {
    expect(CalculationEngine.getSectionByAmpacity(100, 100, 'C', 3)).toBe(35);
  });

  test('monofásico funciona também em A1 (2 condutores carregados)', () => {
    const result = CalculationEngine.performFullCalculation({
      ...baseInputs,
      phase: 'monofasico',
      voltage: 220,
      installationMethod: 'A1',
    });
    expect(result.finalCableSection).toBeGreaterThanOrEqual(2.5);
  });

  test('temperatura usa tabela do ar fora do solo e tabela do solo em D', () => {
    expect(getTemperatureFactor('B1', 40)).toBe(0.87);
    expect(getTemperatureFactor('D', 40)).toBe(0.77);
  });

  test('agrupamento enterrado usa fator próprio', () => {
    expect(getGroupingFactor('D', 8)).toBe(0.50);
    expect(getGroupingFactor('B1', 8)).toBe(0.52);
  });

  test('seção mínima de força é identificada como critério limitante', () => {
    const result = CalculationEngine.performFullCalculation({ ...baseInputs, power: 1, distance: 1 });
    expect(result.finalCableSection).toBe(2.5);
    expect(result.limitingCriterion).toBe('minimumSection');
  });

  test('queda admissível menor não pode reduzir a seção', () => {
    const scenario = { ...baseInputs, distance: 100 };
    const res4 = CalculationEngine.performFullCalculation({ ...scenario, maxVoltageDrop: 4 });
    const res2 = CalculationEngine.performFullCalculation({ ...scenario, maxVoltageDrop: 2 });
    const res1 = CalculationEngine.performFullCalculation({ ...scenario, maxVoltageDrop: 1 });
    expect(res1.cableByVoltageDrop).toBeGreaterThanOrEqual(res2.cableByVoltageDrop);
    expect(res2.cableByVoltageDrop).toBeGreaterThanOrEqual(res4.cableByVoltageDrop);
  });

  test('rejeita parâmetros fisicamente inválidos', () => {
    expect(() => CalculationEngine.performFullCalculation({ ...baseInputs, voltage: 0 })).toThrow();
    expect(() => CalculationEngine.performFullCalculation({ ...baseInputs, powerFactor: 1.2 })).toThrow();
    expect(() => CalculationEngine.performFullCalculation({ ...baseInputs, efficiency: 1.2 })).toThrow();
    expect(() => CalculationEngine.performFullCalculation({ ...baseInputs, serviceFactor: -1 })).toThrow();
    expect(() => CalculationEngine.performFullCalculation({ ...baseInputs, maxVoltageDrop: 5 })).toThrow();
  });

  test('dimensiona termicamente o cabo quando Icc e tempo são informados', () => {
    const result = CalculationEngine.performFullCalculation({
      ...baseInputs,
      power: 1,
      distance: 1,
      shortCircuitCurrentKA: 10,
      shortCircuitDurationSeconds: 0.1,
    });
    expect(result.shortCircuitCheckPerformed).toBe(true);
    expect(result.cableByShortCircuit).toBe(35);
    expect(result.finalCableSection).toBe(35);
    expect(result.limitingCriterion).toBe('shortCircuit');
  });

  test('exige Icc e tempo de atuação em conjunto', () => {
    expect(() => CalculationEngine.performFullCalculation({
      ...baseInputs,
      shortCircuitCurrentKA: 10,
    })).toThrow(/Icc e tempo/i);
  });

  test('rejeita estrela-triângulo em motor monofásico', () => {
    expect(() => CalculationEngine.performFullCalculation({
      ...baseInputs,
      phase: 'monofasico',
      voltage: 220,
      starterType: 'estrelaTriangulo',
    })).toThrow(/estrela-triângulo/i);
  });

  test('rejeita disposições F/G incompatíveis com número de condutores', () => {
    expect(() => CalculationEngine.performFullCalculation({ ...baseInputs, installationMethod: 'F2' })).toThrow();
    expect(() => CalculationEngine.performFullCalculation({
      ...baseInputs,
      phase: 'monofasico',
      voltage: 220,
      installationMethod: 'G_HORIZONTAL',
    })).toThrow();
  });
});
