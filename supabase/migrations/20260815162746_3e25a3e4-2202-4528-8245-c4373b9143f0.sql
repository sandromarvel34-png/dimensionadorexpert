GRANT SELECT ON public.motor_catalog TO anon, authenticated;
ALTER TABLE public.motor_catalog DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.motor_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone authenticated can view motor catalog" ON public.motor_catalog;
CREATE POLICY "Everyone can view motor catalog" ON public.motor_catalog FOR SELECT TO anon, authenticated USING (true);