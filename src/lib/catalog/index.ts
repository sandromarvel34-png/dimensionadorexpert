import { 
  ManufacturerProduct 
} from '../../types';

export const MANUFACTURER_CATALOG: ManufacturerProduct[] = [
  // Disjuntores WEG MDW
  {
    id: 'weg-mdw-c6',
    manufacturer: 'WEG',
    category: 'disjuntor',
    model: 'MDW-C6',
    commercialCode: '10076440',
    description: 'Mini disjuntor MDW Curva C, 6A',
    nominalCurrent: 6,
    voltage: 440,
    price: 14.50
  },
  {
    id: 'weg-mdw-c10',
    manufacturer: 'WEG',
    category: 'disjuntor',
    model: 'MDW-C10',
    commercialCode: '10076442',
    description: 'Mini disjuntor MDW Curva C, 10A',
    nominalCurrent: 10,
    voltage: 440,
    price: 15.50
  },
  {
    id: 'weg-mdw-c16',
    manufacturer: 'WEG',
    category: 'disjuntor',
    model: 'MDW-C16',
    commercialCode: '10076444',
    description: 'Mini disjuntor MDW Curva C, 16A',
    nominalCurrent: 16,
    voltage: 440,
    price: 16.50
  },
  {
    id: 'weg-mdw-c20',
    manufacturer: 'WEG',
    category: 'disjuntor',
    model: 'MDW-C20',
    commercialCode: '10076445',
    description: 'Mini disjuntor MDW Curva C, 20A',
    nominalCurrent: 20,
    voltage: 440,
    price: 18.50
  },
  {
    id: 'weg-mdw-c25',
    manufacturer: 'WEG',
    category: 'disjuntor',
    model: 'MDW-C25',
    commercialCode: '10076446',
    description: 'Mini disjuntor MDW Curva C, 25A',
    nominalCurrent: 25,
    voltage: 440,
    price: 20.50
  },
  {
    id: 'weg-mdw-c32',
    manufacturer: 'WEG',
    category: 'disjuntor',
    model: 'MDW-C32',
    commercialCode: '10076447',
    description: 'Mini disjuntor MDW Curva C, 32A',
    nominalCurrent: 32,
    voltage: 440,
    price: 24.50
  },
  {
    id: 'weg-mdw-c40',
    manufacturer: 'WEG',
    category: 'disjuntor',
    model: 'MDW-C40',
    commercialCode: '10076448',
    description: 'Mini disjuntor MDW Curva C, 40A',
    nominalCurrent: 40,
    voltage: 440,
    price: 32.50
  },

  // Contatores WEG CWM
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
  {
    id: 'weg-cwm12',
    manufacturer: 'WEG',
    category: 'contator',
    model: 'CWM12',
    commercialCode: '10045413',
    description: 'Contator de potência CWM, 12A, AC-3',
    nominalCurrent: 12,
    voltage: 690,
    price: 95.00
  },
  {
    id: 'weg-cwm18',
    manufacturer: 'WEG',
    category: 'contator',
    model: 'CWM18',
    commercialCode: '10045414',
    description: 'Contator de potência CWM, 18A, AC-3',
    nominalCurrent: 18,
    voltage: 690,
    price: 115.00
  },
  {
    id: 'weg-cwm25',
    manufacturer: 'WEG',
    category: 'contator',
    model: 'CWM25',
    commercialCode: '10045415',
    description: 'Contator de potência CWM, 25A, AC-3',
    nominalCurrent: 25,
    voltage: 690,
    price: 145.00
  },
  {
    id: 'weg-cwm32',
    manufacturer: 'WEG',
    category: 'contator',
    model: 'CWM32',
    commercialCode: '10045416',
    description: 'Contator de potência CWM, 32A, AC-3',
    nominalCurrent: 32,
    voltage: 690,
    price: 185.00
  },

  // Relés Térmicos WEG RW27
  {
    id: 'weg-rw27-0d4',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-D004',
    commercialCode: '10046931',
    description: 'Relé de sobrecarga térmico RW27, 0.28-0.4A',
    nominalCurrent: 0.4,
    adjustmentRange: { min: 0.28, max: 0.4 },
    price: 58.00
  },
  {
    id: 'weg-rw27-0d63',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-D006',
    commercialCode: '10046932',
    description: 'Relé de sobrecarga térmico RW27, 0.4-0.63A',
    nominalCurrent: 0.63,
    adjustmentRange: { min: 0.4, max: 0.63 },
    price: 58.00
  },
  {
    id: 'weg-rw27-1',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-D010',
    commercialCode: '10046933',
    description: 'Relé de sobrecarga térmico RW27, 0.63-1A',
    nominalCurrent: 1,
    adjustmentRange: { min: 0.63, max: 1 },
    price: 58.00
  },
  {
    id: 'weg-rw27-1d6',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-D016',
    commercialCode: '10046934',
    description: 'Relé de sobrecarga térmico RW27, 1-1.6A',
    nominalCurrent: 1.6,
    adjustmentRange: { min: 1, max: 1.6 },
    price: 58.00
  },
  {
    id: 'weg-rw27-2d5',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-D025',
    commercialCode: '10046935',
    description: 'Relé de sobrecarga térmico RW27, 1.6-2.5A',
    nominalCurrent: 2.5,
    adjustmentRange: { min: 1.6, max: 2.5 },
    price: 58.00
  },
  {
    id: 'weg-rw27-4',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-D040',
    commercialCode: '10046936',
    description: 'Relé de sobrecarga térmico RW27, 2.8-4A',
    nominalCurrent: 4,
    adjustmentRange: { min: 2.8, max: 4 },
    price: 58.00
  },
  {
    id: 'weg-rw27-6d3',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-D063',
    commercialCode: '10046937',
    description: 'Relé de sobrecarga térmico RW27, 4-6.3A',
    nominalCurrent: 6.3,
    adjustmentRange: { min: 4, max: 6.3 },
    price: 58.00
  },
  {
    id: 'weg-rw27-8',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-D080',
    commercialCode: '10046938',
    description: 'Relé de sobrecarga térmico RW27, 5.6-8A',
    nominalCurrent: 8,
    adjustmentRange: { min: 5.6, max: 8 },
    price: 58.00
  },
  {
    id: 'weg-rw27-10',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-U010',
    commercialCode: '10046944',
    description: 'Relé de sobrecarga térmico RW27, 7-10A',
    nominalCurrent: 10,
    adjustmentRange: { min: 7, max: 10 },
    price: 65.00
  },
  {
    id: 'weg-rw27-12d5',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-U013',
    commercialCode: '10046945',
    description: 'Relé de sobrecarga térmico RW27, 8-12.5A',
    nominalCurrent: 12.5,
    adjustmentRange: { min: 8, max: 12.5 },
    price: 68.00
  },
  {
    id: 'weg-rw27-15',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-U015',
    commercialCode: '10046946',
    description: 'Relé de sobrecarga térmico RW27, 10-15A',
    nominalCurrent: 15,
    adjustmentRange: { min: 10, max: 15 },
    price: 72.00
  },
  {
    id: 'weg-rw27-17',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-U017',
    commercialCode: '10046947',
    description: 'Relé de sobrecarga térmico RW27, 11-17A',
    nominalCurrent: 17,
    adjustmentRange: { min: 11, max: 17 },
    price: 75.00
  },
  {
    id: 'weg-rw27-23',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-U023',
    commercialCode: '10046948',
    description: 'Relé de sobrecarga térmico RW27, 15-23A',
    nominalCurrent: 23,
    adjustmentRange: { min: 15, max: 23 },
    price: 85.00
  },
  {
    id: 'weg-rw27-32',
    manufacturer: 'WEG',
    category: 'releTermico',
    model: 'RW27-1D3-U032',
    commercialCode: '10046949',
    description: 'Relé de sobrecarga térmico RW27, 22-32A',
    nominalCurrent: 32,
    adjustmentRange: { min: 22, max: 32 },
    price: 95.00
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
