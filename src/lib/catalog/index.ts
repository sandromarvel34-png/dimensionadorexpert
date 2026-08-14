import { 
  ManufacturerProduct 
} from '../../types';

export const MANUFACTURER_CATALOG: ManufacturerProduct[] = [
  // Exemplo de Disjuntores WEG (Dados Reais Simplificados para Estrutura)
  {
    id: 'weg-mdw-c10',
    manufacturer: 'WEG',
    category: 'disjuntor',
    model: 'MDW-C10',
    commercialCode: '10076442',
    description: 'Mini disjuntor MDW Curva C, 10A, 1 Polo',
    nominalCurrent: 10,
    voltage: 440,
    price: 15.50
  },
  {
    id: 'weg-cwm9',
    manufacturer: 'WEG',
    category: 'contator',
    model: 'CWM9',
    commercialCode: '10045412',
    description: 'Contator de potência CWM, 9A, AC-3',
    nominalCurrent: 9,
    voltage: 690,
    price: 85.00
  },
  // Relé Térmico
  {
    id: 'weg-rw27-1d3',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-U010',
    commercialCode: '10046944',
    description: 'Relé de sobrecarga térmico RW27, 7-10A',
    nominalCurrent: 10,
    adjustmentRange: { min: 7, max: 10 },
    price: 65.00
  }
];

export const getProductsByCategory = (category: string) => 
  MANUFACTURER_CATALOG.filter(p => p.category === category);

export const findCompatibleProduct = (
  category: string, 
  current: number, 
  manufacturer?: string
) => {
  return MANUFACTURER_CATALOG.find(p => 
    p.category === category && 
    (manufacturer ? p.manufacturer === manufacturer : true) &&
    (p.nominalCurrent ? p.nominalCurrent >= current : true) &&
    (p.adjustmentRange ? (current >= p.adjustmentRange.min && current <= p.adjustmentRange.max) : true)
  );
};
