export type MotorPhase = 'monofasico' | 'trifasico';
export type PowerUnit = 'cv' | 'hp' | 'kW';
export type StarterType = 'direta' | 'reversao' | 'estrelaTriangulo' | 'softStarter' | 'inversor';

export interface TechnicalReference {
  id: string;
  standardName: string;
  version: string;
  section: string;
  description: string;
  sourceDocument?: string;
}

export interface CalculationInputs {
  dataSource: 'manual' | 'catalog';
  motorCatalogData?: {
    id: string;
    manufacturer: 'WEG';
    line: string;
    speedType: 'SINGLE' | 'DAHLANDER' | 'DOUBLE_WINDING';
    poles: string;
    model: string;
    nominalCurrent: number;
    powerFactor: number;
    efficiency: number;
    power: number;
    powerUnit: PowerUnit;
    voltage: number;
    rpm?: number;
    frame?: string;
    catalogReference?: string;
  };
  power: number;
  powerUnit: PowerUnit;
  voltage: number;
  phase: MotorPhase;
  distance: number;
  starterType: StarterType;
  maxVoltageDrop: number; // em %
  quantity: number;
  preferredManufacturer?: string | undefined;
  installationMethod?: string;
  groupingType?: string;
  groupingCount?: number;
  groupingFactor?: number;
  ambientTemperature?: number;
  ambientTempFactor?: number; // legado/compatibilidade
  soilThermalResistivity?: number; // K.m/W, aplicável ao método D
  powerFactor?: number;
  serviceFactor?: number;
  efficiency?: number;
}

export interface ManufacturerProduct {
  id: string;
  manufacturer: string;
  category: 'disjuntor' | 'fusivel' | 'contator' | 'releTermico' | 'releTempo' | 'disjuntorMotor' | 'cabo' | 'softStarter' | 'inverter' | 'auxiliar';
  model: string;
  commercialCode: string;
  description: string;
  nominalCurrent?: number;
  powerRange?: { min: number; max: number };
  voltage?: number;
  adjustmentRange?: { min: number; max: number };
  price?: number;
}

export interface TechnicalRequirement {
  category: ManufacturerProduct['category'];
  current?: number;
  voltage?: number;
  quantity: number;
  label: string;
  isOptional?: boolean;
}

export interface CalculationResults {
  nominalCurrent: number;
  cableByAmpacity: number; // mm²
  cableByVoltageDrop: number; // mm²
  finalCableSection: number; // mm²
  voltageDropCalculated: number; // %
  limitingCriterion: 'ampacity' | 'voltageDrop' | 'minimumSection';
  correctionFactors?: {
    temperature: number;
    grouping: number;
    soilResistivity: number;
    combined: number;
  };
  voltageDropModel?: 'resistiveApproximation';
  shortCircuitCheckPerformed?: boolean;
  technicalLimitations?: string[];
  technicalRequirements: TechnicalRequirement[];
  compatibleProducts: Record<string, Record<string, ManufacturerProduct[]>>; // Label -> Manufacturer -> Products
  protections: {
    breaker?: ManufacturerProduct | null;
    motorBreaker?: ManufacturerProduct | null;
    fuse?: ManufacturerProduct | null;
    diazedFuse?: ManufacturerProduct | null;
    nhFuse?: ManufacturerProduct | null;
    contactor?: ManufacturerProduct[] | null;
    thermalRelay?: ManufacturerProduct | null;
    timerRelay?: ManufacturerProduct | null;
    softStarter?: ManufacturerProduct | null;
    inverter?: ManufacturerProduct | null;
  };
  references: TechnicalReference[];
}