import { describe, test, expect } from 'vitest';
import { CalculationEngine } from './CalculationEngine';
import { CalculationInputs } from '../../types';

describe('CalculationEngine - Suíte de Testes de Regressão NBR 5410', () => {
  const baseInputs: CalculationInputs = {
    dataSource: 'manual',
    power: 10,
    powerUnit: 'cv',
    voltage: 220,
    phase: 'trifasico',
    distance: 20,
    starterType: 'direta',
    maxVoltageDrop: 4,
    quantity: 1,
    installationMethod: 'B1',
    groupingCount: 1,
    ambientTempFactor: 1.0,
    powerFactor: 0.85,
    serviceFactor: 1.0,
    efficiency: 0.90
  };

  // 1. TESTE — Validação de tensão obrigatória
  test('TESTE 1 — Deve rejeitar tensão inválida (NaN ou 0)', () => {
    const invalidInputs = { ...baseInputs, voltage: 0 };
    // O motor de cálculo atual não lança erro explícito, ele pode retornar NaN.
    // Vamos verificar se o resultado é sensato ou se lança erro se implementarmos a validação.
    // Pela instrução: "confirmar que a função de validação rejeita com erro claro"
    expect(() => CalculationEngine.performFullCalculation(invalidInputs)).toThrow();
    
    const nanInputs = { ...baseInputs, voltage: NaN };
    expect(() => CalculationEngine.performFullCalculation(nanInputs)).toThrow();
  });

  // 2. TESTE — Consistência de Ib em toda a aplicação
  test('TESTE 2 — Ib deve ser consistente para todos os componentes', () => {
    const results = CalculationEngine.performFullCalculation(baseInputs);
    const Ib = results.nominalCurrent * (baseInputs.serviceFactor || 1.0);
    
    // Verifica se Ib foi usado corretamente nos requisitos técnicos
    results.technicalRequirements.forEach(req => {
      if (req.label.includes('Principal') || req.label.includes('Motor') || req.label.includes('Contator (K1)') || req.label.includes('Relé Térmico')) {
         // Ib deve ser a base. Alguns tem multiplicadores (fusível 1.5, etc)
         if (req.category === 'disjuntor' && req.label.includes('Principal')) {
            // Disjuntor >= Ib. O motor de cálculo seleciona o comercial. 
            // Mas a corrente de referência passada para a busca deve ser Ib.
            expect(req.current).toBeGreaterThanOrEqual(Ib);
         }
      }
    });
  });

  // 3. TESTE — Critério de queda de tensão varia com o percentual selecionado
  test('TESTE 3 — Seção por queda de tensão deve aumentar conforme o limite diminui', () => {
    const scenario = { ...baseInputs, distance: 100 }; // Distância suficiente para influenciar
    
    const res4 = CalculationEngine.performFullCalculation({ ...scenario, maxVoltageDrop: 4 });
    const res2 = CalculationEngine.performFullCalculation({ ...scenario, maxVoltageDrop: 2 });
    const res1 = CalculationEngine.performFullCalculation({ ...scenario, maxVoltageDrop: 1 });
    
    expect(res1.cableByVoltageDrop).toBeGreaterThanOrEqual(res2.cableByVoltageDrop);
    expect(res2.cableByVoltageDrop).toBeGreaterThanOrEqual(res4.cableByVoltageDrop);
  });

  // 4. TESTE — Seleção da maior bitola entre os dois critérios
  test('TESTE 4 — Deve selecionar a maior bitola entre ampacidade e queda de tensão', () => {
    // Curta distância
    const shortDist = CalculationEngine.performFullCalculation({ ...baseInputs, distance: 5 });
    expect(shortDist.finalCableSection).toBe(Math.max(shortDist.cableByAmpacity, shortDist.cableByVoltageDrop, 2.5));
    
    // Longa distância
    const longDist = CalculationEngine.performFullCalculation({ ...baseInputs, distance: 300 });
    expect(longDist.finalCableSection).toBe(longDist.cableByVoltageDrop);
    expect(longDist.cableByVoltageDrop).toBeGreaterThan(longDist.cableByAmpacity);
  });

  // 5. TESTE — Fator de temperatura aplicado corretamente
  test('TESTE 5 — Fator de temperatura deve influenciar a seção necessária', () => {
    const temp30 = CalculationEngine.performFullCalculation({ ...baseInputs, ambientTempFactor: 1.0 }); // 30°C
    const temp45 = CalculationEngine.performFullCalculation({ ...baseInputs, ambientTempFactor: 0.79 }); // 45°C
    
    // A corrente corrigida (Ib / fTemp) é maior para 45°C, logo a seção deve ser maior ou igual.
    expect(temp45.cableByAmpacity).toBeGreaterThanOrEqual(temp30.cableByAmpacity);
  });

  // 6. TESTE — Disjuntor de força nunca menor que o disjuntor de comando
  test('TESTE 6 — Disjuntor de força deve ser >= disjuntor de comando para motores > 5CV', () => {
    const bigMotor = CalculationEngine.performFullCalculation({ ...baseInputs, power: 10 });
    
    const forceBreaker = bigMotor.technicalRequirements.find(r => r.label.includes('Principal'))?.current || 0;
    const commandBreaker = bigMotor.technicalRequirements.find(r => r.label.includes('Auxiliar'))?.current || 0;
    
    expect(forceBreaker).toBeGreaterThanOrEqual(commandBreaker);
    expect(commandBreaker).toBe(6); // Padrão MDW-C6
  });
});
