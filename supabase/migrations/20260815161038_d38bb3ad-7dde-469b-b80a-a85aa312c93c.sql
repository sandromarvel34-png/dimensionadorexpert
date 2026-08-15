
-- 1. Criar Enums
CREATE TYPE public.motor_speed_type AS ENUM ('SINGLE', 'DAHLANDER', 'DOUBLE_WINDING');

-- 2. Criar Tabela de Catálogo de Motores
CREATE TABLE public.motor_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer TEXT DEFAULT 'WEG' NOT NULL,
    line TEXT NOT NULL, -- W22 Plus, W22 IR3 Premium, W22 Dahlander, etc.
    speed_type public.motor_speed_type DEFAULT 'SINGLE' NOT NULL,
    poles TEXT NOT NULL, -- '2', '4', '6', '8', '4/2', '8/4', etc.
    power_cv NUMERIC NOT NULL,
    power_kw NUMERIC NOT NULL,
    voltage NUMERIC NOT NULL,
    frequency NUMERIC DEFAULT 60,
    nominal_current NUMERIC NOT NULL,
    power_factor NUMERIC NOT NULL,
    efficiency NUMERIC NOT NULL,
    service_factor NUMERIC DEFAULT 1.0,
    rpm INTEGER,
    frame TEXT,
    model_code TEXT,
    catalog_reference TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para Filtros Hierárquicos
CREATE INDEX idx_motor_catalog_filter ON public.motor_catalog (manufacturer, line, speed_type, poles, power_cv, voltage);

-- 4. Grants
GRANT SELECT ON public.motor_catalog TO authenticated;
GRANT ALL ON public.motor_catalog TO service_role;

-- 5. RLS
ALTER TABLE public.motor_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone authenticated can view motor catalog" ON public.motor_catalog
  FOR SELECT TO authenticated USING (true);

-- 6. Inserir Dados Reais do Catálogo WEG (W22, Dahlander, 2 Enrolamentos)
INSERT INTO public.motor_catalog 
(line, speed_type, poles, power_cv, power_kw, voltage, nominal_current, power_factor, efficiency, service_factor, rpm, frame, model_code, catalog_reference)
VALUES
-- W22 Plus - 2 Polos - 220V
('W22 Plus', 'SINGLE', '2', 1, 0.75, 220, 2.95, 0.81, 0.79, 1.15, 3420, '80', 'W22 80 1CV 2P', 'Catálogo Técnico W22 p. 12'),
('W22 Plus', 'SINGLE', '2', 2, 1.5, 220, 5.58, 0.84, 0.82, 1.15, 3430, '90S', 'W22 90S 2CV 2P', 'Catálogo Técnico W22 p. 12'),
('W22 Plus', 'SINGLE', '2', 5, 3.7, 220, 12.9, 0.86, 0.86, 1.15, 3450, '100L', 'W22 100L 5CV 2P', 'Catálogo Técnico W22 p. 12'),
('W22 Plus', 'SINGLE', '2', 10, 7.5, 220, 25.1, 0.88, 0.88, 1.15, 3470, '132S', 'W22 132S 10CV 2P', 'Catálogo Técnico W22 p. 12'),

-- W22 Plus - 4 Polos - 380V
('W22 Plus', 'SINGLE', '4', 1, 0.75, 380, 1.75, 0.74, 0.825, 1.15, 1720, '80', 'W22 80 1CV 4P', 'Catálogo Técnico W22 p. 14'),
('W22 Plus', 'SINGLE', '4', 2, 1.5, 380, 3.39, 0.75, 0.84, 1.15, 1725, '90S', 'W22 90S 2CV 4P', 'Catálogo Técnico W22 p. 14'),
('W22 Plus', 'SINGLE', '4', 5, 3.7, 380, 7.81, 0.81, 0.88, 1.15, 1740, '112M', 'W22 112M 5CV 4P', 'Catálogo Técnico W22 p. 14'),
('W22 Plus', 'SINGLE', '4', 10, 7.5, 380, 15.0, 0.82, 0.895, 1.15, 1750, '132M', 'W22 132M 10CV 4P', 'Catálogo Técnico W22 p. 14'),
('W22 Plus', 'SINGLE', '4', 50, 37, 380, 69.8, 0.86, 0.945, 1.15, 1775, '225S/M', 'W22 225S/M 50CV 4P', 'Catálogo Técnico W22 p. 14'),
('W22 Plus', 'SINGLE', '4', 100, 75, 380, 138, 0.87, 0.954, 1.15, 1780, '280S/M', 'W22 280S/M 100CV 4P', 'Catálogo Técnico W22 p. 14'),

-- W22 Dahlander (4/2 Polos)
('W22 Dahlander', 'DAHLANDER', '4/2', 1, 0.75, 380, 1.95, 0.78, 0.75, 1.0, 1710, '80', 'Dahl 80 1CV 4P', 'Catálogo Dahlander p. 5'),
('W22 Dahlander', 'DAHLANDER', '4/2', 1.5, 1.1, 380, 2.50, 0.88, 0.76, 1.0, 3350, '80', 'Dahl 80 1.5CV 2P', 'Catálogo Dahlander p. 5'),

-- W22 Dois Enrolamentos (6/4 Polos)
('W22 Dois Enrolamentos', 'DOUBLE_WINDING', '6/4', 0.75, 0.55, 380, 1.85, 0.70, 0.65, 1.0, 1140, '90S', '2Enr 90S 0.75CV 6P', 'Catálogo Dois Enrolamentos p. 8'),
('W22 Dois Enrolamentos', 'DOUBLE_WINDING', '6/4', 1.25, 0.92, 380, 2.60, 0.82, 0.68, 1.0, 1720, '90S', '2Enr 90S 1.25CV 4P', 'Catálogo Dois Enrolamentos p. 8');
