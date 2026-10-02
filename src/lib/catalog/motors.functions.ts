import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { ORIGINAL_WEG_MOTORS } from "./original-motors";
type MotorRow = Database["public"]["Tables"]["motor_catalog"]["Row"];
type MotorFilter = {
  line: string;
  speed_type?: string | undefined;
  poles?: string | undefined;
  power_cv?: number | undefined;
  voltage?: number | undefined;
};
// Preserve the original catalog when the optional cloud catalog is empty or offline.
async function loadCatalog(): Promise<MotorRow[]> {
  const rows: MotorRow[] = [];
  try {
    for (let start = 0; ; start += 500) {
      const { data, error } = await supabase
        .from("motor_catalog")
        .select("*")
        .eq("is_active", true)
        .eq("manufacturer", "WEG")
        .order("id")
        .range(start, start + 499);
      if (error) return ORIGINAL_WEG_MOTORS;
      rows.push(...(data ?? []));
      if ((data?.length ?? 0) < 500) break;
    }
    return rows.length ? rows : ORIGINAL_WEG_MOTORS;
  } catch {
    return ORIGINAL_WEG_MOTORS;
  }
}
export async function getMotorCatalogFilters() {
  return (await loadCatalog()).map(({ line, speed_type, poles, power_cv, voltage }) => ({
    line,
    speed_type,
    poles,
    power_cv,
    voltage,
  }));
}
export async function getMotorsByFilter({ data }: { data: MotorFilter }) {
  if (data.speed_type && !["SINGLE", "DAHLANDER", "DOUBLE_WINDING"].includes(data.speed_type))
    throw new Error("Tipo de motor inválido.");
  return (await loadCatalog())
    .filter(
      (motor) =>
        motor.line === data.line &&
        (!data.speed_type || motor.speed_type === data.speed_type) &&
        (!data.poles || motor.poles === data.poles) &&
        (data.power_cv === undefined || motor.power_cv === data.power_cv) &&
        (data.voltage === undefined || motor.voltage === data.voltage),
    )
    .sort((a, b) => (a.model_code ?? "").localeCompare(b.model_code ?? ""));
}
