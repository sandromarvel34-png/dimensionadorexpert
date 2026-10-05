import type {
  CalculationInputs,
  CalculationResults,
  ManufacturerProduct,
  TechnicalRequirement,
} from "@/types";
import { findCompatibleProducts, getProductsByCategory } from "./index";

export const MANUFACTURERS = ["WEG", "Siemens", "Schneider"] as const;
export const MAIN_BREAKER_LABEL = "Disjuntor do Circuito Principal (Força)";

export function selectManufacturerReferences(
  requirements: TechnicalRequirement[],
  inputs: CalculationInputs,
  cableCapacity?: number,
): CalculationResults["compatibleProducts"] {
  return Object.fromEntries(
    requirements.map((req) => [
      req.label,
      Object.fromEntries(
        MANUFACTURERS.map((brand) => [
          brand,
          findCompatibleProducts(req.category, req.current ?? 0, brand, inputs.voltage)
            .filter((p) => req.poles === undefined || p.poles === req.poles)
            .filter(
              (p) => !p.inputPhases || p.inputPhases === (inputs.phase === "trifasico" ? 3 : 1),
            )
            .filter((p) => {
              if (req.label !== MAIN_BREAKER_LABEL) return true;
              if (
                cableCapacity !== undefined &&
                (p.nominalCurrent ?? Infinity) > cableCapacity + 1e-9
              )
                return false;
              if (inputs.shortCircuitCurrentKA === undefined) return true;
              const capacity =
                p.breakingCapacityByVoltage?.find((e) => inputs.voltage <= e.voltage)?.capacityKA ??
                p.breakingCapacityKA;
              return capacity !== undefined && capacity >= inputs.shortCircuitCurrentKA;
            }),
        ]),
      ),
    ]),
  );
}

// Only references are refreshed. Saved numerical calculations and commercial items are preserved.
export function refreshManufacturerReferences(
  results: CalculationResults,
  inputs: CalculationInputs,
): CalculationResults {
  if (!results.technicalRequirements?.length) return results;
  const compatibleProducts = selectManufacturerReferences(
    results.technicalRequirements,
    inputs,
    results.cableCurrentCapacity,
  );
  const candidates = (label: string): ManufacturerProduct[] => {
    const map = compatibleProducts[label] ?? {};
    const brand = inputs.preferredManufacturer;
    return brand && brand !== "any"
      ? (Object.entries(map).find(([name]) => name.toLowerCase() === brand.toLowerCase())?.[1] ??
          [])
      : Object.values(map).flat();
  };
  const first = (label: string) => candidates(label)[0] ?? null;
  const electromechanical = ["direta", "reversao", "estrelaTriangulo"].includes(inputs.starterType);
  return {
    ...results,
    compatibleProducts,
    protections: {
      ...results.protections,
      breaker: first(MAIN_BREAKER_LABEL),
      motorBreaker: first("Disjuntor Motor"),
      thermalRelay: electromechanical ? first("Relé Térmico") : null,
      contactor: candidates(
        inputs.starterType === "direta"
          ? "Contator de Potência (K1)"
          : "Contatores de Potência (K1, K2)",
      ),
      timerRelay: first("Relé de Tempo Estrela-Triângulo"),
      softStarter: first("Soft-Starter"),
      inverter: first("Inversor de Frequência"),
    },
  };
}

export function explainMissingReference(
  req: TechnicalRequirement,
  brand: string,
  inputs: CalculationInputs,
): string {
  const products = getProductsByCategory(req.category).filter(
    (p) =>
      p.manufacturer === brand &&
      p.lifecycle !== "phase-out" &&
      (!["disjuntor", "disjuntorMotor", "contator", "softStarter", "inverter"].includes(
        req.category,
      ) ||
        (p.voltageRange
          ? inputs.voltage >= p.voltageRange.min && inputs.voltage <= p.voltageRange.max
          : (p.voltage ?? 0) >= inputs.voltage)),
  );
  const rated = products.map((p) => p.adjustmentRange?.max ?? p.nominalCurrent ?? 0);
  const max = Math.max(0, ...rated);
  if (req.category === "disjuntorMotor" && (req.current ?? 0) > max) {
    return `Corrente acima de ${max} A, limite dos disjuntores-motor ${brand} auditados. Use a alternativa com disjuntor do circuito principal e relé de sobrecarga desta marca, indicados neste resultado.`;
  }
  if ((req.current ?? 0) > max && max > 0) {
    return `Corrente requerida ${(req.current ?? 0).toFixed(1)} A acima da cobertura auditada de ${brand} (${max} A). Solicite a configuração ao fabricante.`;
  }
  if (req.label === MAIN_BREAKER_LABEL && inputs.shortCircuitCurrentKA !== undefined) {
    return `Nenhuma configuração auditada atende simultaneamente aos polos, à proteção do cabo e à capacidade de interrupção de ${inputs.shortCircuitCurrentKA} kA em ${inputs.voltage} V. A configuração final precisa ser confirmada pelo fabricante.`;
  }
  return `A base auditada de ${brand} não cobre esta combinação de corrente, tensão e polos. Confirme uma configuração específica no catálogo do fabricante.`;
}
