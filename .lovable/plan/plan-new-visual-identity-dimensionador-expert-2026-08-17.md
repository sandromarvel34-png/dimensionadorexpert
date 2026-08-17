# Plan: New Visual Identity - Dimensionador Expert

Update the application's visual identity to "Dimensionador Expert" by "Academia do Eletricista", replacing the current Zap icon with the provided "AE" logo.

## Proposed Changes

### 1. Asset Preparation
- Create a favicon from the uploaded AE logo.
- Scale and center the logo into a 64x64 square `public/favicon.png`.
- Delete the default `public/favicon.ico`.

### 2. Layout & Component Updates
- **`src/components/AppLayout.tsx`**:
    - Replace the "Zap" icon with the "AE" logo in the header.
    - Update the product name from "Dimensionador" to "Dimensionador Expert".
    - Add the subtitle "By Academia do Eletricista" below the brand name.
- **`src/components/Dashboard.tsx`**:
    - Update the Hero section heading or subtitle to reflect the new "Expert" branding.
- **`src/components/CalculatorWizard.tsx`**:
    - Update page title or context to use "Dimensionador Expert".
- **`src/routes/__root.tsx`**:
    - Update the page `<title>` and Open Graph metadata to "Dimensionador Expert".
    - Update the favicon link to use `/favicon.png`.

### 3. Styles & Polish
- Ensure the logo fits naturally in the header (removing background if necessary via CSS or using the provided image).
- Maintain the "Premium" design system while integrating the new brand colors (Orange/Blue) from the logo into subtle accents if they don't clash with the existing theme.

## Technical Details
- **Favicon Creation**: `nix run nixpkgs#imagemagick -- magick /mnt/user-uploads/file-18 -resize 64x64 -background none -gravity center -extent 64x64 public/favicon.png`
- **Logo Integration**: Using the imported asset pointer `logoAeAsset.url`.
- **Metadata**: Global updates to SEO tags.
