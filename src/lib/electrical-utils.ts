/**
 * Electrical engineering constants and utility functions for sizing
 */

// Resistivity (ohm * mm^2 / m) at 20°C
export const RESISTIVITY = {
  COPPER: 0.0172,
  ALUMINUM: 0.0282,
};

// Standard cable sections (mm^2)
export const CABLE_SECTIONS = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300
];

// Reference Ampacity Table (Simplified NBR 5410 Method B1 - 2/3 Loaded Conductors PVC 70°C)
// This is a simplified lookup. In a real app, this would be much more extensive.
export const AMPACITY_TABLE_PVC_70 = {
  copper: {
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
  },
  aluminum: {
    10: 44,
    16: 59,
    25: 78,
    35: 97,
    50: 117,
    70: 149,
    95: 180,
    120: 209,
  }
};

export type Material = 'copper' | 'aluminum';

/**
 * Calculates voltage drop percentage
 * Vd = (2 * rho * L * I) / S (for single-phase)
 * Vd% = (Vd / V_nominal) * 100
 */
export function calculateVoltageDrop(
  material: Material,
  length: number,
  current: number,
  section: number,
  voltage: number,
  phases: 1 | 3 = 1
) {
  const rho = material === 'copper' ? RESISTIVITY.COPPER : RESISTIVITY.ALUMINUM;
  const multiplier = phases === 1 ? 2 : Math.sqrt(3);
  const dropVolts = (multiplier * rho * length * current) / section;
  return (dropVolts / voltage) * 100;
}

/**
 * Finds the minimum section that satisfies ampacity
 */
export function findSectionByAmpacity(
  material: Material,
  current: number
): number | null {
  const table = AMPACITY_TABLE_PVC_70[material];
  const sections = Object.keys(table).map(Number).sort((a, b) => a - b);
  
  for (const s of sections) {
    if (table[s as keyof typeof table] >= current) {
      return s;
    }
  }
  return null;
}
