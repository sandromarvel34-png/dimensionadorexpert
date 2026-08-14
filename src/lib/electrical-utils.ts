/**
 * Electrical engineering constants and utility functions based on the uploaded reference
 */

// Reference data for contactors (Amps)
export const CONTACTORS = [9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 105, 150, 170, 210, 250, 300];

// Thermal relay ranges
export const THERMAL_RELAYS = [
  { min: 0.4, max: 0.63 }, { min: 0.63, max: 1 }, { min: 1, max: 1.6 }, { min: 1.6, max: 2.5 },
  { min: 2.5, max: 4 }, { min: 4, max: 6 }, { min: 5.5, max: 8 }, { min: 7, max: 10 }, { min: 9, max: 13 },
  { min: 12, max: 18 }, { min: 17, max: 25 }, { min: 23, max: 32 }, { min: 30, max: 40 }, { min: 37, max: 50 },
  { min: 48, max: 65 }, { min: 55, max: 70 }, { min: 63, max: 80 }, { min: 70, max: 104 }
];

// Motor breakers (Amps)
export const MOTOR_BREAKERS = [4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 225];

// Cable data (mm², ampacity at ~70°C PVC, reference price)
export const CABLES = [
  { mm: 1.5, amp: 17.5, precoM: 1.8 },
  { mm: 2.5, amp: 24, precoM: 2.8 },
  { mm: 4, amp: 32, precoM: 4.5 },
  { mm: 6, amp: 41, precoM: 6.8 },
  { mm: 10, amp: 57, precoM: 11.5 },
  { mm: 16, amp: 76, precoM: 18 },
  { mm: 25, amp: 101, precoM: 28 },
  { mm: 35, amp: 125, precoM: 40 },
  { mm: 50, amp: 151, precoM: 58 },
  { mm: 70, amp: 192, precoM: 82 },
  { mm: 95, amp: 232, precoM: 112 }
];

export const CABLE_SECTIONS = CABLES.map(c => c.mm);

export const MIN_SECTION_POWER = 2.5; // NBR 5410

export type StartType = 'direta' | 'reversao' | 'estrelaTriangulo' | 'compensada' | 'softstarter' | 'inversor';
export type Brand = 'weg' | 'siemens' | 'schneider' | 'comparar';
export type Material = 'copper' | 'aluminum';

/**
 * Calculates nominal current for a 3-phase motor
 */
export function calculateMotorCurrent(cv: number, voltage: number): number {
  const factors: Record<number, number> = { 220: 2.639, 380: 1.529, 440: 1.320 };
  return cv * (factors[voltage] || 1.529);
}

/**
 * Sizing by voltage drop (NBR 5410, 3-phase)
 */
export function calculateVoltageDrop(
  material: Material,
  length: number,
  current: number,
  section: number,
  voltage: number,
  phases: 1 | 3 = 3
): number {
  const rho = 0.0178; // Copper resistivity
  const cosphi = 0.86;
  const multiplier = phases === 3 ? Math.sqrt(3) : 2;
  return (100 * multiplier * rho * length * current * cosphi) / (section * voltage);
}

export function pickCeil(arr: number[], target: number): number {
  for (const v of arr) { if (v >= target) return v; }
  return arr[arr.length - 1];
}

export function findSectionByAmpacity(material: Material, current: number): number {
  for (const c of CABLES) { if (c.amp >= current) return c.mm; }
  const last = CABLES[CABLES.length - 1];
  return last ? last.mm : 95;
}

export function pickThermalRelay(target: number) {
  for (const r of THERMAL_RELAYS) { if (target >= r.min && target <= r.max) return r; }
  const last = THERMAL_RELAYS[THERMAL_RELAYS.length - 1];
  return last || { min: 70, max: 104 };
}

export function pickCableByAmpacity(target: number) {
  for (const c of CABLES) { if (c.amp >= target) return c; }
  const last = CABLES[CABLES.length - 1];
  return last || { mm: 95, amp: 232, precoM: 112 };
}

export function pickCableBySection(target: number) {
  for (const c of CABLES) { if (c.mm >= target) return c; }
  const last = CABLES[CABLES.length - 1];
  return last || { mm: 95, amp: 232, precoM: 112 };
}
