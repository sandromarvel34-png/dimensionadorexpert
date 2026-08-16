import { 
  ManufacturerProduct 
} from '../../types';

export const MANUFACTURER_CATALOG: ManufacturerProduct[] = [
  // Disjuntores Motores WEG MPW
  { id: 'weg-mpw18-10', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW18-3-U010', commercialCode: '12428135', description: 'Disjuntor Motor MPW18, 6.3-10A', nominalCurrent: 10, adjustmentRange: { min: 6.3, max: 10 }, voltage: 690, price: 185.00 },
  { id: 'weg-mpw18-16', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW18-3-U016', commercialCode: '12428136', description: 'Disjuntor Motor MPW18, 10-16A', nominalCurrent: 16, adjustmentRange: { min: 10, max: 16 }, voltage: 690, price: 195.00 },
  { id: 'weg-mpw18-20', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW18-3-U020', commercialCode: '12428137', description: 'Disjuntor Motor MPW18, 16-20A', nominalCurrent: 20, adjustmentRange: { min: 16, max: 20 }, voltage: 690, price: 215.00 },
  { id: 'weg-mpw40-25', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW40-3-U025', commercialCode: '12428138', description: 'Disjuntor Motor MPW40, 20-25A', nominalCurrent: 25, adjustmentRange: { min: 20, max: 25 }, voltage: 690, price: 245.00 },
  { id: 'weg-mpw40-32', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW40-3-U032', commercialCode: '12428139', description: 'Disjuntor Motor MPW40, 25-32A', nominalCurrent: 32, adjustmentRange: { min: 25, max: 32 }, voltage: 690, price: 285.00 },

  // Fusíveis WEG Diazed e NH
  { id: 'weg-fd-16', manufacturer: 'WEG', category: 'fusivel', model: 'F D-16', commercialCode: '10000001', description: 'Fusível Diazed retardado, 16A', nominalCurrent: 16, voltage: 500, price: 12.00 },
  { id: 'weg-fd-25', manufacturer: 'WEG', category: 'fusivel', model: 'F D-25', commercialCode: '10000002', description: 'Fusível Diazed retardado, 25A', nominalCurrent: 25, voltage: 500, price: 14.00 },
  { id: 'weg-fnh00-63', manufacturer: 'WEG', category: 'fusivel', model: 'F NH00-63', commercialCode: '10000003', description: 'Fusível NH tamanho 00 retardado, 63A', nominalCurrent: 63, voltage: 500, price: 45.00 },
  { id: 'weg-fnh1-100', manufacturer: 'WEG', category: 'fusivel', model: 'F NH1-100', commercialCode: '10000004', description: 'Fusível NH tamanho 1 retardado, 100A', nominalCurrent: 100, voltage: 500, price: 85.00 },

  // Soft-Starters e Inversores WEG
  { id: 'weg-ssw05-16', manufacturer: 'WEG', category: 'softStarter', model: 'SSW05-16A', commercialCode: '10000005', description: 'Soft-Starter SSW05, 16A', nominalCurrent: 16, price: 850.00 },
  { id: 'weg-ssw05-30', manufacturer: 'WEG', category: 'softStarter', model: 'SSW05-30A', commercialCode: '10000007', description: 'Soft-Starter SSW05, 30A', nominalCurrent: 30, price: 1150.00 },
  { id: 'weg-ssw05-45', manufacturer: 'WEG', category: 'softStarter', model: 'SSW05-45A', commercialCode: '10000008', description: 'Soft-Starter SSW05, 45A', nominalCurrent: 45, price: 1450.00 },
  { id: 'weg-ssw05-60', manufacturer: 'WEG', category: 'softStarter', model: 'SSW05-60A', commercialCode: '10000009', description: 'Soft-Starter SSW05, 60A', nominalCurrent: 60, price: 1850.00 },
  { id: 'weg-cfw300-15', manufacturer: 'WEG', category: 'inverter', model: 'CFW300-15A', commercialCode: '10000006', description: 'Inversor de Frequência CFW300, 15.2A', nominalCurrent: 15.2, price: 1200.00 },
  { id: 'weg-cfw300-24', manufacturer: 'WEG', category: 'inverter', model: 'CFW300-24A', commercialCode: '10000010', description: 'Inversor de Frequência CFW300, 24A', nominalCurrent: 24, price: 1600.00 },
  { id: 'weg-cfw300-33', manufacturer: 'WEG', category: 'inverter', model: 'CFW300-33A', commercialCode: '10000011', description: 'Inversor de Frequência CFW300, 33A', nominalCurrent: 33, price: 2100.00 },

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
  { id: 'schneider-acti9-c10', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C10', commercialCode: 'A9F74110', description: 'Mini disjuntor Acti9 iC60N Curva C, 10A', nominalCurrent: 10, voltage: 440, price: 58.00 },
  { id: 'schneider-acti9-c16', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C16', commercialCode: 'A9F74116', description: 'Mini disjuntor Acti9 iC60N Curva C, 16A', nominalCurrent: 16, voltage: 440, price: 65.00 },
  { id: 'schneider-acti9-c20', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C20', commercialCode: 'A9F74120', description: 'Mini disjuntor Acti9 iC60N Curva C, 20A', nominalCurrent: 20, voltage: 440, price: 72.00 },
  { id: 'schneider-acti9-c25', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C25', commercialCode: 'A9F74125', description: 'Mini disjuntor Acti9 iC60N Curva C, 25A', nominalCurrent: 25, voltage: 440, price: 78.00 },
  { id: 'schneider-acti9-c32', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C32', commercialCode: 'A9F74132', description: 'Mini disjuntor Acti9 iC60N Curva C, 32A', nominalCurrent: 32, voltage: 440, price: 85.00 },
  { id: 'schneider-acti9-c40', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C40', commercialCode: 'A9F74140', description: 'Mini disjuntor Acti9 iC60N Curva C, 40A', nominalCurrent: 40, voltage: 440, price: 95.00 },
  { id: 'schneider-acti9-c50', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C50', commercialCode: 'A9F74150', description: 'Mini disjuntor Acti9 iC60N Curva C, 50A', nominalCurrent: 50, voltage: 440, price: 110.00 },
  { id: 'schneider-acti9-c63', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C63', commercialCode: 'A9F74163', description: 'Mini disjuntor Acti9 iC60N Curva C, 63A', nominalCurrent: 63, voltage: 440, price: 125.00 },
  { id: 'schneider-acti9-c80', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C80', commercialCode: 'A9F74180', description: 'Mini disjuntor Acti9 iC60N Curva C, 80A', nominalCurrent: 80, voltage: 440, price: 180.00 },
  { id: 'schneider-acti9-c100', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C100', commercialCode: 'A9F74191', description: 'Mini disjuntor Acti9 iC60N Curva C, 100A', nominalCurrent: 100, voltage: 440, price: 220.00 },
  { id: 'schneider-acti9-c125', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C125', commercialCode: 'A9F74192', description: 'Mini disjuntor Acti9 iC60N Curva C, 125A', nominalCurrent: 125, voltage: 440, price: 260.00 },


  // Disjuntores Siemens 5SY
  { id: 'siemens-5sy-c6', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6106-7', commercialCode: '5SY6106-7', description: 'Mini disjuntor 5SY6 Curva C, 6A', nominalCurrent: 6, voltage: 440, price: 48.00 },
  { id: 'siemens-5sy-c10', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6110-7', commercialCode: '5SY6110-7', description: 'Mini disjuntor 5SY6 Curva C, 10A', nominalCurrent: 10, voltage: 440, price: 52.00 },
  { id: 'siemens-5sy-c16', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6116-7', commercialCode: '5SY6116-7', description: 'Mini disjuntor 5SY6 Curva C, 16A', nominalCurrent: 16, voltage: 440, price: 58.00 },
  { id: 'siemens-5sy-c20', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6120-7', commercialCode: '5SY6120-7', description: 'Mini disjuntor 5SY6 Curva C, 20A', nominalCurrent: 20, voltage: 440, price: 65.00 },
  { id: 'siemens-5sy-c25', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6125-7', commercialCode: '5SY6125-7', description: 'Mini disjuntor 5SY6 Curva C, 25A', nominalCurrent: 25, voltage: 440, price: 72.00 },
  { id: 'siemens-5sy-c32', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6132-7', commercialCode: '5SY6132-7', description: 'Mini disjuntor 5SY6 Curva C, 32A', nominalCurrent: 32, voltage: 440, price: 78.00 },
  { id: 'siemens-5sy-c40', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6140-7', commercialCode: '5SY6140-7', description: 'Mini disjuntor 5SY6 Curva C, 40A', nominalCurrent: 40, voltage: 440, price: 88.00 },
  { id: 'siemens-5sy-c50', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6150-7', commercialCode: '5SY6150-7', description: 'Mini disjuntor 5SY6 Curva C, 50A', nominalCurrent: 50, voltage: 440, price: 105.00 },
  { id: 'siemens-5sy-c63', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6163-7', commercialCode: '5SY6163-7', description: 'Mini disjuntor 5SY6 Curva C, 63A', nominalCurrent: 63, voltage: 440, price: 115.00 },
  { id: 'siemens-5sy-c80', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6180-7', commercialCode: '5SY6180-7', description: 'Mini disjuntor 5SY6 Curva C, 80A', nominalCurrent: 80, voltage: 440, price: 165.00 },
  { id: 'siemens-5sy-c100', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6191-7', commercialCode: '5SY6191-7', description: 'Mini disjuntor 5SY6 Curva C, 100A', nominalCurrent: 100, voltage: 440, price: 195.00 },
  { id: 'siemens-5sy-c125', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6192-7', commercialCode: '5SY6192-7', description: 'Mini disjuntor 5SY6 Curva C, 125A', nominalCurrent: 125, voltage: 440, price: 235.00 },


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
  { id: 'schneider-tesys-d12', manufacturer: 'Schneider', category: 'contator', model: 'LC1D12', commercialCode: 'LC1D12M7', description: 'Contator TeSys D, 12A, AC-3', nominalCurrent: 12, voltage: 690, price: 185.00 },
  { id: 'schneider-tesys-d18', manufacturer: 'Schneider', category: 'contator', model: 'LC1D18', commercialCode: 'LC1D18M7', description: 'Contator TeSys D, 18A, AC-3', nominalCurrent: 18, voltage: 690, price: 215.00 },
  { id: 'schneider-tesys-d25', manufacturer: 'Schneider', category: 'contator', model: 'LC1D25', commercialCode: 'LC1D25M7', description: 'Contator TeSys D, 25A, AC-3', nominalCurrent: 25, voltage: 690, price: 245.00 },
  { id: 'schneider-tesys-d32', manufacturer: 'Schneider', category: 'contator', model: 'LC1D32', commercialCode: 'LC1D32M7', description: 'Contator TeSys D, 32A, AC-3', nominalCurrent: 32, voltage: 690, price: 285.00 },
  { id: 'schneider-tesys-d40', manufacturer: 'Schneider', category: 'contator', model: 'LC1D40', commercialCode: 'LC1D40M7', description: 'Contator TeSys D, 40A, AC-3', nominalCurrent: 40, voltage: 690, price: 345.00 },
  { id: 'schneider-tesys-d50', manufacturer: 'Schneider', category: 'contator', model: 'LC1D50', commercialCode: 'LC1D50M7', description: 'Contator TeSys D, 50A, AC-3', nominalCurrent: 50, voltage: 690, price: 395.00 },
  { id: 'schneider-tesys-d65', manufacturer: 'Schneider', category: 'contator', model: 'LC1D65', commercialCode: 'LC1D65M7', description: 'Contator TeSys D, 65A, AC-3', nominalCurrent: 65, voltage: 690, price: 425.00 },
  { id: 'schneider-tesys-d80', manufacturer: 'Schneider', category: 'contator', model: 'LC1D80', commercialCode: 'LC1D80M7', description: 'Contator TeSys D, 80A, AC-3', nominalCurrent: 80, voltage: 690, price: 545.00 },
  { id: 'schneider-tesys-d95', manufacturer: 'Schneider', category: 'contator', model: 'LC1D95', commercialCode: 'LC1D95M7', description: 'Contator TeSys D, 95A, AC-3', nominalCurrent: 95, voltage: 690, price: 685.00 },
  { id: 'schneider-tesys-d115', manufacturer: 'Schneider', category: 'contator', model: 'LC1D115', commercialCode: 'LC1D115M7', description: 'Contator TeSys D, 115A, AC-3', nominalCurrent: 115, voltage: 690, price: 895.00 },
  { id: 'schneider-tesys-d150', manufacturer: 'Schneider', category: 'contator', model: 'LC1D150', commercialCode: 'LC1D150M7', description: 'Contator TeSys D, 150A, AC-3', nominalCurrent: 150, voltage: 690, price: 1150.00 },


  // Contatores Siemens Sirius
  { id: 'siemens-sirius-d9', manufacturer: 'Siemens', category: 'contator', model: '3RT2016', commercialCode: '3RT2016-1AB01', description: 'Contator Sirius, 9A, AC-3', nominalCurrent: 9, voltage: 690, price: 145.00 },
  { id: 'siemens-sirius-d12', manufacturer: 'Siemens', category: 'contator', model: '3RT2017', commercialCode: '3RT2017-1AB01', description: 'Contator Sirius, 12A, AC-3', nominalCurrent: 12, voltage: 690, price: 175.00 },
  { id: 'siemens-sirius-d18', manufacturer: 'Siemens', category: 'contator', model: '3RT2025', commercialCode: '3RT2025-1AB01', description: 'Contator Sirius, 18A, AC-3', nominalCurrent: 18, voltage: 690, price: 195.00 },
  { id: 'siemens-sirius-d25', manufacturer: 'Siemens', category: 'contator', model: '3RT2026', commercialCode: '3RT2026-1AB01', description: 'Contator Sirius, 25A, AC-3', nominalCurrent: 25, voltage: 690, price: 225.00 },
  { id: 'siemens-sirius-d32', manufacturer: 'Siemens', category: 'contator', model: '3RT2027', commercialCode: '3RT2027-1AB01', description: 'Contator Sirius, 32A, AC-3', nominalCurrent: 32, voltage: 690, price: 265.00 },
  { id: 'siemens-sirius-d40', manufacturer: 'Siemens', category: 'contator', model: '3RT2035', commercialCode: '3RT2035-1AB01', description: 'Contator Sirius, 40A, AC-3', nominalCurrent: 40, voltage: 690, price: 325.00 },
  { id: 'siemens-sirius-d50', manufacturer: 'Siemens', category: 'contator', model: '3RT2036', commercialCode: '3RT2036-1AB01', description: 'Contator Sirius, 50A, AC-3', nominalCurrent: 50, voltage: 690, price: 365.00 },
  { id: 'siemens-sirius-d65', manufacturer: 'Siemens', category: 'contator', model: '3RT2037', commercialCode: '3RT2037-1AB01', description: 'Contator Sirius, 65A, AC-3', nominalCurrent: 65, voltage: 690, price: 395.00 },
  { id: 'siemens-sirius-d80', manufacturer: 'Siemens', category: 'contator', model: '3RT2038', commercialCode: '3RT2038-1AB01', description: 'Contator Sirius, 80A, AC-3', nominalCurrent: 80, voltage: 690, price: 495.00 },
  { id: 'siemens-sirius-d95', manufacturer: 'Siemens', category: 'contator', model: '3RT2046', commercialCode: '3RT2046-1AB01', description: 'Contator Sirius, 95A, AC-3', nominalCurrent: 95, voltage: 690, price: 625.00 },
  { id: 'siemens-sirius-d115', manufacturer: 'Siemens', category: 'contator', model: '3RT2047', commercialCode: '3RT2047-1AB01', description: 'Contator Sirius, 115A, AC-3', nominalCurrent: 115, voltage: 690, price: 845.00 },
  { id: 'siemens-sirius-d150', manufacturer: 'Siemens', category: 'contator', model: '3RT1056', commercialCode: '3RT1056-6AF36', description: 'Contator Sirius, 150A, AC-3', nominalCurrent: 150, voltage: 690, price: 1050.00 },


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
  { id: 'siemens-3ru-10', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2116-1JB0', commercialCode: '3RU2116-1JB0', description: 'Relé Sirius, 7-10A', nominalCurrent: 10, adjustmentRange: { min: 7, max: 10 }, price: 125.00 },
  { id: 'siemens-3ru-16', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2116-4AB0', commercialCode: '3RU2116-4AB0', description: 'Relé Sirius, 11-16A', nominalCurrent: 16, adjustmentRange: { min: 11, max: 16 }, price: 145.00 },
  { id: 'siemens-3ru-22', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2126-4CB0', commercialCode: '3RU2126-4CB0', description: 'Relé Sirius, 17-22A', nominalCurrent: 22, adjustmentRange: { min: 17, max: 22 }, price: 165.00 },
  { id: 'siemens-3ru-25', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2126-4DB0', commercialCode: '3RU2126-4DB0', description: 'Relé Sirius, 20-25A', nominalCurrent: 25, adjustmentRange: { min: 20, max: 25 }, price: 185.00 },
  { id: 'siemens-3ru-32', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2126-4EB0', commercialCode: '3RU2126-4EB0', description: 'Relé Sirius, 27-32A', nominalCurrent: 32, adjustmentRange: { min: 27, max: 32 }, price: 210.00 },
  { id: 'siemens-3ru-40', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2126-4FB0', commercialCode: '3RU2126-4FB0', description: 'Relé Sirius, 34-40A', nominalCurrent: 40, adjustmentRange: { min: 34, max: 40 }, price: 240.00 },
  { id: 'siemens-3ru-50', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2136-4HB0', commercialCode: '3RU2136-4HB0', description: 'Relé Sirius, 36-50A', nominalCurrent: 50, adjustmentRange: { min: 36, max: 50 }, price: 310.00 },
  { id: 'siemens-3ru-65', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2136-4JB0', commercialCode: '3RU2136-4JB0', description: 'Relé Sirius, 45-63A', nominalCurrent: 63, adjustmentRange: { min: 45, max: 63 }, price: 380.00 },
  { id: 'siemens-3ru-80', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2136-4KB0', commercialCode: '3RU2136-4KB0', description: 'Relé Sirius, 57-80A', nominalCurrent: 80, adjustmentRange: { min: 57, max: 80 }, price: 450.00 },
  { id: 'siemens-3ru-100', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2146-4LB0', commercialCode: '3RU2146-4LB0', description: 'Relé Sirius, 70-90A', nominalCurrent: 90, adjustmentRange: { min: 70, max: 90 }, price: 580.00 },
  { id: 'siemens-3ru-125', manufacturer: 'Siemens', category: 'releTermico', model: '3RU2146-4MB0', commercialCode: '3RU2146-4MB0', description: 'Relé Sirius, 80-100A', nominalCurrent: 100, adjustmentRange: { min: 80, max: 100 }, price: 650.00 },
  // Itens adicionais para motores de até 100cv (Correntes nominais até ~300A em 220V)
  { id: 'weg-mdw-c125-fixed', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C125', commercialCode: '10076453', description: 'Mini disjuntor MDW Curva C, 125A', nominalCurrent: 125, voltage: 440, price: 155.00 },
  { id: 'schneider-acti9-c125-fixed', manufacturer: 'Schneider', category: 'disjuntor', model: 'iC60N-C125', commercialCode: 'A9F74192', description: 'Mini disjuntor Acti9 iC60N Curva C, 125A', nominalCurrent: 125, voltage: 440, price: 260.00 },
  { id: 'siemens-5sy-c125-fixed', manufacturer: 'Siemens', category: 'disjuntor', model: '5SY6125-7', commercialCode: '5SY6125-7', description: 'Mini disjuntor 5SY6 Curva C, 125A', nominalCurrent: 125, voltage: 440, price: 235.00 },
  
  // Contatores de Alta Potência (Linha CWM / TeSys / Sirius)
  { id: 'weg-cwm300', manufacturer: 'WEG', category: 'contator', model: 'CWM300', commercialCode: '10045424', description: 'Contator de potência CWM, 300A, AC-3', nominalCurrent: 300, voltage: 690, price: 1850.00 },
  { id: 'schneider-tesys-d225', manufacturer: 'Schneider', category: 'contator', model: 'LC1D225', commercialCode: 'LC1D225M7', description: 'Contator TeSys D, 225A, AC-3', nominalCurrent: 225, voltage: 690, price: 1550.00 },
  { id: 'siemens-sirius-d225', manufacturer: 'Siemens', category: 'contator', model: '3RT1064', commercialCode: '3RT1064-6AF36', description: 'Contator Sirius, 225A, AC-3', nominalCurrent: 225, voltage: 690, price: 1450.00 },

  // Disjuntores de Caixa Moldada (Acima de 125A)
  { id: 'weg-dwb160', manufacturer: 'WEG', category: 'disjuntor', model: 'DWB160', commercialCode: '10045678', description: 'Disjuntor Caixa Moldada DWB160, 160A', nominalCurrent: 160, voltage: 440, price: 450.00 },
  { id: 'weg-dwb250', manufacturer: 'WEG', category: 'disjuntor', model: 'DWB250', commercialCode: '10045679', description: 'Disjuntor Caixa Moldada DWB250, 250A', nominalCurrent: 250, voltage: 440, price: 650.00 },
  { id: 'weg-dwb400', manufacturer: 'WEG', category: 'disjuntor', model: 'DWB400', commercialCode: '10045680', description: 'Disjuntor Caixa Moldada DWB400, 400A', nominalCurrent: 400, voltage: 440, price: 950.00 },

  { id: 'schneider-nsx160', manufacturer: 'Schneider', category: 'disjuntor', model: 'NSX160', commercialCode: 'NSX160N', description: 'Disjuntor Compact NSX160, 160A', nominalCurrent: 160, voltage: 440, price: 680.00 },
  { id: 'schneider-nsx250', manufacturer: 'Schneider', category: 'disjuntor', model: 'NSX250', commercialCode: 'NSX250N', description: 'Disjuntor Compact NSX250, 250A', nominalCurrent: 250, voltage: 440, price: 880.00 },
  { id: 'schneider-nsx400', manufacturer: 'Schneider', category: 'disjuntor', model: 'NSX400', commercialCode: 'NSX400N', description: 'Disjuntor Compact NSX400, 400A', nominalCurrent: 400, voltage: 440, price: 1280.00 },

  { id: 'siemens-3va160', manufacturer: 'Siemens', category: 'disjuntor', model: '3VA160', commercialCode: '3VA160', description: 'Disjuntor 3VA1, 160A', nominalCurrent: 160, voltage: 440, price: 580.00 },
  { id: 'siemens-3va250', manufacturer: 'Siemens', category: 'disjuntor', model: '3VA250', commercialCode: '3VA250', description: 'Disjuntor 3VA1, 250A', nominalCurrent: 250, voltage: 440, price: 780.00 },
  { id: 'siemens-3va400', manufacturer: 'Siemens', category: 'disjuntor', model: '3VA400', commercialCode: '3VA400', description: 'Disjuntor 3VA1, 400A', nominalCurrent: 400, voltage: 440, price: 1180.00 },

  // Relés de Tempo WEG RTW
  { id: 'weg-rtw-1', manufacturer: 'WEG', category: 'releTempo', model: 'RTW-ET', commercialCode: '10045600', description: 'Relé de tempo eletrônico RTW Estrela-Triângulo', nominalCurrent: 0, price: 75.00 },
  
  // Relés de Tempo Schneider RE17
  { id: 'schneider-re17-1', manufacturer: 'Schneider', category: 'releTempo', model: 'RE17RMMW', commercialCode: 'RE17RMMW', description: 'Relé de tempo modular TeSys', nominalCurrent: 0, price: 125.00 },

  // Relés de Tempo Siemens Sirius 3RP
  { id: 'siemens-3rp-1', manufacturer: 'Siemens', category: 'releTempo', model: '3RP25', commercialCode: '3RP25', description: 'Relé de tempo Sirius', nominalCurrent: 0, price: 115.00 },
];

export const getProductsByCategory = (category: string) => 
  MANUFACTURER_CATALOG.filter(p => p.category === category);

export const findCompatibleProducts = (
  category: string, 
  current: number,
  manufacturer?: string
): ManufacturerProduct[] => {
  const mfr = (manufacturer === 'any' || !manufacturer) ? undefined : manufacturer;
  
  const filtered = MANUFACTURER_CATALOG.filter(p => 
    p.category === category && 
    (mfr ? p.manufacturer.toLowerCase() === mfr.toLowerCase() : true)
  );

  if (category === 'releTermico') {
    return filtered.filter(p => 
      (p.adjustmentRange && current >= p.adjustmentRange.min && current <= p.adjustmentRange.max) ||
      (p.nominalCurrent && p.nominalCurrent >= current)
    ).sort((a, b) => (a.nominalCurrent || 0) - (b.nominalCurrent || 0));
  } else if (category === 'releTempo' || category === 'auxiliar') {
    return filtered;
  } else {
    return filtered
      .filter(p => p.nominalCurrent && p.nominalCurrent >= current)
      .sort((a, b) => (a.nominalCurrent || 0) - (b.nominalCurrent || 0));
  }
};

export const findCompatibleProduct = (
  category: string, 
  current: number, 
  manufacturer?: string
) => {
  const products = findCompatibleProducts(category, current, manufacturer);
  return products.length > 0 ? products[0] : null;
};
