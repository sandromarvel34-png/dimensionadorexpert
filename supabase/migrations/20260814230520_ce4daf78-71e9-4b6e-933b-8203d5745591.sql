-- 1. Enum e Tabelas Base
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role public.app_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.technical_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_name TEXT NOT NULL,
  version TEXT,
  section TEXT,
  description TEXT,
  source_document TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.manufacturer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer TEXT NOT NULL,
  category TEXT NOT NULL,
  model TEXT NOT NULL,
  commercial_code TEXT NOT NULL,
  description TEXT,
  nominal_current NUMERIC,
  power_range_min NUMERIC,
  power_range_max NUMERIC,
  voltage NUMERIC,
  adjustment_range_min NUMERIC,
  adjustment_range_max NUMERIC,
  price NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.motor_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_id UUID REFERENCES public.motor_calculations(id) ON DELETE SET NULL,
  proposal_number TEXT NOT NULL,
  client_data JSONB NOT NULL,
  pricing_summary JSONB NOT NULL,
  labor_info JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.technical_references TO authenticated;
GRANT SELECT ON public.manufacturer_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.motor_calculations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.technical_references TO service_role;
GRANT ALL ON public.manufacturer_products TO service_role;
GRANT ALL ON public.motor_calculations TO service_role;
GRANT ALL ON public.proposals TO service_role;

-- 3. RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motor_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit own profile" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = id);

CREATE POLICY "Everyone authenticated can view references" ON public.technical_references
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Everyone authenticated can view products" ON public.manufacturer_products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own calculations" ON public.motor_calculations
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own proposals" ON public.proposals
  FOR ALL TO authenticated USING (auth.uid() = user_id);
