import { CalculationEngine } from './src/lib/engine/CalculationEngine';

const commonInputs: any = {
  power: 30,
  powerUnit: 'cv',
  voltage: 220,
  phase: 'trifasico',
  powerFactor: 0.85,
  efficiency: 0.90,
  serviceFactor: 1.0,
  distance: 40,
  groupingType: 'B1',
  groupingCount: 1,
  ambientTempFactor: 1.0,
  preferredManufacturer: 'WEG',
  starterType: 'direta',
  dataSource: 'manual'
};

[1, 2, 3, 4].forEach(drop => {
  const results = CalculationEngine.performFullCalculation({
    ...commonInputs,
    maxVoltageDrop: drop
  });
  console.log(`Drop ${drop}%: Ampacity=${results.cableByAmpacity}mm2, VoltageDrop=${results.cableByVoltageDrop}mm2, Final=${results.finalCableSection}mm2, RealDrop=${results.voltageDropCalculated.toFixed(2)}%`);
});

// Test long distance
const longDist = CalculationEngine.performFullCalculation({
  ...commonInputs,
  distance: 200,
  maxVoltageDrop: 2
});
console.log(`Long Distance 200m @ 2%: Ampacity=${longDist.cableByAmpacity}mm2, VoltageDrop=${longDist.cableByVoltageDrop}mm2, Final=${longDist.finalCableSection}mm2, RealDrop=${longDist.voltageDropCalculated.toFixed(2)}%`);
