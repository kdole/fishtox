# FishTox

FishTox is a web application optimized for both mobile and desktop use that helps anglers understand mercury concentrations in fish. Currently focused on California data, the app enables users to make informed decisions about fish consumption based on mercury levels.

## Key Features

- **Fish Species Selection**: Autocomplete picker for selecting one or more fish species
- **Mercury Concentration Visualization**: Interactive scatter plot showing mercury concentration (ppm) vs fish length (inches) with power-law regression trend lines
- **Sample Location Mapping**: Interactive map displaying where each fish sample was collected
- **Species Comparison**: Compare mercury levels between multiple fish species with color-coding and R² values
- **Interactive Filtering**: Zooming on the map automatically filters the plot data
- **Shareable Views**: URL updates reflect current selections and filters, allowing users to share specific data views

## Data Source

Mercury concentration data is sourced from the California Environmental Data Exchange Network (CEDEN) at https://ceden.org/. The dataset includes approximately 22,500 fish samples with:
- Species name (common name)
- Mercury concentration (ppm wet weight)
- Fish length (converted from mm to inches for US anglers)
- Sample location (latitude/longitude)

**Note**: Currently limited to species in the CEDEN database. Important pelagic species like bluefin tuna, yellowfin tuna, and yellowtail are not yet included but may be added in future updates.

## Architecture

FishTox is designed as a serverless, client-side application:
- The entire dataset (~1MB compressed CSV) is downloaded when the app loads
- All filtering, sorting, and visualization happens client-side
- No backend server required - just static file hosting
- Data updates are handled by regenerating the filtered dataset from CEDEN periodically

## Tech Stack

- **TypeScript + React**: Type-safe component development with strict typing
- **Create React App**: Build tooling and development environment
- **React Router**: URL state management for shareable views (with v7 future flags)
- **Material-UI (MUI)**: Component library for consistent UI
- **Recharts**: Data visualization for mercury vs length scatter plots
- **React-Leaflet**: Interactive maps for sample locations
- **PapaParse**: Client-side CSV parsing
- **Jest + Testing Library**: Comprehensive test coverage

## Development Workflow

### Pre-Commit Checklist

Before committing code, **always run these commands** in order:

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

### Optional Quality Checks

```bash
# Run tests with coverage report
npm test -- --watchAll=false --coverage

# Test individual components
npm test -- --watchAll=false src/utils/csvParser.test.ts
```

## Project Structure

```
fishtox/
├── data/
│   └── filtered_ceden_mercury.csv    # Source data (22.5k samples)
├── public/
│   ├── data/
│   │   └── filtered_ceden_mercury.csv # Served data copy
│   └── CNAME                         # Custom domain for GitHub Pages
├── src/
│   ├── components/
│   │   ├── FishToxMain.tsx           # Main app component
│   │   ├── SpeciesPicker.tsx         # Multi-select species picker
│   │   ├── MercuryScatterPlot.tsx    # Plot with regression analysis
│   │   └── FishMap.tsx               # Interactive Leaflet map
│   ├── hooks/
│   │   └── useUrlState.ts            # URL state synchronization
│   ├── utils/
│   │   ├── csvParser.ts              # Data parsing and validation
│   │   ├── fishUtils.ts              # Species filtering utilities
│   │   └── regression.ts             # Power-law regression analysis
│   ├── types/
│   │   └── fish.ts                   # TypeScript interfaces
│   ├── setupTests.ts                 # Jest test configuration
│   └── App.tsx                       # Root component with routing
├── README.md
├── CLAUDE.md                         # AI assistant instructions
├── tsconfig.json                     # TypeScript configuration
└── package.json
```

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server (opens http://localhost:3000)
npm start

# Run tests in watch mode
npm test

# Run tests once (for CI)
npm test -- --watchAll=false

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build
```

### Testing

The project has comprehensive test coverage for:
- CSV data parsing and validation
- Species filtering and utilities
- Power-law regression calculations
- URL state management
- Component rendering

```bash
# Run all tests
npm test -- --watchAll=false

# Run tests with coverage
npm test -- --watchAll=false --coverage

# Run specific test file
npm test -- --watchAll=false csvParser.test.ts
```

### Deployment

The app is deployed to GitHub Pages at https://fishtox.com

```bash
# Deploy to GitHub Pages
npm run deploy
```

Deployment is configured to:
- Build the production bundle
- Push to the `gh-pages` branch
- Serve from custom domain fishtox.com
- Handle DNS configuration automatically

### Repository

- **GitHub**: https://github.com/kdole/fishtox
- **Live Site**: https://fishtox.com
- **Status**: Public repository (required for free GitHub Pages)

## Key Features in Detail

### Species Picker
- Multi-select autocomplete that opens on click/focus
- Shows all available species immediately (no typing required)
- Typing filters the list (substring match)
- Selected species display as removable chips
- Mobile-friendly with touch optimization

### Mercury Visualization
- Scatter plot showing mercury concentration (ppm) vs fish length (inches)
- Power-law regression trend lines with R² values
- Color-coded by species when comparing multiple species
- Interactive tooltips showing exact values
- FDA advisory level (1.0 ppm) reference line
- Responsive design adapts to screen size

### Interactive Map
- Shows sample collection locations as markers
- Zoom and pan to filter data in plot
- Map bounds synchronize with URL for sharing
- Efficient rendering of large datasets

## Development Principles

1. **Performance First**: 
   - Bundle size optimized (~280KB gzipped)
   - Efficient data filtering with memoization
   - Client-side processing for fast interactions

2. **Type Safety**:
   - Strict TypeScript with no `any` types
   - Comprehensive interface definitions
   - Full type coverage including tests

3. **Code Quality**:
   - 100% test coverage for utility functions
   - Consistent linting with ESLint
   - Pre-commit validation pipeline

4. **Mobile-First Design**:
   - Touch-friendly interfaces
   - Responsive layouts
   - Optimized for mobile network conditions

5. **Maintainability**:
   - Clear separation of concerns
   - Minimal dependencies
   - Self-documenting code with TypeScript

## Contributing

This is an open-source project. Contributions that improve data accuracy, add new features, or enhance the user experience are welcome.

### Development Guidelines

1. Follow the pre-commit checklist before submitting PRs
2. Maintain test coverage for new features
3. Follow existing TypeScript patterns
4. Use MUI components before building custom ones
5. Keep mobile experience as the priority

### Common Tasks

- **Adding new data sources**: Update `csvParser.ts` and corresponding types
- **UI improvements**: Modify components in `src/components/`
- **Performance optimization**: Profile with React DevTools, optimize memoization
- **New visualizations**: Extend `MercuryScatterPlot.tsx` or create new components