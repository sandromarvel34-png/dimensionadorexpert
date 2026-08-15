-- Expandindo o catálogo de motores WEG com as potências solicitadas
-- Valores baseados em tabelas técnicas padrão da WEG (W22 IR3 Premium / Plus)

INSERT INTO public.motor_catalog 
(line, speed_type, poles, power_cv, power_kw, voltage, nominal_current, power_factor, efficiency, service_factor, rpm, frame, model_code, catalog_reference)
VALUES
-- 220V 4 Polos
('W22 Plus', 'SINGLE', '4', 1.5, 1.1, 220, 4.48, 0.74, 0.825, 1.15, 1720, '80', 'W22 80 1.5CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 3, 2.2, 220, 8.58, 0.78, 0.84, 1.15, 1730, '90L', 'W22 90L 3CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 4, 3.0, 220, 11.5, 0.79, 0.85, 1.15, 1735, '100L', 'W22 100L 4CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 6, 4.5, 220, 16.8, 0.81, 0.86, 1.15, 1745, '112M', 'W22 112M 6CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 7.5, 5.5, 220, 20.2, 0.82, 0.87, 1.15, 1750, '132S', 'W22 132S 7.5CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 12.5, 9.2, 220, 33.5, 0.83, 0.88, 1.15, 1760, '132M/L', 'W22 132M/L 12.5CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 15, 11, 220, 39.5, 0.84, 0.89, 1.15, 1765, '160M', 'W22 160M 15CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 20, 15, 220, 52.5, 0.85, 0.90, 1.15, 1770, '160L', 'W22 160L 20CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 25, 18.5, 220, 64.0, 0.85, 0.91, 1.15, 1770, '180M', 'W22 180M 25CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 30, 22, 220, 75.0, 0.86, 0.92, 1.15, 1775, '180L', 'W22 180L 30CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 40, 30, 220, 102, 0.86, 0.93, 1.15, 1775, '200L', 'W22 200L 40CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 60, 45, 220, 150, 0.87, 0.94, 1.15, 1780, '225S/M', 'W22 225S/M 60CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 75, 55, 220, 185, 0.87, 0.945, 1.15, 1780, '250S/M', 'W22 250S/M 75CV 4P', 'Expansão Catálogo'),

-- 380V 4 Polos
('W22 Plus', 'SINGLE', '4', 1.5, 1.1, 380, 2.59, 0.74, 0.825, 1.15, 1720, '80', 'W22 80 1.5CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 3, 2.2, 380, 4.97, 0.78, 0.84, 1.15, 1730, '90L', 'W22 90L 3CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 4, 3.0, 380, 6.66, 0.79, 0.85, 1.15, 1735, '100L', 'W22 100L 4CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 6, 4.5, 380, 9.72, 0.81, 0.86, 1.15, 1745, '112M', 'W22 112M 6CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 7.5, 5.5, 380, 11.7, 0.82, 0.87, 1.15, 1750, '132S', 'W22 132S 7.5CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 12.5, 9.2, 380, 19.4, 0.83, 0.88, 1.15, 1760, '132M/L', 'W22 132M/L 12.5CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 15, 11, 380, 22.9, 0.84, 0.89, 1.15, 1765, '160M', 'W22 160M 15CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 20, 15, 380, 30.4, 0.85, 0.90, 1.15, 1770, '160L', 'W22 160L 20CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 25, 18.5, 380, 37.1, 0.85, 0.91, 1.15, 1770, '180M', 'W22 180M 25CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 30, 22, 380, 43.4, 0.86, 0.92, 1.15, 1775, '180L', 'W22 180L 30CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 40, 30, 380, 59.0, 0.86, 0.93, 1.15, 1775, '200L', 'W22 200L 40CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 60, 45, 380, 86.9, 0.87, 0.94, 1.15, 1780, '225S/M', 'W22 225S/M 60CV 4P', 'Expansão Catálogo'),
('W22 Plus', 'SINGLE', '4', 75, 55, 380, 107, 0.87, 0.945, 1.15, 1780, '250S/M', 'W22 250S/M 75CV 4P', 'Expansão Catálogo');
