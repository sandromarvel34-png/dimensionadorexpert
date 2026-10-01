/**
 * Resistência CA (Rca) e reatância indutiva (XL) de referência para
 * cabo de cobre/PVC 70 °C a 60 Hz.
 *
 * Fonte técnica: Prysmian — Guia de Dimensionamento de Cabos para Baixa
 * Tensão Rev.10, Tabela 31 — Sintenax Flex (cobre).
 *
 * As configurações representam os arranjos geométricos publicados na tabela.
 * Os valores não se aplicam a conduto metálico fechado ferromagnético.
 */

export type VoltageDropArrangement =
  "adjacent" | "multipolar" | "spaced2D" | "spaced13cm" | "spaced20cm" | "trefoil";

export interface CableImpedance {
  rca: number; // ohm/km
  xl: number; // ohm/km
}

type ImpedanceTable = Record<number, CableImpedance | null>;

const row = (pairs: Array<[number, number] | null>): ImpedanceTable => {
  const sections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];
  return Object.fromEntries(
    sections.map((section, index) => {
      const pair = pairs[index];
      return [section, pair ? { rca: pair[0], xl: pair[1] } : null];
    }),
  );
};

const MONO_ADJACENT = row([
  [17.0, 0.15],
  [10.18, 0.14],
  [6.31, 0.13],
  [4.21, 0.12],
  [2.44, 0.12],
  [1.54, 0.11],
  [1.0, 0.11],
  [0.71, 0.11],
  [0.49, 0.1],
  [0.35, 0.1],
  [0.26, 0.1],
  [0.21, 0.1],
  [0.17, 0.1],
  [0.14, 0.1],
  [0.11, 0.09],
  [0.09, 0.09],
  [0.07, 0.09],
  [0.06, 0.09],
]);
const MONO_MULTIPOLAR = row([
  [17.0, 0.12],
  [10.18, 0.11],
  [6.31, 0.1],
  [4.21, 0.1],
  [2.44, 0.1],
  [1.54, 0.09],
  [1.0, 0.09],
  [0.71, 0.09],
  [0.49, 0.09],
  [0.35, 0.09],
  [0.26, 0.08],
  [0.21, 0.08],
  [0.17, 0.08],
  [0.14, 0.09],
  [0.11, 0.08],
  null,
  null,
  null,
]);
const MONO_SPACED_2D = row([
  [17.0, 0.21],
  [10.18, 0.2],
  [6.31, 0.19],
  [4.21, 0.18],
  [2.44, 0.17],
  [1.54, 0.16],
  [1.0, 0.16],
  [0.71, 0.16],
  [0.49, 0.16],
  [0.35, 0.15],
  [0.26, 0.15],
  [0.21, 0.15],
  [0.17, 0.15],
  [0.14, 0.15],
  [0.1, 0.15],
  [0.08, 0.15],
  [0.06, 0.14],
  [0.05, 0.14],
]);
const MONO_SPACED_13 = row([
  [17.0, 0.4],
  [10.2, 0.39],
  [6.31, 0.37],
  [4.21, 0.35],
  [2.44, 0.34],
  [1.54, 0.32],
  [1.0, 0.3],
  [0.71, 0.29],
  [0.49, 0.28],
  [0.35, 0.27],
  [0.26, 0.25],
  [0.21, 0.25],
  [0.17, 0.24],
  [0.14, 0.23],
  [0.1, 0.22],
  [0.08, 0.21],
  [0.06, 0.2],
  [0.05, 0.19],
]);
const MONO_SPACED_20 = row([
  [17.0, 0.44],
  [10.2, 0.42],
  [6.31, 0.4],
  [4.21, 0.39],
  [2.44, 0.37],
  [1.54, 0.35],
  [1.0, 0.34],
  [0.71, 0.32],
  [0.49, 0.31],
  [0.35, 0.3],
  [0.26, 0.29],
  [0.21, 0.28],
  [0.17, 0.27],
  [0.14, 0.26],
  [0.1, 0.25],
  [0.08, 0.24],
  [0.06, 0.24],
  [0.05, 0.22],
]);

const TRI_FLAT_ADJACENT = row([
  [17.0, 0.17],
  [10.2, 0.16],
  [6.31, 0.15],
  [4.21, 0.14],
  [2.44, 0.14],
  [1.54, 0.13],
  [1.0, 0.13],
  [0.71, 0.12],
  [0.49, 0.12],
  [0.35, 0.12],
  [0.26, 0.12],
  [0.21, 0.11],
  [0.17, 0.11],
  [0.14, 0.11],
  [0.11, 0.11],
  [0.09, 0.11],
  [0.07, 0.11],
  [0.06, 0.11],
]);
const TRI_MULTIPOLAR = row([
  [17.0, 0.12],
  [10.2, 0.11],
  [6.31, 0.1],
  [4.21, 0.1],
  [2.44, 0.1],
  [1.54, 0.09],
  [1.0, 0.09],
  [0.71, 0.09],
  [0.49, 0.09],
  [0.35, 0.09],
  [0.27, 0.08],
  [0.21, 0.08],
  [0.17, 0.08],
  [0.14, 0.09],
  [0.11, 0.08],
  null,
  null,
  null,
]);
const TRI_SPACED_2D = row([
  [17.0, 0.22],
  [10.18, 0.21],
  [6.31, 0.2],
  [4.21, 0.19],
  [2.44, 0.19],
  [1.54, 0.18],
  [1.0, 0.18],
  [0.71, 0.18],
  [0.49, 0.17],
  [0.35, 0.17],
  [0.26, 0.17],
  [0.21, 0.17],
  [0.17, 0.17],
  [0.14, 0.17],
  [0.1, 0.16],
  [0.08, 0.16],
  [0.06, 0.16],
  [0.05, 0.16],
]);
const TRI_SPACED_13 = row([
  [17.0, 0.42],
  [10.2, 0.4],
  [6.31, 0.39],
  [4.21, 0.37],
  [2.44, 0.36],
  [1.54, 0.34],
  [1.0, 0.32],
  [0.71, 0.31],
  [0.49, 0.3],
  [0.35, 0.29],
  [0.26, 0.27],
  [0.21, 0.26],
  [0.17, 0.26],
  [0.14, 0.25],
  [0.1, 0.24],
  [0.08, 0.23],
  [0.06, 0.22],
  [0.05, 0.21],
]);
const TRI_SPACED_20 = row([
  [17.0, 0.45],
  [10.2, 0.44],
  [6.31, 0.42],
  [4.21, 0.4],
  [2.44, 0.39],
  [1.54, 0.37],
  [1.0, 0.35],
  [0.71, 0.34],
  [0.49, 0.33],
  [0.35, 0.32],
  [0.26, 0.3],
  [0.21, 0.3],
  [0.17, 0.29],
  [0.14, 0.28],
  [0.1, 0.27],
  [0.08, 0.26],
  [0.06, 0.25],
  [0.05, 0.24],
]);
const TRI_TREFOIL = row([
  [17.0, 0.15],
  [10.2, 0.14],
  [6.31, 0.13],
  [4.21, 0.12],
  [2.44, 0.12],
  [1.54, 0.11],
  [1.0, 0.11],
  [0.71, 0.11],
  [0.49, 0.1],
  [0.35, 0.1],
  [0.26, 0.1],
  [0.21, 0.1],
  [0.17, 0.1],
  [0.14, 0.1],
  [0.11, 0.09],
  [0.09, 0.09],
  [0.07, 0.09],
  [0.06, 0.09],
]);

export const STANDARD_CABLE_SECTIONS = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500,
];

export function getCableImpedance(
  phase: "monofasico" | "trifasico",
  arrangement: VoltageDropArrangement,
  section: number,
): CableImpedance | null {
  if (phase === "monofasico") {
    if (arrangement === "trefoil") return null;
    const table =
      arrangement === "multipolar"
        ? MONO_MULTIPOLAR
        : arrangement === "spaced2D"
          ? MONO_SPACED_2D
          : arrangement === "spaced13cm"
            ? MONO_SPACED_13
            : arrangement === "spaced20cm"
              ? MONO_SPACED_20
              : MONO_ADJACENT;
    return table[section] ?? null;
  }

  const table =
    arrangement === "multipolar"
      ? TRI_MULTIPOLAR
      : arrangement === "spaced2D"
        ? TRI_SPACED_2D
        : arrangement === "spaced13cm"
          ? TRI_SPACED_13
          : arrangement === "spaced20cm"
            ? TRI_SPACED_20
            : arrangement === "trefoil"
              ? TRI_TREFOIL
              : TRI_FLAT_ADJACENT;
  return table[section] ?? null;
}

export function inferVoltageDropArrangement(
  phase: "monofasico" | "trifasico",
  installationMethod: string,
  buriedConfiguration?: "unipolarDuct" | "multipolarDuct",
): VoltageDropArrangement {
  if (installationMethod === "D" && buriedConfiguration === "multipolarDuct") return "multipolar";
  if (["A2", "B2", "E"].includes(installationMethod)) return "multipolar";
  if (installationMethod === "F3_TREFOIL") return "trefoil";
  if (installationMethod === "G_HORIZONTAL" || installationMethod === "G_VERTICAL")
    return "spaced2D";
  if (phase === "trifasico" && installationMethod === "F3_FLAT") return "adjacent";
  return "adjacent";
}
