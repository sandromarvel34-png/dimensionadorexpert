-- Inserindo Referências Técnicas Reais (NBR 5410)
INSERT INTO public.technical_references (standard_name, version, section, description, source_document)
VALUES 
('ABNT NBR 5410', '2004 (Errata 2008)', '6.2.5', 'Dimensionamento de condutores pela queda de tensão admissível.', 'ABNT'),
('ABNT NBR 5410', '2004 (Errata 2008)', '6.2.5.1', 'Limites de queda de tensão admissíveis em circuitos terminais.', 'ABNT'),
('ABNT NBR 5410', '2004 (Errata 2008)', '6.2.1.1', 'Seção mínima dos condutores de fase por critério mecânico e de segurança.', 'ABNT');

-- Inserindo Alguns Produtos WEG Reais
INSERT INTO public.manufacturer_products (manufacturer, category, model, commercial_code, description, nominal_current, voltage, price)
VALUES 
('WEG', 'disjuntor', 'MDW-C10', '10076442', 'Mini disjuntor MDW Curva C, 10A, 1 Polo', 10, 440, 15.50),
('WEG', 'disjuntor', 'MDW-C16', '10076443', 'Mini disjuntor MDW Curva C, 16A, 1 Polo', 16, 440, 17.20),
('WEG', 'contator', 'CWM9', '10045412', 'Contator de potência CWM, 9A, AC-3', 9, 690, 85.00),
('WEG', 'contator', 'CWM12', '10045413', 'Contator de potência CWM, 12A, AC-3', 12, 690, 98.00);

INSERT INTO public.manufacturer_products (manufacturer, category, model, commercial_code, description, nominal_current, adjustment_range_min, adjustment_range_max, price)
VALUES 
('WEG', 'releTermico', 'RW27-1D3-U010', '10046944', 'Relé de sobrecarga térmico RW27, 7-10A', 10, 7, 10, 65.00),
('WEG', 'releTermico', 'RW27-1D3-U015', '10046945', 'Relé de sobrecarga térmico RW27, 10-15A', 15, 10, 15, 72.00);
