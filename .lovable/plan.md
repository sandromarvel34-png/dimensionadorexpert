# Plan: Motor and Installation Data UI Restructuring

Refine the data entry process to separate motor technical data from installation parameters and enhance the selection of grouping and temperature factors.

## User Requirements
- **Motor Data**: Move Service Factor (FS) from installation to motor data.
- **Grouping**: Indicate types of groupings instead of just factors.
- **Temperature**: Indicate actual temperatures instead of just factors.

## Proposed Changes

### 1. Model and Engine Updates
- Update `CalculationEngine.ts` to include lookup tables for grouping methods and ambient temperatures based on NBR 5410.

### 2. UI Updates (`src/components/CalculatorWizard.tsx`)
- **Motor Data Section**:
    - Add "Fator de Serviço (FS)" field to the Manual Motor Data section.
    - If Catalog is selected, display the FS if available (or a manual override).
- **Installation Data Section**:
    - Replace the generic `groupingFactor` input with a `Select` component listing NBR 5410 grouping types (e.g., "Em feixe ao ar livre", "Camada única na parede").
    - Replace the generic `tempFactor` input with a `Select` component listing temperatures (e.g., "30°C", "35°C", "40°C") for PVC insulation.
    - Remove Service Factor from this section.

### 3. State Management
- Map the selected grouping type and temperature to their respective numeric factors (f1 and f2) before performing calculations.

## Technical Details
- **Grouping Factors (f1)**: Implement a mapping for common installation methods (ref. NBR 5410 Table 42).
- **Temperature Factors (f2)**: Implement a mapping for ambient temperatures (ref. NBR 5410 Table 40 for PVC 70°C).
- **Service Factor (FS)**: Ensure it's passed correctly from the Motor Data state to the calculation engine.

## Visual Changes
- Reorder fields in `CalculatorWizard.tsx` to reflect the logical separation.
- Update labels to be more descriptive for professionals.
