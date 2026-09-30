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
  | 'adjacent'
  | 'multipolar'
  | 'spaced2D'
  | 'spaced13cm'
  | 'spaced20cm'
  | 'trefoil';

export interface CableImpedance {
  rca: number; // ohm/km
  xl: number;  // ohm/km
}

type ImpedanceTable = Record<number, CableImpedance | null>;

const row = (pairs: Array<[number, number] | null>): ImpedanceTable => {
  const sections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];
  return Object.fromEntries(sections.map((section, index) => {
    const pair = pairs[index];
    return [section, pair ? { rca: pair[0], xl: pair[1] } : null];
  }));
};

const MONO_ADJACENT = row([
  [17.00,.15],[10.18,.14],[6.31,.13],[4.21,.12],[2.44,.12],[1.54,.11],[1.00,.11],[.71,.11],[.49,.10],[.35,.10],[.26,.10],[.21,.10],[.17,.10],[.14,.10],[.11,.09],[.09,.09],[.07,.09],[.06,.09],
]);
const MONO_MULTIPOLAR = row([
  [17.00,.12],[10.18,.11],[6.31,.10],[4.21,.10],[2.44,.10],[1.54,.09],[1.00,.09],[.71,.09],[.49,.09],[.35,.09],[.26,.08],[.21,.08],[.17,.08],[.14,.09],[.11,.08],null,null,null,
]);
const MONO_SPACED_2D = row([
  [17.00,.21],[10.18,.20],[6.31,.19],[4.21,.18],[2.44,.17],[1.54,.16],[1.00,.16],[.71,.16],[.49,.16],[.35,.15],[.26,.15],[.21,.15],[.17,.15],[.14,.15],[.10,.15],[.08,.15],[.06,.14],[.05,.14],
]);
const MONO_SPACED_13 = row([
  [17.00,.40],[10.20,.39],[6.31,.37],[4.21,.35],[2.44,.34],[1.54,.32],[1.00,.30],[.71,.29],[.49,.28],[.35,.27],[.26,.25],[.21,.25],[.17,.24],[.14,.23],[.10,.22],[.08,.21],[.06,.20],[.05,.19],
]);
const MONO_SPACED_20 = row([
  [17.00,.44],[10.20,.42],[6.31,.40],[4.21,.39],[2.44,.37],[1.54,.35],[1.00,.34],[.71,.32],[.49,.31],[.35,.30],[.26,.29],[.21,.28],[.17,.27],[.14,.26],[.10,.25],[.08,.24],[.06,.24],[.05,.22],
]);

const TRI_FLAT_ADJACENT = row([
  [17.00,.17],[10.20,.16],[6.31,.15],[4.21,.14],[2.44,.14],[1.54,.13],[1.00,.13],[.71,.12],[.49,.12],[.35,.12],[.26,.12],[.21,.11],[.17,.11],[.14,.11],[.11,.11],[.09,.11],[.07,.11],[.06,.11],
]);
const TRI_MULTIPOLAR = row([
  [17.00,.12],[10.20,.11],[6.31,.10],[4.21,.10],[2.44,.10],[1.54,.09],[1.00,.09],[.71,.09],[.49,.09],[.35,.09],[.27,.08],[.21,.08],[.17,.08],[.14,.09],[.11,.08],null,null,null,
]);
const TRI_SPACED_2D = row([
  [17.00,.22],[10.18,.21],[6.31,.20],[4.21,.19],[2.44,.19],[1.54,.18],[1.00,.18],[.71,.18],[.49,.17],[.35,.17],[.26,.17],[.21,.17],[.17,.17],[.14,.17],[.10,.16],[.08,.16],[.06,.16],[.05,.16],
]);
const TRI_SPACED_13 = row([
  [17.00,.42],[10.20,.40],[6.31,.39],[4.21,.37],[2.44,.36],[1.54,.34],[1.00,.32],[.71,.31],[.49,.30],[.35,.29],[.26,.27],[.21,.26],[.17,.26],[.14,.25],[.10,.24],[.08,.23],[.06,.22],[.05,.21],
]);
const TRI_SPACED_20 = row([
  [17.00,.45],[10.20,.44],[6.31,.42],[4.21,.40],[2.44,.39],[1.54,.37],[1.00,.35],[.71,.34],[.49,.33],[.35,.32],[.26,.30],[.21,.30],[.17,.29],[.14,.28],[.10,.27],[.08,.26],[.06,.25],[.05,.24],
]);
const TRI_TREFOIL = row([
  [17.00,.15],[10.20,.14],[6.31,.13],[4.21,.12],[2.44,.12],[1.54,.11],[1.00,.11],[.71,.11],[.49,.10],[.35,.10],[.26,.10],[.21,.10],[.17,.10],[.14,.10],[.11,.09],[.09,.09],[.07,.09],[.06,.09],
]);

export const STANDARD_CABLE_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];

export function getCableImpedance(
  phase: 'monofasico' | 'trifasico',
  arrangement: VoltageDropArrangement,
  section: number,
): CableImpedance | null {
  if (phase === 'monofasico') {
    if (arrangement === 'trefoil') return null;
    const table = arrangement === 'multipolar' ? MONO_MULTIPOLAR
      : arrangement === 'spaced2D' ? MONO_SPACED_2D
      : arrangement === 'spaced13cm' ? MONO_SPACED_13
      : arrangement === 'spaced20cm' ? MONO_SPACED_20
      : MONO_ADJACENT;
    return table[section] ?? null;
  }

  const table = arrangement === 'multipolar' ? TRI_MULTIPOLAR
    : arrangement === 'spaced2D' ? TRI_SPACED_2D
    : arrangement === 'spaced13cm' ? TRI_SPACED_13
    : arrangement === 'spaced20cm' ? TRI_SPACED_20
    : arrangement === 'trefoil' ? TRI_TREFOIL
    : TRI_FLAT_ADJACENT;
  return table[section] ?? null;
}

export function inferVoltageDropArrangement(
  phase: 'monofasico' | 'trifasico',
  installationMethod: string,
  buriedConfiguration?: 'unipolarDuct' | 'multipolarDuct',
): VoltageDropArrangement {
  if (installationMethod === 'D' && buriedConfiguration === 'multipolarDuct') return 'multipolar';
  if (['A2', 'B2', 'E'].includes(installationMethod)) return 'multipolar';
  if (installationMethod === 'F3_TREFOIL') return 'trefoil';
  if (installationMethod === 'G_HORIZONTAL' || installationMethod === 'G_VERTICAL') return 'spaced2D';
  if (phase === 'trifasico' && installationMethod === 'F3_FLAT') return 'adjacent';
  return 'adjacent';
}
