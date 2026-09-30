import { 
  ManufacturerProduct 
} from '../../types';

const RAW_MANUFACTURER_CATALOG: ManufacturerProduct[] = [
  // Disjuntores Motores WEG MPW
  { id: 'weg-mpw18-10', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW18-3-U010', commercialCode: '12429372', description: 'Disjuntor-motor MPW18, 6,3-10 A', nominalCurrent: 10, adjustmentRange: { min: 6.3, max: 10 }, voltage: 690, poles: 3, utilizationCategory: 'AC-3', price: 185.00 },
  { id: 'weg-mpw18-16', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW18-3-U016', commercialCode: '12429373', description: 'Disjuntor-motor MPW18, 10-16 A', nominalCurrent: 16, adjustmentRange: { min: 10, max: 16 }, voltage: 690, poles: 3, utilizationCategory: 'AC-3', price: 195.00 },
  { id: 'weg-mpw40-20', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW40-3-U020', commercialCode: '12428129', description: 'Disjuntor-motor MPW40, 16-20 A', nominalCurrent: 20, adjustmentRange: { min: 16, max: 20 }, voltage: 690, poles: 3, utilizationCategory: 'AC-3', price: 215.00 },
  { id: 'weg-mpw40-25', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW40-3-U025', commercialCode: '12428133', description: 'Disjuntor-motor MPW40, 20-25 A', nominalCurrent: 25, adjustmentRange: { min: 20, max: 25 }, voltage: 690, poles: 3, utilizationCategory: 'AC-3', price: 245.00 },
  { id: 'weg-mpw40-32', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW40-3-U032', commercialCode: '12428131', description: 'Disjuntor-motor MPW40, 25-32 A', nominalCurrent: 32, adjustmentRange: { min: 25, max: 32 }, voltage: 690, poles: 3, utilizationCategory: 'AC-3', price: 285.00 },

  // Fusíveis WEG Diazed e NH
  { id: 'weg-fd-16', manufacturer: 'WEG', category: 'fusivel', model: 'F D-16', commercialCode: '10000001', description: 'Fusível Diazed retardado, 16A', nominalCurrent: 16, voltage: 500, price: 12.00 },
  { id: 'weg-fd-25', manufacturer: 'WEG', category: 'fusivel', model: 'F D-25', commercialCode: '10000002', description: 'Fusível Diazed retardado, 25A', nominalCurrent: 25, voltage: 500, price: 14.00 },
  { id: 'weg-fnh00-63', manufacturer: 'WEG', category: 'fusivel', model: 'F NH00-63', commercialCode: '10000003', description: 'Fusível NH tamanho 00 retardado, 63A', nominalCurrent: 63, voltage: 500, price: 45.00 },
  { id: 'weg-fnh1-100', manufacturer: 'WEG', category: 'fusivel', model: 'F NH1-100', commercialCode: '10000004', description: 'Fusível NH tamanho 1 retardado, 100A', nominalCurrent: 100, voltage: 500, price: 85.00 },

  // Soft-Starters e Inversores WEG
  { id: 'weg-ssw05-16', manufacturer: 'WEG', category: 'softStarter', model: 'SSW050016T2246TPZ', commercialCode: '10413821', description: 'Soft-Starter SSW05, 16 A, 220-460 V', nominalCurrent: 16, voltage: 460, voltageRange: { min: 220, max: 460 }, price: 850.00 },
  { id: 'weg-ssw05-30', manufacturer: 'WEG', category: 'softStarter', model: 'SSW050030T2246TPZ', commercialCode: '10413823', description: 'Soft-Starter SSW05, 30 A, 220-460 V', nominalCurrent: 30, voltage: 460, voltageRange: { min: 220, max: 460 }, price: 1150.00 },
  { id: 'weg-ssw05-45', manufacturer: 'WEG', category: 'softStarter', model: 'SSW050045T2246TPZ', commercialCode: '10413824', description: 'Soft-Starter SSW05, 45 A, 220-460 V', nominalCurrent: 45, voltage: 460, voltageRange: { min: 220, max: 460 }, price: 1450.00 },
  { id: 'weg-ssw05-60', manufacturer: 'WEG', category: 'softStarter', model: 'SSW050060T2246TPZ', commercialCode: '10328754', description: 'Soft-Starter SSW05, 60 A, 220-460 V', nominalCurrent: 60, voltage: 460, voltageRange: { min: 220, max: 460 }, price: 1850.00 },
  { id: 'weg-cfw300-15-220', manufacturer: 'WEG', category: 'inverter', model: 'CFW300B15P2T2DB20', commercialCode: '13059939', description: 'Inversor CFW300, 15,2 A, trifásico 200-240 V', nominalCurrent: 15.2, voltage: 240, voltageRange: { min: 200, max: 240 }, price: 1200.00 },
  { id: 'weg-cfw300-10-380', manufacturer: 'WEG', category: 'inverter', model: 'CFW300C10P0T4DB20', commercialCode: '14148365', description: 'Inversor CFW300, 10 A, trifásico 380-480 V', nominalCurrent: 10, voltage: 480, voltageRange: { min: 380, max: 480 }, price: 1600.00 },
  { id: 'weg-cfw300-15-380', manufacturer: 'WEG', category: 'inverter', model: 'CFW300C15P0T4DB20', commercialCode: '14148367', description: 'Inversor CFW300, 15 A, trifásico 380-480 V', nominalCurrent: 15, voltage: 480, voltageRange: { min: 380, max: 480 }, price: 2100.00 },

  // Disjuntores WEG MDW
  { id: 'weg-mdw-c6', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C6', commercialCode: '10076397', description: 'Minidisjuntor WEG MDW, 1P, curva C, 6 A', nominalCurrent: 6, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c10', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C10', commercialCode: '10076405', description: 'Minidisjuntor WEG MDW, 1P, curva C, 10 A', nominalCurrent: 10, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c16', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C16', commercialCode: '10076413', description: 'Minidisjuntor WEG MDW, 1P, curva C, 16 A', nominalCurrent: 16, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c20', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C20', commercialCode: '10076421', description: 'Minidisjuntor WEG MDW, 1P, curva C, 20 A', nominalCurrent: 20, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c25', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C25', commercialCode: '10076429', description: 'Minidisjuntor WEG MDW, 1P, curva C, 25 A', nominalCurrent: 25, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c32', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C32', commercialCode: '10076437', description: 'Minidisjuntor WEG MDW, 1P, curva C, 32 A', nominalCurrent: 32, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c40', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C40', commercialCode: '10076445', description: 'Minidisjuntor WEG MDW, 1P, curva C, 40 A', nominalCurrent: 40, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c50', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C50', commercialCode: '10076453', description: 'Minidisjuntor WEG MDW, 1P, curva C, 50 A', nominalCurrent: 50, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c63', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C63', commercialCode: '10076461', description: 'Minidisjuntor WEG MDW, 1P, curva C, 63 A', nominalCurrent: 63, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c80', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C80', commercialCode: '10076469', description: 'Minidisjuntor WEG MDW, 1P, curva C, 80 A', nominalCurrent: 80, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c100', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C100', commercialCode: '10075743', description: 'Minidisjuntor WEG MDW, 1P, curva C, 100 A', nominalCurrent: 100, voltage: 440, poles: 1, price: 0 },
  { id: 'weg-mdw-c125', manufacturer: 'WEG', category: 'disjuntor', model: 'MDW-C125', commercialCode: '11807325', description: 'Minidisjuntor WEG MDW, 1P, curva C, 125 A', nominalCurrent: 125, voltage: 440, poles: 1, price: 0 },

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
  { id: 'weg-rw27-32', manufacturer: 'WEG', category: 'releTermico', model: 'RW27-1D3-U032', commercialCode: '10452382', description: 'Relé térmico RW27, 22-32 A', nominalCurrent: 32, adjustmentRange: { min: 22, max: 32 }, price: 245.00 },
  { id: 'weg-rw27-40', manufacturer: 'WEG', category: 'releTermico', model: 'RW27-1D3-U040', commercialCode: '10046950', description: 'Relé RW27, 28-40A', nominalCurrent: 40, adjustmentRange: { min: 28, max: 40 }, price: 115.00 },
  { id: 'weg-rw27-50', manufacturer: 'WEG', category: 'releTermico', model: 'RW27-1D3-U050', commercialCode: '10046951', description: 'Relé RW27, 40-50A', nominalCurrent: 50, adjustmentRange: { min: 40, max: 50 }, price: 145.00 },
  { id: 'weg-rw67-80', manufacturer: 'WEG', category: 'releTermico', model: 'RW67-1D3-U080', commercialCode: '10046952', description: 'Relé RW67, 57-80A', nominalCurrent: 80, adjustmentRange: { min: 57, max: 80 }, price: 285.00 },
  { id: 'weg-rw67-112', manufacturer: 'WEG', category: 'releTermico', model: 'RW67-1D3-U112', commercialCode: '10046953', description: 'Relé RW67, 80-112A', nominalCurrent: 112, adjustmentRange: { min: 80, max: 112 }, price: 345.00 },
  { id: 'weg-rw117-150', manufacturer: 'WEG', category: 'releTermico', model: 'RW117-1D3-U150', commercialCode: '10046954', description: 'Relé RW117, 100-150A', nominalCurrent: 150, adjustmentRange: { min: 100, max: 150 }, price: 485.00 },
  { id: 'weg-rw317-215', manufacturer: 'WEG', category: 'releTermico', model: 'RW317-1D3-U215', commercialCode: '10410005', description: 'Relé térmico RW317, 140-215 A', nominalCurrent: 215, adjustmentRange: { min: 140, max: 215 }, price: 1250.00 },
  { id: 'weg-rw317-310', manufacturer: 'WEG', category: 'releTermico', model: 'RW317-1D3-U310', commercialCode: '10410006', description: 'Relé térmico RW317, 200-310 A', nominalCurrent: 310, adjustmentRange: { min: 200, max: 310 }, price: 1650.00 },

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
  
  // Contatores de Alta Potência (Linha CWM / TeSys / Sirius)
  { id: 'weg-cwm300', manufacturer: 'WEG', category: 'contator', model: 'CWM300', commercialCode: '10045424', description: 'Contator de potência CWM, 300A, AC-3', nominalCurrent: 300, voltage: 690, price: 1850.00 },
  { id: 'schneider-tesys-d225', manufacturer: 'Schneider', category: 'contator', model: 'LC1D225', commercialCode: 'LC1D225M7', description: 'Contator TeSys D, 225A, AC-3', nominalCurrent: 225, voltage: 690, price: 1550.00 },
  { id: 'siemens-sirius-d225', manufacturer: 'Siemens', category: 'contator', model: '3RT1064', commercialCode: '3RT1064-6AF36', description: 'Contator Sirius, 225A, AC-3', nominalCurrent: 225, voltage: 690, price: 1450.00 },

  // Disjuntores de Caixa Moldada (Acima de 125A)
  { id: 'weg-dwb160', manufacturer: 'WEG', category: 'disjuntor', model: 'DWB160', commercialCode: '10045678', description: 'Disjuntor Caixa Moldada DWB160, 160A', nominalCurrent: 160, voltage: 440, price: 450.00 },
  { id: 'weg-dwb250-200', manufacturer: 'WEG', category: 'disjuntor', model: 'DWB250', commercialCode: '10045681', description: 'Disjuntor Caixa Moldada DWB250, 200A', nominalCurrent: 200, voltage: 440, price: 580.00 },
  { id: 'weg-dwb250-225', manufacturer: 'WEG', category: 'disjuntor', model: 'DWB250', commercialCode: '10045682', description: 'Disjuntor Caixa Moldada DWB250, 225A', nominalCurrent: 225, voltage: 440, price: 620.00 },
  { id: 'weg-dwb250', manufacturer: 'WEG', category: 'disjuntor', model: 'DWB250', commercialCode: '10045679', description: 'Disjuntor Caixa Moldada DWB250, 250A', nominalCurrent: 250, voltage: 440, price: 650.00 },
  { id: 'weg-dwb400', manufacturer: 'WEG', category: 'disjuntor', model: 'DWB400', commercialCode: '10045680', description: 'Disjuntor Caixa Moldada DWB400, 400A', nominalCurrent: 400, voltage: 440, price: 950.00 },

  { id: 'schneider-nsx160', manufacturer: 'Schneider', category: 'disjuntor', model: 'NSX160', commercialCode: 'NSX160N', description: 'Disjuntor Compact NSX160, 160A', nominalCurrent: 160, voltage: 440, price: 680.00 },
  { id: 'schneider-nsx250-200', manufacturer: 'Schneider', category: 'disjuntor', model: 'NSX250', commercialCode: 'NSX250N-200', description: 'Disjuntor Compact NSX250, 200A', nominalCurrent: 200, voltage: 440, price: 780.00 },
  { id: 'schneider-nsx250-225', manufacturer: 'Schneider', category: 'disjuntor', model: 'NSX250', commercialCode: 'NSX250N-225', description: 'Disjuntor Compact NSX250, 225A', nominalCurrent: 225, voltage: 440, price: 820.00 },
  { id: 'schneider-nsx250', manufacturer: 'Schneider', category: 'disjuntor', model: 'NSX250', commercialCode: 'NSX250N', description: 'Disjuntor Compact NSX250, 250A', nominalCurrent: 250, voltage: 440, price: 880.00 },
  { id: 'schneider-nsx400', manufacturer: 'Schneider', category: 'disjuntor', model: 'NSX400', commercialCode: 'NSX400N', description: 'Disjuntor Compact NSX400, 400A', nominalCurrent: 400, voltage: 440, price: 1280.00 },

  { id: 'siemens-3va160', manufacturer: 'Siemens', category: 'disjuntor', model: '3VA160', commercialCode: '3VA160', description: 'Disjuntor 3VA1, 160A', nominalCurrent: 160, voltage: 440, price: 580.00 },
  { id: 'siemens-3va250-200', manufacturer: 'Siemens', category: 'disjuntor', model: '3VA250', commercialCode: '3VA250-200', description: 'Disjuntor 3VA1, 200A', nominalCurrent: 200, voltage: 440, price: 680.00 },
  { id: 'siemens-3va250-225', manufacturer: 'Siemens', category: 'disjuntor', model: '3VA250', commercialCode: '3VA250-225', description: 'Disjuntor 3VA1, 225A', nominalCurrent: 225, voltage: 440, price: 720.00 },
  { id: 'siemens-3va250', manufacturer: 'Siemens', category: 'disjuntor', model: '3VA250', commercialCode: '3VA250', description: 'Disjuntor 3VA1, 250A', nominalCurrent: 250, voltage: 440, price: 780.00 },
  { id: 'siemens-3va400', manufacturer: 'Siemens', category: 'disjuntor', model: '3VA400', commercialCode: '3VA400', description: 'Disjuntor 3VA1, 400A', nominalCurrent: 400, voltage: 440, price: 1180.00 },

  // Relés de Tempo WEG RTW
  { id: 'weg-rtw-1', manufacturer: 'WEG', category: 'releTempo', model: 'RTW17-G02U030SE05', commercialCode: '13960132', description: 'Relé temporizador RTW17, função estrela-triângulo, 3-30 s, 24-240 V 50/60 Hz/CC', voltageRange: { min: 24, max: 240 }, price: 180.00 },
  
  // Relés de Tempo Schneider RE17
  { id: 'schneider-re22-star-delta', manufacturer: 'Schneider', category: 'releTempo', model: 'RE22R2QEMR', commercialCode: 'RE22R2QEMR', description: 'Relé temporizador Harmony, função estrela-triângulo, 0,3-30 s, 24-240 V CA/CC', voltageRange: { min: 24, max: 240 }, price: 210.00 },

  // Relés de Tempo Siemens Sirius 3RP
  { id: 'siemens-3rp-star-delta', manufacturer: 'Siemens', category: 'releTempo', model: '3RP2576-2NW30', commercialCode: '3RP2576-2NW30', description: 'Relé temporizador SIRIUS, função estrela-triângulo, 3-60 s, 12-240 V CA/CC', voltageRange: { min: 12, max: 240 }, price: 230.00 },
  
  // Itens Auxiliares
  { id: 'weg-btn-green', manufacturer: 'WEG', category: 'auxiliar', model: 'CSW-BF1', commercialCode: '10046000', description: 'Botão Faceado Verde (Liga)', nominalCurrent: 0, price: 25.00 },
  { id: 'weg-btn-red', manufacturer: 'WEG', category: 'auxiliar', model: 'CSW-BF2', commercialCode: '10046001', description: 'Botão Faceado Vermelho (Desliga)', nominalCurrent: 0, price: 25.00 },
  { id: 'weg-pilot-green', manufacturer: 'WEG', category: 'auxiliar', model: 'CSW-SD1', commercialCode: '10046002', description: 'Sinaleiro LED Verde', nominalCurrent: 0, price: 15.00 },
  { id: 'weg-pilot-red', manufacturer: 'WEG', category: 'auxiliar', model: 'CSW-SD2', commercialCode: '10046003', description: 'Sinaleiro LED Vermelho', nominalCurrent: 0, price: 15.00 },
  { id: 'weg-terminal-10', manufacturer: 'WEG', category: 'auxiliar', model: 'BTWP', commercialCode: '10046004', description: 'Borne de Passagem 10mm²', nominalCurrent: 0, price: 3.50 },
  
  { id: 'siemens-btn-green', manufacturer: 'Siemens', category: 'auxiliar', model: '3SU1', commercialCode: '3SU1', description: 'Botão Sirius Act Verde', nominalCurrent: 0, price: 45.00 },
  { id: 'siemens-btn-red', manufacturer: 'Siemens', category: 'auxiliar', model: '3SU1-R', commercialCode: '3SU1-R', description: 'Botão Sirius Act Vermelho', nominalCurrent: 0, price: 45.00 },
  
  { id: 'schneider-btn-green', manufacturer: 'Schneider', category: 'auxiliar', model: 'XB4', commercialCode: 'XB4', description: 'Botão Harmony XB4 Verde', nominalCurrent: 0, price: 48.00 },
  { id: 'schneider-btn-red', manufacturer: 'Schneider', category: 'auxiliar', model: 'XB4-R', commercialCode: 'XB4-R', description: 'Botão Harmony XB4 Vermelho', nominalCurrent: 0, price: 48.00 },
  
  // Sinaleiros Adicionais
  { id: 'schneider-pilot-green', manufacturer: 'Schneider', category: 'auxiliar', model: 'XB4-BVB3', commercialCode: 'XB4BVB3', description: 'Sinaleiro Harmony LED Verde', nominalCurrent: 0, price: 35.00 },
  { id: 'schneider-pilot-red', manufacturer: 'Schneider', category: 'auxiliar', model: 'XB4-BVB4', commercialCode: 'XB4BVB4', description: 'Sinaleiro Harmony LED Vermelho', nominalCurrent: 0, price: 35.00 },
  { id: 'siemens-pilot-green', manufacturer: 'Siemens', category: 'auxiliar', model: '3SU1-PILOT-G', commercialCode: '3SU1-G', description: 'Sinaleiro Sirius LED Verde', nominalCurrent: 0, price: 32.00 },
  { id: 'siemens-pilot-red', manufacturer: 'Siemens', category: 'auxiliar', model: '3SU1-PILOT-R', commercialCode: '3SU1-R', description: 'Sinaleiro Sirius LED Vermelho', nominalCurrent: 0, price: 32.00 },
  
  // Disjuntores Motor Siemens Sirius 3RV
  { id: 'siemens-3rv-10', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2011-1JA10', commercialCode: '3RV2011-1JA10', description: 'Disjuntor Motor Sirius, 7-10A', nominalCurrent: 10, adjustmentRange: { min: 7, max: 10 }, voltage: 690, price: 210.00 },
  { id: 'siemens-3rv-16', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2011-4AA10', commercialCode: '3RV2011-4AA10', description: 'Disjuntor Motor Sirius, 11-16A', nominalCurrent: 16, adjustmentRange: { min: 11, max: 16 }, voltage: 690, price: 225.00 },
  { id: 'siemens-3rv-20', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2011-4BA10', commercialCode: '3RV2011-4BA10', description: 'Disjuntor Motor Sirius, 14-20A', nominalCurrent: 20, adjustmentRange: { min: 14, max: 20 }, voltage: 690, price: 245.00 },
  { id: 'siemens-3rv-25', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2021-4DA10', commercialCode: '3RV2021-4DA10', description: 'Disjuntor Motor Sirius, 18-25A', nominalCurrent: 25, adjustmentRange: { min: 18, max: 25 }, voltage: 690, price: 275.00 },
  
  // Disjuntores Motor Schneider TeSys GV2
  { id: 'schneider-gv2me-10', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV2ME14', commercialCode: 'GV2ME14', description: 'Disjuntor Motor TeSys GV2, 6-10A', nominalCurrent: 10, adjustmentRange: { min: 6, max: 10 }, voltage: 690, price: 220.00 },
  { id: 'schneider-gv2me-14', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV2ME16', commercialCode: 'GV2ME16', description: 'Disjuntor Motor TeSys GV2, 9-14A', nominalCurrent: 14, adjustmentRange: { min: 9, max: 14 }, voltage: 690, price: 235.00 },
  { id: 'schneider-gv2me-20', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV2ME20', commercialCode: 'GV2ME20', description: 'Disjuntor Motor TeSys GV2, 13-18A', nominalCurrent: 18, adjustmentRange: { min: 13, max: 18 }, voltage: 690, price: 255.00 },
  { id: 'schneider-gv2me-25', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV2ME22', commercialCode: 'GV2ME22', description: 'Disjuntor Motor TeSys GV2, 17-23A', nominalCurrent: 23, adjustmentRange: { min: 17, max: 23 }, voltage: 690, price: 285.00 },
  // Siemens Diazed/NH
  { id: 'siemens-diazed-16', manufacturer: 'Siemens', category: 'fusivel', model: '5SA251', commercialCode: '5SA251', description: 'Fusível Diazed retardado, 16A', nominalCurrent: 16, voltage: 500, price: 18.00 },
  { id: 'siemens-diazed-25', manufacturer: 'Siemens', category: 'fusivel', model: '5SA271', commercialCode: '5SA271', description: 'Fusível Diazed retardado, 25A', nominalCurrent: 25, voltage: 500, price: 22.00 },
  { id: 'siemens-nh-63', manufacturer: 'Siemens', category: 'fusivel', model: '3NA3822', commercialCode: '3NA3822', description: 'Fusível NH00, 63A', nominalCurrent: 63, voltage: 500, price: 55.00 },
  { id: 'siemens-nh-100', manufacturer: 'Siemens', category: 'fusivel', model: '3NA3830', commercialCode: '3NA3830', description: 'Fusível NH00, 100A', nominalCurrent: 100, voltage: 500, price: 95.00 },
  
  // Schneider Diazed/NH (TeSys)
  { id: 'schneider-df-16', manufacturer: 'Schneider', category: 'fusivel', model: 'DF2CA16', commercialCode: 'DF2CA16', description: 'Fusível cilíndrico, 16A', nominalCurrent: 16, voltage: 500, price: 25.00 },
  { id: 'schneider-df-25', manufacturer: 'Schneider', category: 'fusivel', model: 'DF2CA25', commercialCode: 'DF2CA25', description: 'Fusível cilíndrico, 25A', nominalCurrent: 25, voltage: 500, price: 28.00 },
  { id: 'schneider-nh-63', manufacturer: 'Schneider', category: 'fusivel', model: 'NH00-63A', commercialCode: 'NH00-63A', description: 'Fusível NH00, 63A', nominalCurrent: 63, voltage: 500, price: 65.00 },
  { id: 'schneider-nh-100', manufacturer: 'Schneider', category: 'fusivel', model: 'NH00-100A', commercialCode: 'NH00-100A', description: 'Fusível NH00, 100A', nominalCurrent: 100, voltage: 500, price: 110.00 },
  
  // Siemens Sirius 3RV (Disjuntores Motor adicionais para cobrir ranges)
  { id: 'siemens-3rv-32', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2021-4EA10', commercialCode: '3RV2021-4EA10', description: 'Disjuntor Motor Sirius, 27-32A', nominalCurrent: 32, adjustmentRange: { min: 27, max: 32 }, voltage: 690, price: 310.00 },
  { id: 'siemens-3rv-40', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2021-4FA10', commercialCode: '3RV2021-4FA10', description: 'Disjuntor Motor Sirius, 34-40A', nominalCurrent: 40, adjustmentRange: { min: 34, max: 40 }, voltage: 690, price: 340.00 },
  { id: 'siemens-3rv-50', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2031-4HB10', commercialCode: '3RV2031-4HB10', description: 'Disjuntor Motor Sirius, 36-50A', nominalCurrent: 50, adjustmentRange: { min: 36, max: 50 }, voltage: 690, price: 420.00 },
  { id: 'siemens-3rv-63', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2031-4JB10', commercialCode: '3RV2031-4JB10', description: 'Disjuntor Motor Sirius, 45-63A', nominalCurrent: 63, adjustmentRange: { min: 45, max: 63 }, voltage: 690, price: 480.00 },
  { id: 'siemens-3rv-80', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2031-4KB10', commercialCode: '3RV2031-4KB10', description: 'Disjuntor Motor Sirius, 57-80A', nominalCurrent: 80, adjustmentRange: { min: 57, max: 80 }, voltage: 690, price: 550.00 },
  { id: 'siemens-3rv-100', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2041-4MA10', commercialCode: '3RV2041-4MA10', description: 'Disjuntor Motor Sirius, 80-100A', nominalCurrent: 100, adjustmentRange: { min: 80, max: 100 }, voltage: 690, price: 680.00 },
  { id: 'siemens-3rv-150', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2041-4RA10', commercialCode: '3RV2041-4RA10', description: 'Disjuntor Motor Sirius, 100-150A', nominalCurrent: 150, adjustmentRange: { min: 100, max: 150 }, voltage: 690, price: 950.00 },
  { id: 'siemens-3rv-200', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3RV2041-4YA10', commercialCode: '3RV2041-4YA10', description: 'Disjuntor Motor Sirius, 140-200A', nominalCurrent: 200, adjustmentRange: { min: 140, max: 200 }, voltage: 690, price: 1250.00 },
  { id: 'siemens-3rv-300', manufacturer: 'Siemens', category: 'disjuntorMotor', model: '3VA11-300A', commercialCode: '3VA11', description: 'Disjuntor Motor Sirius, 200-300A', nominalCurrent: 300, adjustmentRange: { min: 200, max: 300 }, voltage: 690, price: 1850.00 },

  // Schneider TeSys GV2/GV3/GV4/GV5/GV6 (Disjuntores Motor adicionais para cobrir ranges)
  { id: 'schneider-gv2me-32', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV2ME32', commercialCode: 'GV2ME32', description: 'Disjuntor Motor TeSys GV2, 24-32A', nominalCurrent: 32, adjustmentRange: { min: 24, max: 32 }, voltage: 690, price: 320.00 },
  { id: 'schneider-gv3p-40', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV3P40', commercialCode: 'GV3P40', description: 'Disjuntor Motor TeSys GV3, 30-40A', nominalCurrent: 40, adjustmentRange: { min: 30, max: 40 }, voltage: 690, price: 480.00 },
  { id: 'schneider-gv3p-50', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV3P50', commercialCode: 'GV3P50', description: 'Disjuntor Motor TeSys GV3, 37-50A', nominalCurrent: 50, adjustmentRange: { min: 37, max: 50 }, voltage: 690, price: 520.00 },
  { id: 'schneider-gv3p-65', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV3P65', commercialCode: 'GV3P65', description: 'Disjuntor Motor TeSys GV3, 48-65A', nominalCurrent: 65, adjustmentRange: { min: 48, max: 65 }, voltage: 690, price: 580.00 },
  { id: 'schneider-gv3p-73', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV3P73', commercialCode: 'GV3P73', description: 'Disjuntor Motor TeSys GV3, 62-73A', nominalCurrent: 73, adjustmentRange: { min: 62, max: 73 }, voltage: 690, price: 650.00 },
  { id: 'schneider-gv3p-80', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV3P80', commercialCode: 'GV3P80', description: 'Disjuntor Motor TeSys GV3, 70-80A', nominalCurrent: 80, adjustmentRange: { min: 70, max: 80 }, voltage: 690, price: 720.00 },
  { id: 'schneider-gv4p-115', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV4P115', commercialCode: 'GV4P115', description: 'Disjuntor Motor TeSys GV4, 65-115A', nominalCurrent: 115, adjustmentRange: { min: 65, max: 115 }, voltage: 690, price: 1150.00 },
  { id: 'schneider-gv5-150', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV5P150', commercialCode: 'GV5P150', description: 'Disjuntor Motor TeSys GV5, 100-150A', nominalCurrent: 150, adjustmentRange: { min: 100, max: 150 }, voltage: 690, price: 1450.00 },
  { id: 'schneider-gv5-220', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV5P220', commercialCode: 'GV5P220', description: 'Disjuntor Motor TeSys GV5, 150-220A', nominalCurrent: 220, adjustmentRange: { min: 150, max: 220 }, voltage: 690, price: 1750.00 },
  { id: 'schneider-gv6-320', manufacturer: 'Schneider', category: 'disjuntorMotor', model: 'GV6P320', commercialCode: 'GV6P320', description: 'Disjuntor Motor TeSys GV6, 200-320A', nominalCurrent: 320, adjustmentRange: { min: 200, max: 320 }, voltage: 690, price: 2150.00 },

  // Disjuntores Motor WEG MPW Alta Potência
  { id: 'weg-mpw80-50', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW80-3-U050', commercialCode: '12425428', description: 'Disjuntor-motor MPW80, 40-50 A', nominalCurrent: 50, adjustmentRange: { min: 40, max: 50 }, voltage: 690, poles: 3, utilizationCategory: 'AC-3', price: 580.00 },
  { id: 'weg-mpw80-65', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW80-3-U065', commercialCode: '12425429', description: 'Disjuntor-motor MPW80, 50-65 A', nominalCurrent: 65, adjustmentRange: { min: 50, max: 65 }, voltage: 690, poles: 3, utilizationCategory: 'AC-3', price: 850.00 },
  { id: 'weg-mpw80-80', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW80-3-U080', commercialCode: '12501063', description: 'Disjuntor-motor MPW80, 65-80 A', nominalCurrent: 80, adjustmentRange: { min: 65, max: 80 }, voltage: 690, poles: 3, utilizationCategory: 'AC-3', price: 1150.00 },
  { id: 'weg-mpw100-90', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW100-3-U090', commercialCode: '10076552', description: 'Disjuntor-motor MPW100, 70-90 A', nominalCurrent: 90, adjustmentRange: { min: 70, max: 90 }, voltage: 690, poles: 3, utilizationCategory: 'AC-3', price: 1650.00 },
  { id: 'weg-mpw100-100', manufacturer: 'WEG', category: 'disjuntorMotor', model: 'MPW100-3-U100', commercialCode: '10047295', description: 'Disjuntor-motor MPW100, 80-100 A', nominalCurrent: 100, adjustmentRange: { min: 80, max: 100 }, voltage: 690, poles: 3, utilizationCategory: 'AC-3', price: 1950.00 },

  // Fusíveis NH Alta Potência (Para motores até 100cv)
  { id: 'weg-fnh2-160', manufacturer: 'WEG', category: 'fusivel', model: 'F NH2-160', commercialCode: '10000012', description: 'Fusível NH2 retardado, 160A', nominalCurrent: 160, voltage: 500, price: 125.00 },
  { id: 'weg-fnh2-250', manufacturer: 'WEG', category: 'fusivel', model: 'F NH2-250', commercialCode: '10000013', description: 'Fusível NH2 retardado, 250A', nominalCurrent: 250, voltage: 500, price: 185.00 },
  { id: 'weg-fnh3-400', manufacturer: 'WEG', category: 'fusivel', model: 'F NH3-400', commercialCode: '10000014', description: 'Fusível NH3 retardado, 400A', nominalCurrent: 400, voltage: 500, price: 295.00 },

  { id: 'siemens-nh-160', manufacturer: 'Siemens', category: 'fusivel', model: '3NA3136', commercialCode: '3NA3136', description: 'Fusível NH1, 160A', nominalCurrent: 160, voltage: 500, price: 145.00 },
  { id: 'siemens-nh-250', manufacturer: 'Siemens', category: 'fusivel', model: '3NA3244', commercialCode: '3NA3244', description: 'Fusível NH2, 250A', nominalCurrent: 250, voltage: 500, price: 215.00 },
  { id: 'siemens-nh-400', manufacturer: 'Siemens', category: 'fusivel', model: '3NA3360', commercialCode: '3NA3360', description: 'Fusível NH3, 400A', nominalCurrent: 400, voltage: 500, price: 345.00 },

  { id: 'schneider-nh-160', manufacturer: 'Schneider', category: 'fusivel', model: 'NH1-160A', commercialCode: 'NH1-160A', description: 'Fusível NH1, 160A', nominalCurrent: 160, voltage: 500, price: 165.00 },
  { id: 'schneider-nh-250', manufacturer: 'Schneider', category: 'fusivel', model: 'NH2-250A', commercialCode: 'NH2-250A', description: 'Fusível NH2, 250A', nominalCurrent: 250, voltage: 500, price: 235.00 },
  { id: 'schneider-nh-400', manufacturer: 'Schneider', category: 'fusivel', model: 'NH3-400A', commercialCode: 'NH3-400A', description: 'Fusível NH3, 400A', nominalCurrent: 400, voltage: 500, price: 375.00 },

  // Relés Térmicos Schneider LRD de Alta Potência
  { id: 'schneider-lrd-4365', manufacturer: 'Schneider', category: 'releTermico', model: 'LRD4365', commercialCode: 'LRD4365', description: 'Relé TeSys LRD, 80-104A', nominalCurrent: 104, adjustmentRange: { min: 80, max: 104 }, price: 650.00 },
  { id: 'schneider-lr9f-150', manufacturer: 'Schneider', category: 'releTermico', model: 'LR9F5369', commercialCode: 'LR9F5369', description: 'Relé Eletrônico TeSys F, 90-150A', nominalCurrent: 150, adjustmentRange: { min: 90, max: 150 }, price: 850.00 },
  { id: 'schneider-lr9f-225', manufacturer: 'Schneider', category: 'releTermico', model: 'LR9F5371', commercialCode: 'LR9F5371', description: 'Relé Eletrônico TeSys F, 132-225A', nominalCurrent: 225, adjustmentRange: { min: 132, max: 225 }, price: 1100.00 },
  { id: 'schneider-lr9f-330', manufacturer: 'Schneider', category: 'releTermico', model: 'LR9F7375', commercialCode: 'LR9F7375', description: 'Relé Eletrônico TeSys F, 200-330A', nominalCurrent: 330, adjustmentRange: { min: 200, max: 330 }, price: 1450.00 },

  // Relés Térmicos Siemens Sirius 3RU/3RB de Alta Potência
  { id: 'siemens-3rb-160', manufacturer: 'Siemens', category: 'releTermico', model: '3RB3046-1XB0', commercialCode: '3RB3046-1XB0', description: 'Relé Eletrônico Sirius, 32-115A', nominalCurrent: 115, adjustmentRange: { min: 32, max: 115 }, price: 780.00 },
  { id: 'siemens-3rb-200', manufacturer: 'Siemens', category: 'releTermico', model: '3RB2056-1FC2', commercialCode: '3RB2056-1FC2', description: 'Relé Eletrônico Sirius, 50-200A', nominalCurrent: 200, adjustmentRange: { min: 50, max: 200 }, price: 1050.00 },
  { id: 'siemens-3rb-300', manufacturer: 'Siemens', category: 'releTermico', model: '3RB2066-1MC2', commercialCode: '3RB2066-1MC2', description: 'Relé Eletrônico Sirius, 160-630A', nominalCurrent: 630, adjustmentRange: { min: 160, max: 630 }, price: 1650.00 },
];

const BLOCKED_PRODUCT_IDS = new Set([
  // Fusíveis WEG com códigos sintéticos herdados.
  'weg-fd-16','weg-fd-25','weg-fnh00-63','weg-fnh1-100','weg-fnh2-160','weg-fnh2-250','weg-fnh3-400',

  // Referências de caixa moldada que eram famílias/configurações genéricas, não SKUs completos.
  'schneider-nsx160','schneider-nsx250-200','schneider-nsx250-225','schneider-nsx250','schneider-nsx400',
  'siemens-3va160','siemens-3va250-200','siemens-3va250-225','siemens-3va250','siemens-3va400',

  // Registro incorreto: 3VA11 é família de MCCB, não disjuntor-motor SIRIUS 200-300 A.
  'siemens-3rv-300',

  // Fusíveis NH Schneider registrados com códigos genéricos, não referências comerciais exatas.
  'schneider-nh-63','schneider-nh-100','schneider-nh-160','schneider-nh-250','schneider-nh-400',

  // Faixas acima das famílias modulares confirmadas nesta auditoria.
  'schneider-acti9-c80','schneider-acti9-c100','schneider-acti9-c125',
  'siemens-5sy-c80','siemens-5sy-c100','siemens-5sy-c125',
]);

const VERIFIED_EXACT_PRODUCT_IDS = new Set([
  // WEG MPW
  'weg-mpw18-10','weg-mpw18-16','weg-mpw40-20','weg-mpw40-25','weg-mpw40-32',
  'weg-mpw80-50','weg-mpw80-65','weg-mpw80-80','weg-mpw100-90','weg-mpw100-100',

  // WEG SSW05 e CFW300
  'weg-ssw05-16','weg-ssw05-30','weg-ssw05-45','weg-ssw05-60',
  'weg-cfw300-15-220','weg-cfw300-10-380','weg-cfw300-15-380',

  // WEG relés com código conferido diretamente
  'weg-rw27-32','weg-rw317-215','weg-rw317-310',
  'weg-mdw-c6','weg-mdw-c10','weg-mdw-c16','weg-mdw-c20','weg-mdw-c25','weg-mdw-c32',
  'weg-mdw-c40','weg-mdw-c50','weg-mdw-c63','weg-mdw-c80','weg-mdw-c100','weg-mdw-c125',

  // Relés temporizadores estrela-triângulo com SKU completo
  'weg-rtw-1','schneider-re22-star-delta','siemens-3rp-star-delta',

  // Exemplos individuais conferidos diretamente em catálogo oficial
  'schneider-gv2me-10','siemens-3rv-10',
]);

const PHASE_OUT_PRODUCT_IDS = new Set([
  'schneider-acti9-c6','schneider-acti9-c10','schneider-acti9-c16','schneider-acti9-c20',
  'schneider-acti9-c25','schneider-acti9-c32','schneider-acti9-c40','schneider-acti9-c50','schneider-acti9-c63',
]);

const OFFICIAL_SOURCE_BY_ID: Record<string, string> = {
  'weg-mpw18-10': 'WEG catálogo — produto 12429372',
  'weg-mpw18-16': 'WEG catálogo — produto 12429373',
  'weg-mpw40-20': 'WEG catálogo — produto 12428129',
  'weg-mpw40-25': 'WEG catálogo — produto 12428133',
  'weg-mpw40-32': 'WEG catálogo — produto 12428131',
  'weg-mpw80-50': 'WEG catálogo — produto 12425428',
  'weg-mpw80-65': 'WEG catálogo — produto 12425429',
  'weg-mpw80-80': 'WEG catálogo — produto 12501063',
  'weg-mpw100-90': 'WEG catálogo — produto 10076552',
  'weg-mpw100-100': 'WEG catálogo — produto 10047295',
  'weg-ssw05-16': 'WEG catálogo — produto 10413821',
  'weg-ssw05-30': 'WEG catálogo — produto 10413823',
  'weg-ssw05-45': 'WEG catálogo — produto 10413824',
  'weg-ssw05-60': 'WEG catálogo — produto 10328754',
  'weg-cfw300-15-220': 'WEG catálogo — produto 13059939',
  'weg-cfw300-10-380': 'WEG catálogo — produto 14148365',
  'weg-cfw300-15-380': 'WEG catálogo — produto 14148367',
  'weg-rw27-32': 'WEG catálogo — produto 10452382',
  'weg-rw317-215': 'WEG catálogo — produto 10410005',
  'weg-rw317-310': 'WEG catálogo — produto 10410006',
  'weg-mdw-c6': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c10': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c16': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c20': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c25': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c32': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c40': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c50': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c63': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c80': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c100': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-mdw-c125': 'WEG Soluções Integradas — MDW monopolar curva C',
  'weg-rtw-1': 'WEG catálogo — produto 13960132',
  'schneider-gv2me-10': 'Schneider Electric — GV2ME14',
  'siemens-3rv-10': 'Siemens Industry Mall — 3RV2011-1JA10',
  'schneider-re22-star-delta': 'Schneider Electric — RE22R2QEMR',
  'siemens-3rp-star-delta': 'Siemens Industry Mall — 3RP2576-2NW30',
};

function auditProduct(product: ManufacturerProduct): ManufacturerProduct {
  if (BLOCKED_PRODUCT_IDS.has(product.id) || /^100000\d*$/.test(product.commercialCode)) {
    return {
      ...product,
      commercialCode: '',
      verificationStatus: 'blocked',
      selectionNote: 'Registro bloqueado pela auditoria: referência comercial não confirmada ou tecnicamente inadequada.',
    };
  }

  if (VERIFIED_EXACT_PRODUCT_IDS.has(product.id)) {
    return {
      ...product,
      verificationStatus: 'verified-exact',
      catalogSource: OFFICIAL_SOURCE_BY_ID[product.id],
      lifecycle: PHASE_OUT_PRODUCT_IDS.has(product.id) ? 'phase-out' : 'active',
      selectionNote: 'SKU conferido em fonte oficial. Ainda devem ser verificados os parâmetros de aplicação do circuito.',
    };
  }

  return {
    ...product,
    commercialCode: '',
    verificationStatus: 'verified-family',
    lifecycle: PHASE_OUT_PRODUCT_IDS.has(product.id) ? 'phase-out' : 'active',
    selectionNote: product.category === 'contator'
      ? 'Família/corrente de referência. O SKU exato depende, entre outros parâmetros, da tensão da bobina de comando.'
      : product.category === 'disjuntor'
        ? 'Família de referência. O dispositivo final exige polos, capacidade de interrupção e coordenação adequados.'
        : product.category === 'releTempo'
          ? 'Família de referência; confirmar a variante conforme a tensão do circuito de comando.'
          : 'Família técnica validada; confirmar a referência comercial e a configuração no catálogo vigente.',
  };
}

export const MANUFACTURER_CATALOG: ManufacturerProduct[] = RAW_MANUFACTURER_CATALOG.map(auditProduct);

export const getProductsByCategory = (category: string) =>
  MANUFACTURER_CATALOG.filter(p => p.category === category && p.verificationStatus !== 'blocked');

export const findCompatibleProducts = (
  category: string,
  current: number,
  manufacturer?: string,
  systemVoltage?: number
): ManufacturerProduct[] => {
  const mfr = (manufacturer === 'any' || !manufacturer) ? undefined : manufacturer;
  const voltageSensitive = ['disjuntor', 'contator', 'softStarter', 'inverter'];

  const filtered = MANUFACTURER_CATALOG.filter(p => {
    if (p.category !== category) return false;
    if (p.verificationStatus === 'blocked') return false;
    if (p.lifecycle === 'phase-out') return false;
    if (mfr && p.manufacturer.toLowerCase() !== mfr.toLowerCase()) return false;

    if (systemVoltage && voltageSensitive.includes(category)) {
      if (p.voltageRange) {
        if (systemVoltage < p.voltageRange.min || systemVoltage > p.voltageRange.max) return false;
      } else if (!p.voltage || p.voltage < systemVoltage) {
        return false;
      }
    }

    // Soft-starters e inversores só podem ser sugeridos quando o SKU foi
    // auditado como exato, pois corrente e faixa de tensão fazem parte da seleção.
    if ((category === 'softStarter' || category === 'inverter') && p.verificationStatus !== 'verified-exact') {
      return false;
    }
    return true;
  });

  const verificationRank = (p: ManufacturerProduct) => p.verificationStatus === 'verified-exact' ? 0 : 1;

  if (category === 'releTermico' || category === 'disjuntorMotor') {
    return filtered
      .filter(p => !!p.adjustmentRange && current >= p.adjustmentRange.min && current <= p.adjustmentRange.max)
      .sort((a, b) => verificationRank(a) - verificationRank(b)
        || (a.adjustmentRange!.max - a.adjustmentRange!.min) - (b.adjustmentRange!.max - b.adjustmentRange!.min));
  }

  if (category === 'releTempo' || category === 'auxiliar') {
    return filtered.sort((a, b) => verificationRank(a) - verificationRank(b));
  }

  return filtered
    .filter(p => p.nominalCurrent !== undefined && p.nominalCurrent >= current)
    .sort((a, b) => verificationRank(a) - verificationRank(b)
      || (a.nominalCurrent || 0) - (b.nominalCurrent || 0));
};

export const findCompatibleProduct = (
  category: string,
  current: number,
  manufacturer?: string,
  systemVoltage?: number
) => {
  const products = findCompatibleProducts(category, current, manufacturer, systemVoltage);
  return products.length > 0 ? products[0] : null;
};
