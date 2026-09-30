export type MotorPhase = 'monofasico' | 'trifasico';
export type PowerUnit = 'cv' | 'hp' | 'kW';
export type StarterType = 'direta' | 'reversao' | 'estrelaTriangulo' | 'softStarter' | 'inversor';

export interface CompanyProfile {
  companyName: string;
  document: string;
  responsibleName: string;
  professionalRegistration: string;
  phone: string;
  email: string;
  address: string;
  cityState: string;
  website: string;
  logoDataUrl: string;
  brandColor: string;
  logoBackground: 'light' | 'dark' | 'brand';
}

export type ProposalStatus = 'rascunho' | 'enviada' | 'aprovada' | 'recusada';

export interface ProposalLineItem {
  id: string;
  desc: string;
  qtd: number;
  unit?: string;
  price: number | string;
}

export interface SavedProposal {
  id: string;
  calculationHistoryId: string | null;
  createdAt: string;
  updatedAt: string;
  status: ProposalStatus;
  clientData: {
    name: string;
    doc: string;
    phone: string;
    email: string;
  };
  commercialData: {
    serviceDescription: string;
    technicianName: string;
    executingCompany: string;
  };
  observations: string;
  items: ProposalLineItem[];
  labor: {
    hours: number;
    rate: number;
  };
  costs: {
    travel: number;
    others: number;
    discount: number;
    validity: number;
  };
  selectedManufacturer: 'WEG' | 'Siemens' | 'Schneider';
  companyProfile: CompanyProfile;
  currentInputs: CalculationInputs;
  currentResults: CalculationResults;
  total: number;
}

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
  buriedCableConfiguration?: 'unipolarDuct' | 'multipolarDuct';
  shortCircuitCurrentKA?: number; // corrente de falta presumida no ponto (kA)
  shortCircuitDurationSeconds?: number; // tempo de eliminação da falta (s), até 5 s
  voltageDropArrangement?: 'auto' | 'adjacent' | 'multipolar' | 'spaced2D' | 'spaced13cm' | 'spaced20cm' | 'trefoil';
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
  voltageRange?: { min: number; max: number };
  controlVoltage?: number;
  poles?: number;
  utilizationCategory?: string;
  breakingCapacityKA?: number;
  verificationStatus?: 'verified-exact' | 'verified-family' | 'blocked';
  catalogSource?: string;
  selectionNote?: string;
  lifecycle?: 'active' | 'legacy' | 'phase-out';
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
  limitingCriterion: 'ampacity' | 'voltageDrop' | 'minimumSection' | 'shortCircuit';
  correctionFactors?: {
    temperature: number;
    grouping: number;
    soilResistivity: number;
    combined: number;
  };
  voltageDropModel?: 'resistiveApproximation' | 'acImpedanceRX';
  voltageDropRequiredSectionTheoretical?: number;
  voltageDropPreliminaryCommercialSection?: number;
  voltageDropArrangementUsed?: 'adjacent' | 'multipolar' | 'spaced2D' | 'spaced13cm' | 'spaced20cm' | 'trefoil';
  voltageDropResistanceOhmKm?: number;
  voltageDropReactanceOhmKm?: number;
  cableByShortCircuit?: number;
  shortCircuitWithstandCurrentKA?: number;
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