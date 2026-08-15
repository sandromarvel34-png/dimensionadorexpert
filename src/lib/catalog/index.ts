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
  { id: 'weg-mdw-c50', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C50', commercialCode: '10076449', description: 'Mini disjuntor MDW Curva C, 50A', nominalCurrent: 50, voltage: 440, price: 45.00 },
  { id: 'weg-mdw-c63', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C63', commercialCode: '10076450', description: 'Mini disjuntor MDW Curva C, 63A', nominalCurrent: 63, voltage: 440, price: 55.00 },
  { id: 'weg-mdw-c80', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C80', commercialCode: '10076451', description: 'Mini disjuntor MDW Curva C, 80A', nominalCurrent: 80, voltage: 440, price: 85.00 },
  { id: 'weg-mdw-c100', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C100', commercialCode: '10076452', description: 'Mini disjuntor MDW Curva C, 100A', nominalCurrent: 100, voltage: 440, price: 120.00 },
  { id: 'weg-mdw-c125', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C125', commercialCode: '10076453', description: 'Mini disjuntor MDW Curva C, 125A', nominalCurrent: 125, voltage: 440, price: 155.00 },

  // Disjuntores Schneider Acti9
  { id: 'schneider-acti9-c6', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C6', commercialCode: 'A9F74106', description: 'Mini disjuntor Acti9 iC60N Curva C, 6A', nominalCurrent: 6, voltage: 440, price: 55.00 },
  { id: 'schneider-acti9-c16', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C16', commercialCode: 'A9F74116', description: 'Mini disjuntor Acti9 iC60N Curva C, 16A', nominalCurrent: 16, voltage: 440, price: 65.00 },
  { id: 'schneider-acti9-c32', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C32', commercialCode: 'A9F74132', description: 'Mini disjuntor Acti9 iC60N Curva C, 32A', nominalCurrent: 32, voltage: 440, price: 85.00 },
  { id: 'schneider-acti9-c40', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C40', commercialCode: 'A9F74140', description: 'Mini disjuntor Acti9 iC60N Curva C, 40A', nominalCurrent: 40, voltage: 440, price: 95.00 },
  { id: 'schneider-acti9-c63', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C63', commercialCode: 'A9F74163', description: 'Mini disjuntor Acti9 iC60N Curva C, 63A', nominalCurrent: 63, voltage: 440, price: 125.00 },


  // Disjuntores Siemens 5SY
  { id: 'siemens-5sy-c6', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6106-7', commercialCode: '5SY6106-7', description: 'Mini disjuntor 5SY6 Curva C, 6A', nominalCurrent: 6, voltage: 440, price: 48.00 },
  { id: 'siemens-5sy-c16', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6116-7', commercialCode: '5SY6116-7', description: 'Mini disjuntor 5SY6 Curva C, 16A', nominalCurrent: 16, voltage: 440, price: 58.00 },
  { id: 'siemens-5sy-c32', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6132-7', commercialCode: '5SY6132-7', description: 'Mini disjuntor 5SY6 Curva C, 32A', nominalCurrent: 32, voltage: 440, price: 78.00 },
  { id: 'siemens-5sy-c40', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6140-7', commercialCode: '5SY6140-7', description: 'Mini disjuntor 5SY6 Curva C, 40A', nominalCurrent: 40, voltage: 440, price: 88.00 },
  { id: 'siemens-5sy-c63', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6163-7', commercialCode: '5SY6163-7', description: 'Mini disjuntor 5SY6 Curva C, 63A', nominalCurrent: 63, voltage: 440, price: 115.00 },


  // Contatores WEG CWM
  { id: 'weg-cwm9', manufacturer: 'WEG', category: 'contator', model: 'CWM9', commercialCode: '10045412', description: 'Contator de potência CWM, 9A, AC-3', nominalCurrent: 9, voltage: 690, price: 85.00 },
  { id: 'weg-cwm12', manufacturer: 'WEG', category: 'contator', model: 'CWM12', commercialCode: '10045413', description: 'Contator de potência CWM, 12A, AC-3', nominalCurrent: 12, voltage: 690, price: 95.00 },
  { id: 'weg-cwm18', manufacturer: 'WEG', category: 'contator', model: 'CWM18', commercialCode: '10045414', description: 'Contator de potência CWM, 18A, AC-3', nominalCurrent: 18, voltage: 690, price: 115.00 },
  { id: 'weg-cwm25', manufacturer: 'WEG', category: 'contator', model: 'CWM25', commercialCode: '10045415', description: 'Contator de potência CWM, 25A, AC-3', nominalCurrent: 25, voltage: 690, price: 145.00 },
  { id: 'weg-cwm32', manufacturer: 'WEG', category: 'contator', model: 'CWM32', commercialCode: '10045416', description: 'Contator de potência CWM, 32A, AC-3', nominalCurrent: 32, voltage: 690, price: 185.00 },
  { id: 'weg-cwm40', manufacturer: 'WEG', category: 'contator', model: 'CWM40', commercialCode: '10045417', description: 'Contator de potência CWM, 40A, AC-3', nominalCurrent: 40, voltage: 690, price: 245.00 },
  { id: 'weg-cwm50', manufacturer: 'WEG', category: 'contator', model: 'CWM50', commercialCode: '10045418', description: 'Contator de potência CWM, 50A, AC-3', nominalCurrent: 50, voltage: 690, price: 325.00 },
  { id: 'weg-cwm65', manufacturer: 'WEG', category: 'contator', model: 'CWM65', commercialCode: '10045419', description: 'Contator de potência CWM, 65A, AC-3', nominalCurrent: 65, voltage: 690, price: 415.00 },
  { id: 'weg-cwm80', manufacturer: 'WEG', category: 'contator', model: 'CWM80', commercialCode: '10045420', description: 'Contator de potência CWM, 80A, AC-3', nominalCurrent: 80, voltage: 690, price: 525.00 },
  { id: 'weg-cwm105', manufacturer: 'WEG', category: 'contator', model: 'CWM105', commercialCode: '10045421', description: 'Contator de potência CWM, 105A, AC-3', nominalCurrent: 105, voltage: 690, price: 685.00 },
  { id: 'weg-cwm150', manufacturer: 'WEG', category: 'contator', model: 'CWM150', commercialCode: '10045422', description: 'Contator de potência CWM, 150A, AC-3', nominalCurrent: 150, voltage: 690, price: 945.00 },
  { id: 'weg-cwm250', manufacturer: 'WEG', category: 'contator', model: 'CWM250', commercialCode: '10045423', description: 'Contator de potência CWM, 250A, AC-3', nominalCurrent: 250, voltage: 690, price: 1450.00 },

  // Contatores Schneider TeSys
  { id: 'schneider-tesys-d9', manufacturer: 'Schneider', category: 'contator', model: 'LC1D09', commercialCode: 'LC1D09M7', description: 'Contator TeSys D, 9A, AC-3', nominalCurrent: 9, voltage: 690, price: 155.00 },
  { id: 'schneider-tesys-d18', manufacturer: 'Schneider', category: 'contator', model: 'LC1D18', commercialCode: 'LC1D18M7', description: 'Contator TeSys D, 18A, AC-3', nominalCurrent: 18, voltage: 690, price: 215.00 },
  { id: 'schneider-tesys-d32', manufacturer: 'Schneider', category: 'contator', model: 'LC1D32', commercialCode: 'LC1D32M7', description: 'Contator TeSys D, 32A, AC-3', nominalCurrent: 32, voltage: 690, price: 285.00 },
  { id: 'schneider-tesys-d40', manufacturer: 'Schneider', category: 'contator', model: 'LC1D40', commercialCode: 'LC1D40M7', description: 'Contator TeSys D, 40A, AC-3', nominalCurrent: 40, voltage: 690, price: 345.00 },
  { id: 'schneider-tesys-d65', manufacturer: 'Schneider', category: 'contator', model: 'LC1D65', commercialCode: 'LC1D65M7', description: 'Contator TeSys D, 65A, AC-3', nominalCurrent: 65, voltage: 690, price: 425.00 },


  // Contatores Siemens Sirius
  { id: 'siemens-sirius-d9', manufacturer: 'Siemens', category: 'contator', model: '3RT2016', commercialCode: '3RT2016-1AB01', description: 'Contator Sirius, 9A, AC-3', nominalCurrent: 9, voltage: 690, price: 145.00 },
  { id: 'siemens-sirius-d18', manufacturer: 'Siemens', category: 'contator', model: '3RT2025', commercialCode: '3RT2025-1AB01', description: 'Contator Sirius, 18A, AC-3', nominalCurrent: 18, voltage: 690, price: 195.00 },
  { id: 'siemens-sirius-d32', manufacturer: 'Siemens', category: 'contator', model: '3RT2027', commercialCode: '3RT2027-1AB01', description: 'Contator Sirius, 32A, AC-3', nominalCurrent: 32, voltage: 690, price: 265.00 },
  { id: 'siemens-sirius-d40', manufacturer: 'Siemens', category: 'contator', model: '3RT2035', commercialCode: '3RT2035-1AB01', description: 'Contator Sirius, 40A, AC-3', nominalCurrent: 40, voltage: 690, price: 325.00 },
  { id: 'siemens-sirius-d65', manufacturer: 'Siemens', category: 'contator', model: '3RT2037', commercialCode: '3RT2037-1AB01', description: 'Contator Sirius, 65A, AC-3', nominalCurrent: 65, voltage: 690, price: 395.00 },


  // Relés Térmicos WEG RW27
  { id: 'weg-rw27-0d4', manufacturer: 'WEG', category: 'releTermico', model: 'RW27-1D3-D004', commercialCode: '10046931', description: 'Relé RW27, 0.28-0.4A', nominalCurrent: 0.4, adjustmentRange: { min: 0.28, max: 0.4 }, price: 58.00 },
  { id: 'weg-rw27-32', manufacturer: 'WEG', category: 'releTermico', model: 'RW27-1D3-U032', commercialCode: '10046949', description: 'Relé RW27, 22-32A', nominalCurrent: 32, adjustmentRange: { min: 22, max: 32 }, price: 95.00 },
  { id: 'weg-rw27-40', manufacturer: 'WEG', category: 'releTermico', model: 'RW27-1D3-U040', commercialCode: '10046950', description: 'Relé RW27, 28-40A', nominalCurrent: 40, adjustmentRange: { min: 28, max: 40 }, price: 115.00 },
  { id: 'weg-rw27-50', manufacturer: 'WEG', category: 'releTermico', model: 'RW27-1D3-U050', commercialCode: '10046951', description: 'Relé RW27, 40-50A', nominalCurrent: 50, adjustmentRange: { min: 40, max: 50 }, price: 145.00 },
  { id: 'weg-rw67-80', manufacturer: 'WEG', category: 'releTermico', model: 'RW67-1D3-U080', commercialCode: '10046952', description: 'Relé RW67, 57-80A', nominalCurrent: 80, adjustmentRange: { min: 57, max: 80 }, price: 285.00 },
  { id: 'weg-rw67-112', manufacturer: 'WEG', category: 'releTermico', model: 'RW67-1D3-U112', commercialCode: '10046953', description: 'Relé RW67, 80-112A', nominalCurrent: 112, adjustmentRange: { min: 80, max: 112 }, price: 345.00 },
  { id: 'weg-rw117-150', manufacturer: 'WEG', category: 'releTermico', model: 'RW117-1D3-U150', commercialCode: '10046954', description: 'Relé RW117, 100-150A', nominalCurrent: 150, adjustmentRange: { min: 100, max: 150 }, price: 485.00 },
  { id: 'weg-rw317-215', manufacturer: 'WEG', category: 'releTermico', model: 'RW317-1D3-U215', commercialCode: '10046955', description: 'Relé RW317, 140-215A', nominalCurrent: 215, adjustmentRange: { min: 140, max: 215 }, price: 825.00 },
  { id: 'weg-rw317-310', manufacturer: 'WEG', category: 'releTermico', model: 'RW317-1D3-U310', commercialCode: '10046956', description: 'Relé RW317, 200-310A', nominalCurrent: 310, adjustmentRange: { min: 200, max: 310 }, price: 985.00 },

  // Relés Térmicos Schneider LRD
  { id: 'schneider-lrd-04', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD04', commercialCode: 'LRD04', description: 'Relé TeSys LRD, 0.4-0.63A', nominalCurrent: 0.63, adjustmentRange: { min: 0.4, max: 0.63 }, price: 110.00 },
  { id: 'schneider-lrd-22', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD22', commercialCode: 'LRD22', description: 'Relé TeSys LRD, 16-24A', nominalCurrent: 24, adjustmentRange: { min: 16, max: 24 }, price: 180.00 },
  { id: 'schneider-lrd-32', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD32', commercialCode: 'LRD32', description: 'Relé TeSys LRD, 23-32A', nominalCurrent: 32, adjustmentRange: { min: 23, max: 32 }, price: 220.00 },
  { id: 'schneider-lrd-33', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD3353', commercialCode: 'LRD3353', description: 'Relé TeSys LRD, 23-32A', nominalCurrent: 32, adjustmentRange: { min: 23, max: 32 }, price: 250.00 },
  { id: 'schneider-lrd-3355', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD3355', commercialCode: 'LRD3355', description: 'Relé TeSys LRD, 30-40A', nominalCurrent: 40, adjustmentRange: { min: 30, max: 40 }, price: 280.00 },
  { id: 'schneider-lrd-3357', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD3357', commercialCode: 'LRD3357', description: 'Relé TeSys LRD, 37-50A', nominalCurrent: 50, adjustmentRange: { min: 37, max: 50 }, price: 310.00 },
  { id: 'schneider-lrd-3359', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD3359', commercialCode: 'LRD3359', description: 'Relé TeSys LRD, 48-65A', nominalCurrent: 65, adjustmentRange: { min: 48, max: 65 }, price: 350.00 },
  { id: 'schneider-lrd-3361', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD3361', commercialCode: 'LRD3361', description: 'Relé TeSys LRD, 55-70A', nominalCurrent: 70, adjustmentRange: { min: 55, max: 70 }, price: 390.00 },
  { id: 'schneider-lrd-3363', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD3363', commercialCode: 'LRD3363', description: 'Relé TeSys LRD, 63-80A', nominalCurrent: 80, adjustmentRange: { min: 63, max: 80 }, price: 440.00 },
  { id: 'schneider-lrd-3365', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD3365', commercialCode: 'LRD3365', description: 'Relé TeSys LRD, 80-104A', nominalCurrent: 104, adjustmentRange: { min: 80, max: 104 }, price: 520.00 },

  // Relés Térmicos Siemens Sirius 3RU
  { id: 'siemens-3ru-04', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2116-0GB0', commercialCode: '3RU2116-0GB0', description: 'Relé Sirius, 0.45-0.63A', nominalCurrent: 0.63, adjustmentRange: { min: 0.45, max: 0.63 }, price: 98.00 },
  { id: 'siemens-3ru-22', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2126-4CB0', commercialCode: '3RU2126-4CB0', description: 'Relé Sirius, 17-22A', nominalCurrent: 22, adjustmentRange: { min: 17, max: 22 }, price: 165.00 },
  { id: 'siemens-3ru-32', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2126-4EB0', commercialCode: '3RU2126-4EB0', description: 'Relé Sirius, 27-32A', nominalCurrent: 32, adjustmentRange: { min: 27, max: 32 }, price: 210.00 },
  { id: 'siemens-3ru-40', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2126-4FB0', commercialCode: '3RU2126-4FB0', description: 'Relé Sirius, 34-40A', nominalCurrent: 40, adjustmentRange: { min: 34, max: 40 }, price: 240.00 },
  { id: 'siemens-3ru-50', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2136-4HB0', commercialCode: '3RU2136-4HB0', description: 'Relé Sirius, 36-50A', nominalCurrent: 50, adjustmentRange: { min: 36, max: 50 }, price: 310.00 },
  { id: 'siemens-3ru-65', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2136-4JB0', commercialCode: '3RU2136-4JB0', description: 'Relé Sirius, 45-63A', nominalCurrent: 63, adjustmentRange: { min: 45, max: 63 }, price: 380.00 },
  { id: 'siemens-3ru-80', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2136-4KB0', commercialCode: '3RU2136-4KB0', description: 'Relé Sirius, 57-80A', nominalCurrent: 80, adjustmentRange: { min: 57, max: 80 }, price: 450.00 },
  { id: 'siemens-3ru-100', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2146-4LB0', commercialCode: '3RU2146-4LB0', description: 'Relé Sirius, 70-90A', nominalCurrent: 90, adjustmentRange: { min: 70, max: 90 }, price: 580.00 },
  { id: 'siemens-3ru-125', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2146-4MB0', commercialCode: '3RU2146-4MB0', description: 'Relé Sirius, 80-100A', nominalCurrent: 100, adjustmentRange: { min: 80, max: 100 }, price: 650.00 },
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
