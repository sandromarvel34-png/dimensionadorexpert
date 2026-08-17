import { PowerUnit } from '../../types';

export interface MotorCatalogEntry {
  id: string;
  manufacturer: 'WEG';
  line: string;
  model: string;
  power: number;
  powerUnit: PowerUnit;
  voltage: number;
  nominalCurrent: number;
  powerFactor: number;
  efficiency: number;
}

export const WEG_MOTOR_CATALOG: MotorCatalogEntry[] = [
  // Linha W22 Plus - Trifásico 220V
  { id: 'weg-w22-1cv-220', manufacturer: 'WEG', line: 'W22 Plus', model: 'W22 80 1CV 4P', power: 1, powerUnit: 'cv', voltage: 220, nominalCurrent: 3.02, powerFactor: 0.74, efficiency: 0.825 },
  { id: 'weg-w22-2cv-220', manufacturer: 'WEG', line: 'W22 Plus', model: 'W22 90S 2CV 4P', power: 2, powerUnit: 'cv', voltage: 220, nominalCurrent: 5.86, powerFactor: 0.75, efficiency: 0.84 },
  { id: 'weg-w22-5cv-220', manufacturer: 'WEG', line: 'W22 Plus', model: 'W22 112M 5CV 4P', power: 5, powerUnit: 'cv', voltage: 220, nominalCurrent: 13.5, powerFactor: 0.81, efficiency: 0.88 },
  { id: 'weg-w22-10cv-220', manufacturer: 'WEG', line: 'W22 Plus', model: 'W22 132M 10CV 4P', power: 10, powerUnit: 'cv', voltage: 220, nominalCurrent: 26.0, powerFactor: 0.82, efficiency: 0.895 },
  { id: 'weg-w22-50cv-220', manufacturer: 'WEG', line: 'W22 IR3 Premium', model: 'W22 225S/M 50CV 4P', power: 50, powerUnit: 'cv', voltage: 220, nominalCurrent: 121, powerFactor: 0.86, efficiency: 0.945 },
  { id: 'weg-w22-100cv-220', manufacturer: 'WEG', line: 'W22 IR3 Premium', model: 'W22 280S/M 100CV 4P', power: 100, powerUnit: 'cv', voltage: 220, nominalCurrent: 238, powerFactor: 0.87, efficiency: 0.954 },
  
  // Trifásico 380V
  { id: 'weg-w22-1cv-380', manufacturer: 'WEG', line: 'W22 Plus', model: 'W22 80 1CV 4P', power: 1, powerUnit: 'cv', voltage: 380, nominalCurrent: 1.75, powerFactor: 0.74, efficiency: 0.825 },
  { id: 'weg-w22-2cv-380', manufacturer: 'WEG', line: 'W22 Plus', model: 'W22 90S 2CV 4P', power: 2, powerUnit: 'cv', voltage: 380, nominalCurrent: 3.39, powerFactor: 0.75, efficiency: 0.84 },
  { id: 'weg-w22-5cv-380', manufacturer: 'WEG', line: 'W22 Plus', model: 'W22 112M 5CV 4P', power: 5, powerUnit: 'cv', voltage: 380, nominalCurrent: 7.81, powerFactor: 0.81, efficiency: 0.88 },
  { id: 'weg-w22-10cv-380', manufacturer: 'WEG', line: 'W22 Plus', model: 'W22 132M 10CV 4P', power: 10, powerUnit: 'cv', voltage: 380, nominalCurrent: 15.0, powerFactor: 0.82, efficiency: 0.895 },
  { id: 'weg-w22-50cv-380', manufacturer: 'WEG', line: 'W22 IR3 Premium', model: 'W22 225S/M 50CV 4P', power: 50, powerUnit: 'cv', voltage: 380, nominalCurrent: 69.8, powerFactor: 0.86, efficiency: 0.945 },
  { id: 'weg-w22-100cv-380', manufacturer: 'WEG', line: 'W22 IR3 Premium', model: 'W22 280S/M 100CV 4P', power: 100, powerUnit: 'cv', voltage: 380, nominalCurrent: 138, powerFactor: 0.87, efficiency: 0.954 },
];
