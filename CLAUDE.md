# Claude Code Instructions for FishTox

This document provides specific instructions for AI assistants (particularly Claude Code) working on the FishTox project.

## Project Overview

FishTox is a client-side web application that helps California anglers understand mercury levels in fish. The entire dataset loads on page load, and all interactions happen client-side. The app should be fast, simple, and mobile-friendly.

## Key Constraints

1. **No Backend**: This is a static site. Do not create API endpoints, servers, or backend code.
2. **Performance Matters**: The app loads ~1MB of CSV data (~22,500 fish samples). Keep additional JS bundle minimal.
3. **Mobile First**: Primary users are anglers checking data on their phones at fishing spots.
4. **Data is Static**: The CSV in `/data` is the source of truth. Don't fetch external data.
5. **Browser Support**: Use modern ES6+ features with Create React App defaults.

## Code Style Guidelines

### TypeScript
- Use strict TypeScript with no `any` types
- Define interfaces for all data structures, especially:
  ```typescript
  interface FishSample {
    species: string;        // From CompositeCommonName column
    mercuryPpm: number;     // From Result column (wet weight)
    lengthMm: number;       // From TLAvgLength(mm) column
    latitude: number;       // From latitude column
    longitude: number;      // From longitude column
  }
  ```
- Use type inference where obvious, explicit types where helpful

### React Patterns
- Functional components only (no class components)
- Use MUI components before building custom ones
- Keep components focused and single-purpose
- Memoize expensive calculations with `useMemo`

### State Management
- URL state (via React Router) for shareable views
- Zustand for global app state
- Local state for component-specific UI

## File Organization

```
src/
├── components/      # React components
├── hooks/          # Custom React hooks
├── utils/          # Pure utility functions (CSV parsing, data filtering)
├── types/          # TypeScript type definitions
└── App.tsx         # Main app component
```

## Testing Commands

Before marking any code task as complete, run:
```bash
npm run build
npm run lint
npm run typecheck
```

## Key Features to Preserve

1. **Species Picker**: Must show all options on focus, filter with substring match
2. **URL State**: Selections and filters must update the URL
3. **Map-Plot Interaction**: Zooming the map filters the plot data
4. **Performance**: Keep renders efficient with < 1000 data points

## Common Pitfalls to Avoid

1. Don't add unnecessary dependencies
2. Don't create custom components if MUI has one
3. Don't fetch data from APIs - use the local CSV
4. Don't forget mobile touch interactions
5. Don't use `Array.filter()` repeatedly - filter once, reuse results

## MUI Theme Considerations

- Use the default MUI theme to start
- Only customize if explicitly requested
- Ensure sufficient contrast for outdoor viewing

## When Working on Features

1. Read the existing code first
2. Check if MUI has a component for the need
3. Consider mobile UX before implementing
4. Test with the actual CSV data, not mocked data
5. Update types if data structure changes

## Data Details

### CSV Structure
- **File**: `/data/filtered_ceden_mercury.csv`
- **Size**: ~22,500 rows
- **Columns**:
  - `CompositeCommonName`: Species common name (display as "Species")
  - `Result`: Mercury concentration in ppm wet weight (display as "Mercury (ppm)")
  - `TLAvgLength(mm)`: Average total length in mm (display as "Length" and convert to inches)
  - `latitude`: Decimal degrees
  - `longitude`: Decimal degrees

### Unit Conversions
- Length: 1 inch = 25.4 mm (display lengths in inches for US anglers)
- Mercury: Display as ppm with 2-3 decimal places

## Technology Stack

- **Map**: React-Leaflet (lightweight, no API key required)
- **Charts**: Consider Recharts or Victory for scatter plots
- **State**: Zustand for global state, React Router for URL state
- **Build**: Create React App with TypeScript

## Deployment

The app is deployed to GitHub Pages at https://fishtox.com

### Deployment Setup
- **Hosting**: GitHub Pages (free, requires public repo)
- **Domain**: Custom domain fishtox.com via Namecheap
- **Package**: Uses `gh-pages` npm package for deployment
- **Branch**: Deploys from `gh-pages` branch (auto-generated)

### Deploy Commands
```bash
npm run deploy  # Builds and deploys to GitHub Pages
```

### Domain Configuration (Already Set Up)
- **Namecheap DNS**:
  - 4 A Records pointing to GitHub Pages IPs (185.199.108-111.153)
  - CNAME record: www → kdole.github.io
- **GitHub Pages**:
  - Custom domain: fishtox.com
  - HTTPS enforced
  - Deploy from gh-pages branch root

### Important Files
- `public/CNAME`: Contains "fishtox.com" for custom domain
- `package.json`: Contains "homepage": "https://fishtox.com"

### Repository
- **GitHub**: https://github.com/kdole/fishtox
- **Status**: Public repository (required for free GitHub Pages)
- **Live Site**: https://fishtox.com

Remember: Simple, clean, and fast. When in doubt, choose the simpler solution.