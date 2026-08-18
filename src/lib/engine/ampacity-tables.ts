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
      1.5: 17.5, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76, 25: 101, 35: 125, 50: 151, 70: 192, 95: 232, 120: 269, 150: 309, 185: 353, 240: 415, 300: 477, 400: 571, 500: 656
    }
  },
  {
    method: 'B2',
    conductors: 3,
    insulation: 'PVC',
    material: 'Copper',
    table: {
      1.5: 14.5, 2.5: 19.5, 4: 26, 6: 34, 10: 46, 16: 63, 25: 83, 35: 102, 50: 124, 70: 158, 95: 192, 120: 221, 150: 255, 185: 291, 240: 344
    }
  },
  {
    method: 'C',
    conductors: 3,
    insulation: 'PVC',
    material: 'Copper',
    table: {
      1.5: 17.5, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76, 25: 102, 35: 126, 50: 154, 70: 198, 95: 241, 120: 280, 150: 324, 185: 371, 240: 439
    }
  },
  {
    method: 'D',
    conductors: 3,
    insulation: 'PVC',
    material: 'Copper',
    table: {
      1.5: 18, 2.5: 24, 4: 31, 6: 39, 10: 52, 16: 67, 25: 86, 35: 103, 50: 122, 70: 151, 95: 179, 120: 203, 150: 230, 185: 258, 240: 297
  },
  {
    method: 'E',
    conductors: 3,
    insulation: 'PVC',
    material: 'Copper',
    table: {
      1.5: 18.5, 2.5: 25, 4: 33, 6: 42, 10: 59, 16: 79, 25: 104, 35: 129, 50: 157, 70: 202, 95: 245, 120: 285, 150: 329, 185: 377, 240: 445
    }
  },
  {
    method: 'F',
    conductors: 3,
    insulation: 'PVC',
    material: 'Copper',
    table: {
      1.5: 17.5, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76, 25: 96, 35: 119, 50: 144, 70: 184, 95: 223, 120: 259, 150: 299, 185: 341, 240: 403
    }
  }
];
