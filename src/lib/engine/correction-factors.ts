/**
 * Fatores de correção para cobre/PVC 70 °C baseados nas tabelas 40, 41,
 * 42, 44 e 45 da ABNT NBR 5410:2004, conforme reprodução no Guia
 * de Dimensionamento de Cabos para Baixa Tensão Prysmian Rev.10.
 */

export const AIR_TEMPERATURE_FACTORS_PVC: Record<number, number> = {
  10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00,
  35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50,
};

export const SOIL_TEMPERATURE_FACTORS_PVC: Record<number, number> = {
  10: 1.10, 15: 1.05, 20: 1.00, 25: 0.95, 30: 0.89,
  35: 0.84, 40: 0.77, 45: 0.71, 50: 0.63, 55: 0.55, 60: 0.45,
};

/** Método D: referência de 2,5 K.m/W = fator 1,00. */
export const SOIL_THERMAL_RESISTIVITY_FACTORS_DUCT: Record<string, number> = {
  '0.5': 1.28, '0.7': 1.20, '1': 1.18, '1.5': 1.10,
  '2': 1.05, '2.5': 1.00, '3': 0.96,
};

/** Tabela 42, linha 1: feixe/conduto fechado — métodos A a F. */
export const GROUPING_BUNDLE_FACTORS: Record<number, number> = {
  1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57,
  7: 0.54, 8: 0.52, 9: 0.50, 10: 0.50, 11: 0.50,
  12: 0.45, 13: 0.45, 14: 0.45, 15: 0.45,
  16: 0.41, 17: 0.41, 18: 0.41, 19: 0.41, 20: 0.38,
};

/** Tabela 45: cabo multipolar em duto individual enterrado, distância nula entre dutos. */
export const GROUPING_BURIED_MULTIPOLAR_DUCT_CONTACT_FACTORS: Record<number, number> = {
  1: 1.00, 2: 0.85, 3: 0.75, 4: 0.70, 5: 0.65, 6: 0.60,
  7: 0.57, 8: 0.54, 9: 0.52, 10: 0.49, 11: 0.47, 12: 0.45,
  13: 0.44, 14: 0.42, 15: 0.41, 16: 0.39, 17: 0.38, 18: 0.37,
  19: 0.35, 20: 0.34,
};

/** Tabela 45: cabos unipolares em dutos individuais enterrados, distância nula entre dutos. */
export const GROUPING_BURIED_UNIPOLAR_DUCT_CONTACT_FACTORS: Record<number, number> = {
  1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.60,
  7: 0.53, 8: 0.50, 9: 0.47, 10: 0.45, 11: 0.43, 12: 0.41,
  13: 0.39, 14: 0.37, 15: 0.35, 16: 0.34, 17: 0.33, 18: 0.31,
  19: 0.30, 20: 0.29,
};

export function getTemperatureFactor(method: string, temperatureC: number): number {
  const table = method === 'D' ? SOIL_TEMPERATURE_FACTORS_PVC : AIR_TEMPERATURE_FACTORS_PVC;
  const factor = table[temperatureC];
  if (!factor) {
    throw new Error(`Temperatura ${temperatureC} °C fora da tabela de correção para o método ${method}.`);
  }
  return factor;
}

export function getGroupingFactor(
  method: string,
  circuits: number,
  buriedConfiguration: 'unipolarDuct' | 'multipolarDuct' = 'unipolarDuct',
): number {
  const normalized = Math.max(1, Math.min(20, Math.trunc(circuits || 1)));
  if (method.startsWith('G_')) {
    if (normalized > 1) {
      throw new Error('Os métodos G desta versão suportam apenas um circuito por cálculo. Para múltiplos circuitos, informe outra configuração de instalação com fator de agrupamento aplicável.');
    }
    return 1;
  }
  const table = method === 'D'
    ? (buriedConfiguration === 'multipolarDuct'
      ? GROUPING_BURIED_MULTIPOLAR_DUCT_CONTACT_FACTORS
      : GROUPING_BURIED_UNIPOLAR_DUCT_CONTACT_FACTORS)
    : GROUPING_BUNDLE_FACTORS;
  return table[normalized] ?? table[20] ?? 1;
}

export function getSoilResistivityFactor(method: string, thermalResistivity = 2.5): number {
  if (method !== 'D') return 1;
  const factor = SOIL_THERMAL_RESISTIVITY_FACTORS_DUCT[String(thermalResistivity)];
  if (!factor) {
    throw new Error(`Resistividade térmica do solo ${thermalResistivity} K.m/W fora das opções suportadas.`);
  }
  return factor;
}
