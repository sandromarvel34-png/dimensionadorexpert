
import { CalculationEngine } from './CalculationEngine';

function runTests() {
  console.log("=== INICIANDO TESTES DE REGRESSÃO TÉCNICA ===");

  // Caso 1: Motor 75cv, 220V, Trifásico (O caso crítico reportado)
  // Ib = In * FS
  // In = (75 * 735.5) / (sqrt(3) * 220 * 0.85 * 0.90) = 55162.5 / 291.5 = 189.23 A
  // Ib = 189.23 * 1.10 = 208.15 A
  // Correção B1 (3 condutores): I_corr = 208.15 / (1.0 * 1.0) = 208.15 A
  // Tabela B1 3 cond: 95mm2 (207A) -> Falha por 1.15A. Deve ser 120mm2 (239A).
  // Coordenação Disjuntor: Ib=208A -> Disjuntor comercial >= 208A (Ex: 225A).
  // Iz (cabo) deve ser >= In_disjuntor. Se Disj = 225A, 120mm2 (239A) atende.
  
  const inputs1 = {
    power: 75,
    powerUnit: 'cv',
    voltage: 220,
    phase: 'trifasico',
    distance: 50,
    maxVoltageDrop: 2,
    installationMethod: 'B1',
    groupingCount: 1,
    ambientTempFactor: 1.0,
    serviceFactor: 1.10,
    powerFactor: 0.85,
    efficiency: 0.90,
    starterType: 'direta',
    preferredManufacturer: 'any',
    dataSource: 'manual'
  };

  try {
    const res1 = CalculationEngine.performFullCalculation(inputs1 as any);
    console.log("\nTeste 1: Motor 75cv 220V (Fronteira de Ampacidade)");
    console.log(`In: ${res1.nominalCurrent.toFixed(2)}A`);
    console.log(`Ib (Projeto): ${(res1.nominalCurrent * 1.1).toFixed(2)}A`);
    console.log(`Cabo Ampacidade: ${res1.cableByAmpacity}mm²`);
    console.log(`Cabo Queda Tensão: ${res1.cableByVoltageDrop}mm²`);
    console.log(`Cabo Final: ${res1.finalCableSection}mm²`);
    
    // Verificação Queda de Tensão com rho=0.0213
    // S = (100 * sqrt(3) * 0.0213 * 50 * 208.15 * 0.85) / (2 * 220) = 32665 / 440 = 74.23 mm2
    // Próxima seção comercial: 95mm2.
    if (res1.cableByVoltageDrop < 95) console.error("ERRO: Queda de tensão subestimada!");
  } catch (e) {
    console.error("Teste 1 falhou:", e);
  }

  // Caso 2: Motor Pequeno (2cv) e Distância Longa (200m) - Limite de Queda de Tensão
  const inputs2 = { ...inputs1, power: 2, distance: 200, serviceFactor: 1.0 };
  try {
    const res2 = CalculationEngine.performFullCalculation(inputs2 as any);
    console.log("\nTeste 2: Motor 2cv 220V a 200m (Queda de Tensão Dominante)");
    console.log(`Cabo Ampacidade: ${res2.cableByAmpacity}mm²`);
    console.log(`Cabo Queda Tensão: ${res2.cableByVoltageDrop}mm²`);
    console.log(`Cabo Final: ${res2.finalCableSection}mm²`);
    console.log(`Queda Calculada: ${res2.voltageDropCalculated.toFixed(2)}%`);
    if (res2.finalCableSection <= res2.cableByAmpacity) console.error("ERRO: Queda de tensão não dominou o cálculo!");
  } catch (e) {
    console.error("Teste 2 falhou:", e);
  }

  console.log("\n=== FIM DOS TESTES ===");
}

runTests();
