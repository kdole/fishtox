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
- Local state for component-specific UI
- No global state management (removed Zustand dependency)

## File Organization

```
src/
├── components/      # React components
├── hooks/          # Custom React hooks
├── utils/          # Pure utility functions (CSV parsing, data filtering)
├── types/          # TypeScript type definitions
└── App.tsx         # Main app component
```

## Pre-Commit Validation

Before marking any code task as complete, **ALWAYS run these commands in order**:

```bash
# 1. Type checking (must pass)
npm run typecheck

# 2. Linting (must pass)  
npm run lint

# 3. Run all tests (must pass)
npm test -- --watchAll=false

# 4. Build verification (must pass)
npm run build
```

All four commands must pass without errors. If any fail, fix the issues before proceeding.

## Test Infrastructure

The project has comprehensive test coverage:

### Test Files
- `src/utils/csvParser.test.ts` - CSV parsing and validation (8 tests)
- `src/utils/fishUtils.test.ts` - Species filtering utilities (6 tests)  
- `src/utils/regression.test.ts` - Power-law regression analysis (10 tests)
- `src/hooks/useUrlState.test.tsx` - URL state synchronization (16 tests)
- `src/App.test.tsx` - Basic component rendering (1 test)
- `src/setupTests.ts` - Jest configuration with @testing-library/jest-dom

### Test Commands
```bash
# Run all tests once (for CI/pre-commit)
npm test -- --watchAll=false

# Run tests with coverage report
npm test -- --watchAll=false --coverage

# Run specific test file
npm test -- --watchAll=false csvParser.test.ts

# Run tests in watch mode (for development)
npm test
```

### Testing Guidelines
- Maintain 100% test coverage for utility functions
- Mock external dependencies (React Router, Leaflet) properly
- Test both happy path and error conditions
- Use descriptive test names that explain the expected behavior
- Follow the existing mocking patterns for consistency

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
- **Charts**: Recharts for scatter plots with power-law regression
- **State**: React Router for URL state (with v7 future flags enabled)
- **UI**: Material-UI (MUI) components with default theme
- **Testing**: Jest + React Testing Library with comprehensive coverage
- **Build**: Create React App with TypeScript and strict type checking

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

## Current Project Status (Updated)

### Recent Improvements
- ✅ **Removed unused dependencies**: zustand, web-vitals
- ✅ **Enhanced type safety**: Replaced all `any[]` types with proper TypeScript interfaces
- ✅ **Added comprehensive test coverage**: 56 tests covering all utility functions and core logic
- ✅ **Resolved React Router warnings**: Added v7 future flags for seamless upgrades
- ✅ **Updated documentation**: Current README and CLAUDE.md reflect actual implementation

### Code Quality Metrics
- **Bundle size**: 280KB gzipped (optimized)
- **Test coverage**: 100% for utility functions (56 tests passing)
- **TypeScript**: Strict mode with no `any` types
- **Linting**: Clean ESLint output
- **Build**: Successful production builds

### Dependencies Status
- **React Router**: v6 with v7 future flags enabled
- **MUI**: Default theme, using built-in components
- **Testing**: Jest + @testing-library/react + @testing-library/jest-dom
- **Charts**: Recharts with power-law regression visualization
- **Maps**: React-Leaflet with URL state synchronization

Remember: Simple, clean, and fast. When in doubt, choose the simpler solution.