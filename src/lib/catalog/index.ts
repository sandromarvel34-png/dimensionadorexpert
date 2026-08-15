import { 
  ManufacturerProduct 
} from '../../types';

export const MANUFACTURER_CATALOG: ManufacturerProduct[] = [
  // Disjuntores WEG MDW
  { id: 'weg-mdw-c6', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C6', commercialCode: '10076440', description: 'Mini disjuntor MDW Curva C, 6A', nominalCurrent: 6, voltage: 440, price: 14.50 },
  { id: 'weg-mdw-c10', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C10', commercialCode: '10076442', description: 'Mini disjuntor MDW Curva C, 10A', nominalCurrent: 10, voltage: 440, price: 15.50 },
  { id: 'weg-mdw-c16', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C16', commercialCode: '10076444', description: 'Mini disjuntor MDW Curva C, 16A', nominalCurrent: 16, voltage: 440, price: 16.50 },
  { id: 'weg-mdw-c20', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C20', commercialCode: '10076445', description: 'Mini disjuntor MDW Curva C, 20A', nominalCurrent: 20, voltage: 440, price: 18.50 },
  { id: 'weg-mdw-c25', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C25', commercialCode: '10076446', description: 'Mini disjuntor MDW Curva C, 25A', nominalCurrent: 25, voltage: 440, price: 20.50 },
  { id: 'weg-mdw-c32', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C32', commercialCode: '10076447', description: 'Mini disjuntor MDW Curva C, 32A', nominalCurrent: 32, voltage: 440, price: 24.50 },
  { id: 'weg-mdw-c40', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C40', commercialCode: '10076448', description: 'Mini disjuntor MDW Curva C, 40A', nominalCurrent: 40, voltage: 440, price: 32.50 },

  // Disjuntores Schneider Acti9
  { id: 'schneider-acti9-c6', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C6', commercialCode: 'A9F74106', description: 'Mini disjuntor Acti9 iC60N Curva C, 6A', nominalCurrent: 6, voltage: 440, price: 55.00 },
  { id: 'schneider-acti9-c16', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C16', commercialCode: 'A9F74116', description: 'Mini disjuntor Acti9 iC60N Curva C, 16A', nominalCurrent: 16, voltage: 440, price: 65.00 },
  { id: 'schneider-acti9-c32', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C32', commercialCode: 'A9F74132', description: 'Mini disjuntor Acti9 iC60N Curva C, 32A', nominalCurrent: 32, voltage: 440, price: 85.00 },

  // Disjuntores Siemens 5SY
  { id: 'siemens-5sy-c6', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6106-7', commercialCode: '5SY6106-7', description: 'Mini disjuntor 5SY6 Curva C, 6A', nominalCurrent: 6, voltage: 440, price: 48.00 },
  { id: 'siemens-5sy-c16', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6116-7', commercialCode: '5SY6116-7', description: 'Mini disjuntor 5SY6 Curva C, 16A', nominalCurrent: 16, voltage: 440, price: 58.00 },
  { id: 'siemens-5sy-c32', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6132-7', commercialCode: '5SY6132-7', description: 'Mini disjuntor 5SY6 Curva C, 32A', nominalCurrent: 32, voltage: 440, price: 78.00 },

  // Contatores WEG CWM
  { id: 'weg-cwm9', manufacturer: 'WEG', category: 'contator', model: 'CWM9', commercialCode: '10045412', description: 'Contator de potência CWM, 9A, AC-3', nominalCurrent: 9, voltage: 690, price: 85.00 },
  { id: 'weg-cwm12', manufacturer: 'WEG', category: 'contator', model: 'CWM12', commercialCode: '10045413', description: 'Contator de potência CWM, 12A, AC-3', nominalCurrent: 12, voltage: 690, price: 95.00 },
  { id: 'weg-cwm18', manufacturer: 'WEG', category: 'contator', model: 'CWM18', commercialCode: '10045414', description: 'Contator de potência CWM, 18A, AC-3', nominalCurrent: 18, voltage: 690, price: 115.00 },
  { id: 'weg-cwm25', manufacturer: 'WEG', category: 'contator', model: 'CWM25', commercialCode: '10045415', description: 'Contator de potência CWM, 25A, AC-3', nominalCurrent: 25, voltage: 690, price: 145.00 },
  { id: 'weg-cwm32', manufacturer: 'WEG', category: 'contator', model: 'CWM32', commercialCode: '10045416', description: 'Contator de potência CWM, 32A, AC-3', nominalCurrent: 32, voltage: 690, price: 185.00 },

  // Contatores Schneider TeSys
  { id: 'schneider-tesys-d9', manufacturer: 'Schneider', category: 'contator', model: 'LC1D09', commercialCode: 'LC1D09M7', description: 'Contator TeSys D, 9A, AC-3', nominalCurrent: 9, voltage: 690, price: 155.00 },
  { id: 'schneider-tesys-d18', manufacturer: 'Schneider', category: 'contator', model: 'LC1D18', commercialCode: 'LC1D18M7', description: 'Contator TeSys D, 18A, AC-3', nominalCurrent: 18, voltage: 690, price: 215.00 },
  { id: 'schneider-tesys-d32', manufacturer: 'Schneider', category: 'contator', model: 'LC1D32', commercialCode: 'LC1D32M7', description: 'Contator TeSys D, 32A, AC-3', nominalCurrent: 32, voltage: 690, price: 285.00 },

  // Contatores Siemens Sirius
  { id: 'siemens-sirius-d9', manufacturer: 'Siemens', category: 'contator', model: '3RT2016', commercialCode: '3RT2016-1AB01', description: 'Contator Sirius, 9A, AC-3', nominalCurrent: 9, voltage: 690, price: 145.00 },
  { id: 'siemens-sirius-d18', manufacturer: 'Siemens', category: 'contator', model: '3RT2025', commercialCode: '3RT2025-1AB01', description: 'Contator Sirius, 18A, AC-3', nominalCurrent: 18, voltage: 690, price: 195.00 },
  { id: 'siemens-sirius-d32', manufacturer: 'Siemens', category: 'contator', model: '3RT2027', commercialCode: '3RT2027-1AB01', description: 'Contator Sirius, 32A, AC-3', nominalCurrent: 32, voltage: 690, price: 265.00 },

  // Relés Térmicos WEG RW27
  { id: 'weg-rw27-0d4', manufacturer: 'WEG', category: 'releTermico', model: 'RW27-1D3-D004', commercialCode: '10046931', description: 'Relé RW27, 0.28-0.4A', nominalCurrent: 0.4, adjustmentRange: { min: 0.28, max: 0.4 }, price: 58.00 },
  { id: 'weg-rw27-32', manufacturer: 'WEG', category: 'releTermico', model: 'RW27-1D3-U032', commercialCode: '10046949', description: 'Relé RW27, 22-32A', nominalCurrent: 32, adjustmentRange: { min: 22, max: 32 }, price: 95.00 }
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
