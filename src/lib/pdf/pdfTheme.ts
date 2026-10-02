/** Shared palette for all company documents. */
export const NAVY: [number, number, number] = [15, 23, 42];
export const SLATE: [number, number, number] = [71, 85, 105];
export const LIGHT: [number, number, number] = [248, 250, 252];
export const BORDER: [number, number, number] = [226, 232, 240];

export const hexToRgb = (hex: string): [number, number, number] => {
  const clean = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.slice(1) : "2563EB";
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
};
