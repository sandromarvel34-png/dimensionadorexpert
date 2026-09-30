import { describe, expect, test } from 'vitest';
import { CalculationEngine } from './CalculationEngine';
import { CalculationInputs } from '../../types';
import { findCompatibleProduct, findCompatibleProducts, getProductsByCategory } from '../catalog';

const triBase: CalculationInputs = {
  dataSource: 'manual',
  power: 10,
  powerUnit: 'cv',
  voltage: 380,
  phase: 'trifasico',
  distance: 30,
  starterType: 'direta',
  maxVoltageDrop: 2,
  quantity: 1,
  installationMethod: 'B1',
  groupingCount: 1,
  ambientTemperature: 30,
  powerFactor: 0.85,
  serviceFactor: 1,
  efficiency: 0.9,
};

const monoBase: CalculationInputs = {
  ...triBase,
  power: 3,
  voltage: 220,
  phase: 'monofasico',
};

describe('Dimensionador Expert — matriz funcional', () => {
  const triMethods = ['A1', 'A2', 'B1', 'B2', 'C', 'D', 'E', 'F3_TREFOIL', 'F3_FLAT', 'G_HORIZONTAL', 'G_VERTICAL'];

  test.each(triMethods)('trifásico calcula no método %s', (installationMethod) => {
    const result = CalculationEngine.performFullCalculation({
      ...triBase,
      installationMethod,
      groupingCount: installationMethod.startsWith('G_') ? 1 : 2,
      ambientTemperature: installationMethod === 'D' ? 20 : 30,
      buriedCableConfiguration: installationMethod === 'D' ? 'unipolarDuct' : undefined,
    });

    expect(Number.isFinite(result.nominalCurrent)).toBe(true);
    expect(result.nominalCurrent).toBeGreaterThan(0);
    expect(result.finalCableSection).toBeGreaterThanOrEqual(2.5);
    expect(result.voltageDropCalculated).toBeLessThanOrEqual(triBase.maxVoltageDrop);
  });

  const monoMethods = ['A1', 'A2', 'B1', 'B2', 'C', 'D', 'E', 'F2'];

  test.each(monoMethods)('monofásico calcula no método %s', (installationMethod) => {
    const result = CalculationEngine.performFullCalculation({
      ...monoBase,
      installationMethod,
      groupingCount: 1,
      ambientTemperature: installationMethod === 'D' ? 20 : 30,
      buriedCableConfiguration: installationMethod === 'D' ? 'multipolarDuct' : undefined,
    });

    expect(Number.isFinite(result.nominalCurrent)).toBe(true);
    expect(result.nominalCurrent).toBeGreaterThan(0);
    expect(result.finalCableSection).toBeGreaterThanOrEqual(2.5);
    expect(result.voltageDropCalculated).toBeLessThanOrEqual(monoBase.maxVoltageDrop);
  });

  test.each([
    ['direta', ['Contator de Potência (K1)', 'Relé Térmico']],
    ['reversao', ['Contatores de Potência (K1, K2)', 'Relé Térmico']],
    ['estrelaTriangulo', ['Contatores de Potência (K1, K2)', 'Contator de Estrela (K3)', 'Relé Térmico', 'Relé de Tempo Estrela-Triângulo']],
    ['softStarter', ['Soft-Starter']],
    ['inversor', ['Inversor de Frequência']],
  ] as const)('gera requisitos coerentes para partida %s', (starterType, expectedLabels) => {
    const result = CalculationEngine.performFullCalculation({ ...triBase, starterType });
    const labels = result.technicalRequirements.map(item => item.label);

    for (const label of expectedLabels) {
      expect(labels).toContain(label);
    }
  });

  test('não inclui automaticamente disjuntor principal, fusível e disjuntor-motor como conjunto obrigatório', () => {
    const result = CalculationEngine.performFullCalculation(triBase);
    const labels = result.technicalRequirements.map(item => item.label);

    expect(labels).not.toContain('Disjuntor do Circuito Principal (Força)');
    expect(labels).not.toContain('Fusíveis do Circuito Principal (Força)');
    expect(labels).not.toContain('Disjuntor Motor');
  });

  test('método D diferencia agrupamento unipolar e multipolar', () => {
    const unipolar = CalculationEngine.performFullCalculation({
      ...triBase,
      installationMethod: 'D',
      groupingCount: 8,
      ambientTemperature: 20,
      buriedCableConfiguration: 'unipolarDuct',
    });
    const multipolar = CalculationEngine.performFullCalculation({
      ...triBase,
      installationMethod: 'D',
      groupingCount: 8,
      ambientTemperature: 20,
      buriedCableConfiguration: 'multipolarDuct',
    });

    expect(unipolar.correctionFactors?.grouping).toBe(0.50);
    expect(multipolar.correctionFactors?.grouping).toBe(0.54);
  });

  test('usa modelo R+X e registra o arranjo de queda de tensão', () => {
    const result = CalculationEngine.performFullCalculation({
      ...triBase,
      installationMethod: 'F3_TREFOIL',
      voltageDropArrangement: 'auto',
    });

    expect(result.voltageDropModel).toBe('acImpedanceRX');
    expect(result.voltageDropArrangementUsed).toBe('trefoil');
    expect(result.voltageDropResistanceOhmKm).toBeGreaterThan(0);
    expect(result.voltageDropReactanceOhmKm).toBeGreaterThan(0);
  });

  test('arranjo informado pelo usuário substitui a inferência automática', () => {
    const result = CalculationEngine.performFullCalculation({
      ...triBase,
      installationMethod: 'B1',
      voltageDropArrangement: 'spaced13cm',
    });

    expect(result.voltageDropArrangementUsed).toBe('spaced13cm');
  });

  test('trifólio é rejeitado no circuito monofásico', () => {
    expect(() => CalculationEngine.performFullCalculation({
      ...monoBase,
      voltageDropArrangement: 'trefoil',
    })).toThrow(/trifólio/i);
  });

  test('curto-circuito informado entra no critério final', () => {
    const result = CalculationEngine.performFullCalculation({
      ...triBase,
      power: 1,
      distance: 1,
      shortCircuitCurrentKA: 10,
      shortCircuitDurationSeconds: 0.1,
    });

    expect(result.shortCircuitCheckPerformed).toBe(true);
    expect(result.cableByShortCircuit).toBe(35);
    expect(result.finalCableSection).toBeGreaterThanOrEqual(result.cableByShortCircuit!);
  });

  test('sem Icc não declara verificação térmica de curto-circuito', () => {
    const result = CalculationEngine.performFullCalculation(triBase);
    expect(result.shortCircuitCheckPerformed).toBe(false);
    expect(result.cableByShortCircuit).toBeUndefined();
    expect(result.technicalLimitations?.some(item => /não foi realizada/i.test(item))).toBe(true);
  });

  test('fabricante selecionado não faz fallback silencioso', () => {
    const products = findCompatibleProducts('contator', 10, 'WEG', 380);
    expect(products.length).toBeGreaterThan(0);
    expect(products.every(product => product.manufacturer === 'WEG')).toBe(true);

    const impossible = findCompatibleProduct('contator', 999, 'WEG', 380);
    expect(impossible).toBeNull();
  });

  test('seleção por tensão rejeita dispositivo abaixo da tensão do sistema', () => {
    const products = findCompatibleProducts('contator', 10, 'WEG', 700);
    expect(products).toHaveLength(0);
  });

  test('referências placeholder 100000xx não são oferecidas ao usuário', () => {
    const fuses = getProductsByCategory('fusivel');
    expect(fuses.every(product => !/^100000\d*$/.test(product.commercialCode))).toBe(true);
  });

  test('CWM9 com referência comprovadamente inconsistente não é oferecido', () => {
    const products = findCompatibleProducts('contator', 1, 'WEG', 380);
    expect(products.some(product => product.id === 'weg-cwm9')).toBe(false);
  });

  test('G com múltiplos circuitos é bloqueado em vez de aplicar fator indevido', () => {
    expect(() => CalculationEngine.performFullCalculation({
      ...triBase,
      installationMethod: 'G_HORIZONTAL',
      groupingCount: 2,
    })).toThrow(/múltiplos circuitos|apenas um circuito/i);
  });

  test('combinações de fase e disposição incompatíveis são bloqueadas', () => {
    expect(() => CalculationEngine.performFullCalculation({
      ...triBase,
      installationMethod: 'F2',
    })).toThrow();

    expect(() => CalculationEngine.performFullCalculation({
      ...monoBase,
      installationMethod: 'F3_TREFOIL',
    })).toThrow();

    expect(() => CalculationEngine.performFullCalculation({
      ...monoBase,
      starterType: 'estrelaTriangulo',
    })).toThrow();
  });
});
