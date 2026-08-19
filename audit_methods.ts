import { CalculationEngine } from './src/lib/engine/CalculationEngine';

const testCases = [
  { method: 'A1', conductors: 3, label: 'A1 3C' },
  { method: 'A2', conductors: 3, label: 'A2 3C' },
  { method: 'B1', conductors: 3, label: 'B1 3C' },
  { method: 'B2', conductors: 3, label: 'B2 3C' },
  { method: 'C', conductors: 3, label: 'C 3C' },
  { method: 'D', conductors: 3, label: 'D 3C' },
  { method: 'E', conductors: 3, label: 'E 3C' },
  { method: 'F_G', conductors: 3, label: 'F_G 3C (F)' },
  { method: 'F_G', conductors: 2, label: 'F_G 2C (G)' },
];

console.log("=== Auditoria de Métodos de Instalação NBR 5410 ===");

testCases.forEach(tc => {
  try {
    const inputs: any = {
      power: 75,
      powerUnit: 'cv',
      voltage: 220,
      phase: tc.conductors === 3 ? 'trifasico' : 'monofasico',
      distance: 50,
      starterType: 'direta',
      maxVoltageDrop: 2,
      installationMethod: tc.method,
      groupingCount: 1,
      ambientTempFactor: 1.0,
      powerFactor: 0.85,
      efficiency: 0.90,
      serviceFactor: 1.10
    };
    const results = CalculationEngine.performFullCalculation(inputs);
    console.log(`✅ ${tc.label}: Sucesso - Seção final ${results.finalCableSection} mm²`);
  } catch (e: any) {
    console.log(`❌ ${tc.label}: ERRO - ${e.message}`);
  }
});
