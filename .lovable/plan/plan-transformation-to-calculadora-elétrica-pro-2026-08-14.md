# Plan: Transformation to Calculadora Elétrica Pro

This plan transforms the current electrical sizing tool into a premium product named **Calculadora Elétrica Pro**, focusing on high conversion, professional UX, and robust technical calculations.

## 1. Core Visual and Brand Identity
- Rename the product across all routes and components.
- Implement the "ACESSO VITALÍCIO" badge and professional tagline: "Dimensione. Confira. Decida."
- Update metadata and SEO for the new brand.

## 2. Dashboard Overhaul
- Replace the current index with an action-oriented dashboard.
- Add a "Novo Dimensionamento" hero section with a primary CTA button.
- Create "O que você recebe" cards to communicate value (Sized Conductor, Voltage Drop, Protection, etc.).
- Implement a "Meus Dimensionamentos" section (accessible via local storage for now, or Supabase if available) with search, filters, and CRUD actions.

## 3. Multi-Step Wizard
- Refactor the single-page form into a 4-step wizard:
    - **Step 1: Carga** (Power, Voltage, Type of Start).
    - **Step 2: Circuito** (Distance, Max Voltage Drop, Environment).
    - **Step 3: Proteção e Comando** (Manufacturer preference).
    - **Step 4: Resultado** (The final solution).
- Implement a progress indicator (mobile-friendly).

## 4. Enhanced Calculation Engine
- Ensure calculations never return `NaN`, `Infinity`, or `0 mm²`.
- Add robust validation and "unable to determine" fallback messages.
- Refine manufacturer logic to show real catalog products (WEG, Siemens, Schneider).

## 5. Premium Result Screen
- Hero card for "CONDUTOR DIMENSIONADO" (e.g., "6 mm²").
- "Solução recomendada" grid with detail toggles for Breaker, Contactor, and Thermal Relay.
- Manufacturer comparison table for components.

## 6. Calculation Memory
- Detailed modal/section showing:
    - Design Current (Formula + Data).
    - Criterion 1 (Ampacity): Section, factors, status.
    - Criterion 2 (Voltage Drop): Distance, limit, status.
    - Final Selection logic.

## Technical Details
- **Styling**: Tailwind CSS v4 with the existing dark industrial theme.
- **Routing**: TanStack Router.
- **State**: React `useState` and `useMemo` for real-time calculations.
- **Components**: Shadcn/ui (Button, Card, Input, Progress, Dialog).

## Validation Plan
- Verify all formulas against NBR 5410.
- Test edge cases (extremely long distances, high power) for "unable to determine" logic.
- Ensure responsive design works on mobile devices.
