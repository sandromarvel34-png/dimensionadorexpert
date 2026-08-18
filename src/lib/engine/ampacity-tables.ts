/**
 * NBR 5410:2004 - Tabelas de Capacidade de Condução de Corrente
 * Métodos de Instalação: A1, A2, B1, B2, C, D, E, F, G
 */

export interface AmpacityTable {
  method: string;
  conductors: number; // Carregados (2 ou 3)
  insulation: 'PVC' | 'EPR_XLPE';
  material: 'Copper' | 'Aluminum';
  table: Record<number, number>; // mm² -> Amperes
}

export const AMPACITY_TABLES_NBR5410: AmpacityTable[] = [
  {
    method: 'B1',
    conductors: 3,
    insulation: 'PVC',
    material: 'Copper',
    table: {
      1.5: 15.5,
      2.5: 21,
      4: 28,
      6: 36,
      10: 50,
      16: 68,
      25: 89,
      35: 110,
      50: 134,
      70: 171,
      95: 207,
      120: 239,
      150: 275,
      185: 314,
      240: 371,
      300: 426,
      400: 510,
      500: 587
    }
  },
  {
    method: 'B1',
    conductors: 2,
    insulation: 'PVC',
    material: 'Copper',
    table: {
      1.5: 17.5,
      2.5: 24,
      4: 32,
      6: 41,
      10: 57,
      16: 76,
      25: 101,
      35: 125,
      50: 151,
      70: 192,
      95: 232,
      120: 269,
      150: 309,
      185: 353,
      240: 415,
      300: 477,
      400: 571,
      500: 656
    }
  }
  // TODO: Expandir para outros métodos (A1, C, D, etc) conforme necessário
];
