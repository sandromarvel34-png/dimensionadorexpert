# Design System Re-structuring: "Dimensionador de Comandos Elétricos"

This plan focuses exclusively on visual restructuring to achieve a premium SaaS design system based on the provided reference. Technical logic and database integration remain untouched.

## Visual Design System (Tokens)

- **Typography**: Single font family (Inter) with a standardized scale (12px, 14px, 16px, 18-20px, 28-32px, 40-48px) and weights (400, 500, 600, 700).
- **Colors**:
  - Background: `#F8FAFC`
  - Cards: `#FFFFFF`
  - Primary Text: `#0F172A`
  - Secondary Text: `#64748B`
  - Borders: `#E2E8F0`
  - Primary Action: `#2563EB` (Hover: `#1D4ED8`)
  - Semantic: Success (`#16A34A`), Alert (`#D97706`), Error (`#DC2626`).
- **Spacing**: 4, 8, 12, 16, 24, 32, 48, 64px.
- **Components**:
  - Cards: Radius 14px, 24px padding, subtle shadow.
  - Inputs/Selects: 44-48px height, Radius 8-10px, border `#CBD5E1`.
  - Buttons: Primary (Blue), Secondary (White/Border), Ghost (Transparent).

## Technical Implementation

### 1. Global Styles (`src/styles.css`)
- Update CSS variables in `@theme` and `:root`.
- Standardize utility classes for Typography and Spacing.
- Refine print styles to maintain compactness.

### 2. Component Refactoring (shadcn/ui)
- **Button**: Standardize heights and variants (Primary, Secondary, Ghost).
- **Input/Textarea**: Standardize heights, borders, and focus states.
- **Select**: Fix stacking/portal issues and standardize trigger/content styling.
- **Card**: Standardize radius, padding, and shadow.

### 3. Layout and Navigation (`src/components/AppLayout.tsx`)
- Standardize the global Header with a consistent brand and navigation style.
- Ensure vertical alignment and spacing are perfect.

### 4. Application-wide Adoption
- Update `Dashboard.tsx`, `CalculatorWizard.tsx`, `ResultsView.tsx`, and `ProposalFlow.tsx` to use the new design tokens and refactored components.
- Ensure all margins, paddings, and font sizes follow the new scale.
- Verify responsiveness across mobile, tablet, and desktop.

### 5. Accessibility and Polish
- Ensure proper color contrast, focus indicators, and keyboard navigation.
- Add discrete transitions (150-200ms) for interactive elements.

## User Review Required

> [!IMPORTANT]
> This stage is **purely visual**. No formulas, NBR 5410 rules, or database logic will be changed.

- **Constraint**: Yellow is used only as a technical accent (electrical identity).
- **Constraint**: Select dropdowns must not push layout or overlap labels incorrectly.
