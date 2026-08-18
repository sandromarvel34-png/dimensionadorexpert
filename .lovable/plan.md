# Plan: Fix Voltage Drop Calculation Logic

Fix the critical bug where the voltage drop criterion for cable sizing was being treated as a verification of an already selected cable, rather than an independent dimensioning criterion based on the user's selected maximum allowable drop.

## User Review Required

> [!IMPORTANT]
> This change ensures that if you select a 1% voltage drop limit, the application will choose a cable thick enough to stay under that limit, even if a thinner cable would handle the current.

## Technical Details

### 1. Calculation Engine (`src/lib/engine/CalculationEngine.ts`)
- Refactor `getSectionByVoltageDrop`:
  - Calculate `requiredSection` using the formula $S = \frac{\sqrt{3} \cdot \rho \cdot L \cdot I_n \cdot \cos \varphi}{\Delta V_{máx} \cdot V} \cdot 100$.
  - Correctly map the calculated $S$ to the next available commercial cable section from the standard NBR 5410 table.
  - Return the determined commercial section and the *actual* resulting voltage drop for that specific section.
- Update `performFullCalculation`:
  - Ensure the final cable section is the `Math.max` of:
    1. Ampacity section (thermal limit).
    2. Voltage drop section (efficiency/standard limit).
    3. Minimum section for power circuits (2.5mm² per NBR 5410).

### 2. Educational Flow (`src/components/educational/EducationalFlow.tsx`)
- Update Step 4 (Voltage Drop) to use the engine's corrected logic.
- Ensure the LaTeX display reflects the logic of isolating $S$ in the formula.

### 3. Results View (`src/components/ResultsView.tsx`)
- Verify that "Seção Mín. (Queda)" and "Queda Final" correctly pull from the recalculated engine results.

### 4. Validation
- Test scenario: 30 CV, 220V, 3-phase, FS 1, 40m, 3% limit.
- Verification: Change limit to 1% or 2% and confirm the recommended cable increases appropriately.
- Verification: Test long distances (e.g., 200m) where voltage drop should clearly drive the result over ampacity.
