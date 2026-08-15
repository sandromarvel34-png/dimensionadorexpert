import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const getMotorCatalogFilters = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from('motor_catalog')
      .select('line, speed_type, poles, power_cv, voltage')
      .eq('is_active', true);

    if (error) throw error;
    return data;
  });

export const getMotorsByFilter = createServerFn({ method: "POST" })
  .inputValidator((data: any) => data)
  .handler(async ({ data }: { data: any }) => {
    const { line, speed_type, poles, power_cv, voltage } = data;
    
    let query = supabase
      .from('motor_catalog')
      .select('*')
      .eq('is_active', true);

    if (line) query = query.eq('line', line);
    if (speed_type) query = query.eq('speed_type', speed_type);
    if (poles) query = query.eq('poles', poles);
    if (power_cv) query = query.eq('power_cv', power_cv);
    if (voltage) query = query.eq('voltage', voltage);

    const { data: motors, error } = await query.order('model_code', { ascending: true });

    if (error) throw error;
    return motors;
  });
