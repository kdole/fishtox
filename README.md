# FishTox

FishTox is a web application optimized for both mobile and desktop use that helps anglers understand mercury concentrations in fish. Currently focused on California data, the app enables users to make informed decisions about fish consumption based on mercury levels.

## Key Features

- **Fish Species Selection**: Autocomplete picker for selecting one or more fish species
- **Mercury Concentration Visualization**: Interactive plot showing mercury concentration (ppm) vs fish length (mm), since concentration typically increases with larger fish
- **Sample Location Mapping**: Map displaying where each fish sample was collected (latitude/longitude)
- **Data Table**: Detailed view of individual fish sample records
- **Species Comparison**: Compare mercury levels between two different fish species (color-coded)
- **Interactive Filtering**: Zooming on the map automatically filters the plot and data table to show only relevant samples
- **Shareable Views**: URL updates reflect current selections and filters, allowing users to share specific data views

## Data Source

Mercury concentration data is sourced from the California Environmental Data Exchange Network (CEDEN) at https://ceden.org/. The dataset includes approximately 22,500 fish samples with:
- Species name (common name)
- Mercury concentration (ppm)
- Fish length (mm)
- Sample location (latitude/longitude)

**Note**: Currently limited to species in the CEDEN database. Important pelagic species like bluefin tuna, yellowfin tuna, and yellowtail are not yet included but may be added in future updates.

## Architecture

FishTox is designed as a serverless application:
- The entire dataset (~1MB compressed CSV) is downloaded when the app loads
- All filtering, sorting, and visualization happens client-side
- No backend server required - just static file hosting
- Data updates are handled by regenerating the filtered dataset from CEDEN every 6-12 months

## Target Audience

The application is primarily designed for anglers who want to make informed decisions about which fish to keep and consume based on mercury contamination levels.

## Tech Stack

- **TypeScript + React**: Type-safe component development
- **Vite**: Fast build tool with excellent development experience
- **React Router**: URL state management for shareable views
- **Zustand**: Lightweight state management
- **Material-UI (MUI)**: Component library with excellent Autocomplete
- **Recharts**: Data visualization for mercury vs length plots
- **React-Leaflet**: Interactive maps for sample locations
- **PapaParse**: Client-side CSV parsing

## User Interface

### Species Picker
- Multi-select autocomplete that opens on click/focus
- Shows all available species immediately (no typing required)
- Typing filters the list (substring match, not just prefix)
- Selected species display as removable chips
- Mobile-friendly with touch optimization

### Data Visualization
- Scatter plot showing mercury concentration (ppm) vs fish length (mm)
- Color-coded by species when comparing
- Interactive tooltips showing exact values
- Responsive design adapts to screen size

### Map Interface
- Shows sample collection locations
- Zoom to filter data in plot and table
- Clusters nearby samples at low zoom levels
- Click samples for details

## Development Principles

1. **Performance First**: 
   - Minimize bundle size where possible
   - Lazy load components where appropriate
   - Optimize for mobile networks
   - Efficient data filtering (< 1000 points typically displayed)

2. **Simple & Clean**:
   - Prefer MUI components over custom builds
   - Keep dependencies minimal
   - Write clear, self-documenting code

3. **Type Safety**:
   - Use TypeScript strictly
   - Define clear interfaces for data structures
   - Avoid `any` types

4. **Mobile-First Design**:
   - Test on mobile devices frequently
   - Ensure touch-friendly interfaces
   - Optimize for smaller screens

5. **Data Handling**:
   - Parse CSV data once on load
   - Keep data transformations efficient
   - Use memoization for expensive calculations

## Project Structure

```
fishtox/
├── data/
│   └── filtered_ceden_mercury.csv
├── src/
│   ├── components/
│   │   ├── SpeciesPicker.tsx
│   │   ├── MercuryPlot.tsx
│   │   ├── SampleMap.tsx
│   │   └── DataTable.tsx
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── App.tsx
├── public/
├── README.md
├── CLAUDE.md
└── package.json
```

## Getting Started

(Coming soon - project setup instructions)