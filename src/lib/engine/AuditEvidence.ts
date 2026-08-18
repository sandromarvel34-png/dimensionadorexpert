import { CalculationEngine } from './CalculationEngine';
import { CalculationInputs } from '../../types';

async function runAudit() {
  console.log("--- 1. AUDITORIA DE MÉTODOS DE INSTALAÇÃO ---");
  const baseInputs: CalculationInputs = {
    power: 10,
    powerUnit: 'cv',
    voltage: 220,
    phase: 'trifasico',
    distance: 20,
    maxVoltageDrop: 2,
    powerFactor: 0.85,
    efficiency: 0.90,
    serviceFactor: 1.0,
    installationMethod: 'B1',
    groupingCount: 1,
    ambientTempFactor: 1.0,
    starterType: 'direta',
    preferredManufacturer: 'any',
    dataSource: 'manual'
  };

  const methods = ['B1', 'B2', 'C', 'D', 'E', 'F'];
  methods.forEach(m => {
    console.log(\`Teste Método: \${m}\`);
    try {
      const inputs = { ...baseInputs, installationMethod: m };
      const results = CalculationEngine.performFullCalculation(inputs);
      console.log(\`  Método recebido: \${inputs.installationMethod}\`);
      console.log(\`  Seção comercial (Ampacidade): \${results.cableByAmpacity} mm²\`);
    } catch (e: any) {
      console.log(\`  ERRO/AVISO: \${e.message}\`);
    }
  });

  console.log("\n--- 2. TESTE REAL DO ΔV SELECIONADO ---");
  const dvTests = [1, 2, 3, 4];
  dvTests.forEach(dv => {
    const inputs = { ...baseInputs, maxVoltageDrop: dv };
    const results = CalculationEngine.performFullCalculation(inputs);
    // Invocando diretamente a função interna para evidência de valores
    const dropDetails = CalculationEngine.getSectionByVoltageDrop(
        results.nominalCurrent, 
        inputs.distance, 
        inputs.voltage, 
        inputs.maxVoltageDrop, 
        inputs.powerFactor, 
        inputs.phase
    );
    console.log(\`ΔV selecionado: \${dv}%\`);
    console.log(\`  Valor recebido pela função: \${dv}\`);
    console.log(\`  Seção teórica calculada: \${dropDetails.requiredSection.toFixed(4)} mm²\`);
    console.log(\`  Seção comercial selecionada: \${dropDetails.selectedSection} mm²\`);
  });

  console.log("\n--- 4. TESTE DA CONVERSÃO PARA SEÇÃO COMERCIAL ---");
  const conversionTests = [1.2, 1.5, 1.6, 2.1, 2.5, 2.6, 4.1, 10.1, 17, 25.1];
  const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];
  
  conversionTests.forEach(t => {
    let selected = standardSections[standardSections.length - 1];
    for (const s of standardSections) {
      if (s >= t) {
        selected = s;
        break;
      }
    }
    console.log(\`Teórica: \${t} mm² -> Comercial: \${selected} mm²\`);
  });

  console.log("\n--- 5. TESTE DE INDEPENDÊNCIA ---");
  // Cenário 1: S_amp = 16, S_qt = 25
  // Ajustamos a distância para forçar S_qt = 25
  console.log("Cenário 1: Forçando S_qt > S_amp");
  const results1 = CalculationEngine.performFullCalculation({ ...baseInputs, distance: 100, maxVoltageDrop: 1 });
  console.log(\`  S_amp: \${results1.cableByAmpacity} | S_qt: \${results1.cableByVoltageDrop} | Final: \${results1.finalCableSection}\`);

  // Cenário 2: S_amp = 35, S_qt = 16
  // Ajustamos Ib (via Ib = In*1.25/fAgrup) forçando agrupamento baixo
  console.log("Cenário 2: Forçando S_amp > S_qt");
  const results2 = CalculationEngine.performFullCalculation({ ...baseInputs, groupingCount: 6, distance: 5 });
  console.log(\`  S_amp: \${results2.cableByAmpacity} | S_qt: \${results2.cableByVoltageDrop} | Final: \${results2.finalCableSection}\`);
}

runAudit();
