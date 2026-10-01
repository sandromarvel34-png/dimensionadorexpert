import { supabase } from "@/integrations/supabase/client";

type MotorFilter = {
  line: string;
  speed_type?: string | undefined;
  poles?: string | undefined;
  power_cv?: number | undefined;
  voltage?: number | undefined;
};

// Use the signed-in browser client. A server function using this browser
// singleton cannot inherit the browser's authenticated session.
export async function getMotorCatalogFilters() {
  const { data, error } = await supabase
    .from("motor_catalog")
    .select("line,speed_type,poles,power_cv,voltage")
    .eq("is_active", true);
  if (error)
    throw new Error(
      "Catálogo de motores indisponível. Use os dados da placa no preenchimento manual.",
    );
  return data ?? [];
}

export async function getMotorsByFilter({ data }: { data: MotorFilter }) {
  let query = supabase
    .from("motor_catalog")
    .select("*")
    .eq("is_active", true)
    .eq("line", data.line);
  if (data.speed_type) {
    if (!["SINGLE", "DAHLANDER", "DOUBLE_WINDING"].includes(data.speed_type))
      throw new Error("Tipo de motor inválido.");
    query = query.eq("speed_type", data.speed_type as "SINGLE" | "DAHLANDER" | "DOUBLE_WINDING");
  }
  if (data.poles) query = query.eq("poles", data.poles);
  if (data.power_cv !== undefined) query = query.eq("power_cv", data.power_cv);
  if (data.voltage !== undefined) query = query.eq("voltage", data.voltage);
  const { data: motors, error } = await query.order("model_code", { ascending: true });
  if (error)
    throw new Error(
      "Não foi possível consultar os motores. Use os dados da placa no preenchimento manual.",
    );
  return motors ?? [];
}
