# Plan: Project Creation and Branding Adjustments

The user wants to create a website for sizing electrical command devices and conductors based on ampacity and voltage drop criteria. Additionally, they've requested to hide the Lovable badge using CSS.

## Visual and Branding Edits
- Add a CSS rule to `src/styles.css` to hide the Lovable badge (`#lovable-badge` or similar selectors known to target it).
- Update `src/routes/__root.tsx` to set a relevant site title and description.

## Core Functionality: Electrical Command and Conductor Sizing
- Create a comprehensive UI for electrical sizing in `src/routes/index.tsx`.
- Implement calculation logic for:
  - **Ampacity (Capacidade de Condução de Corrente):** Based on installation method, number of conductors, and ambient temperature.
  - **Voltage Drop (Queda de Tensão):** Based on material (copper/aluminum), distance, current, and maximum allowed percentage.
  - **Command Device Sizing:** Selecting breakers/contactors based on load current and starting characteristics.

## Technical Details
- Use `lucide-react` for industrial-themed icons.
- Implement a reactive calculator using React state.
- Ensure the layout is responsive and professional (Engineering focus).
- Store physical constants (resistivity, correction factors) in a dedicated utility file.
