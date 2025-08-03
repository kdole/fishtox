import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { FishSample } from '../types/fish';
import { mmToInches } from '../utils/csvParser';
import { powerLawRegression, generateTrendLinePoints, RegressionResult } from '../utils/regression';

interface MercuryScatterPlotProps {
  data: FishSample[];
  selectedSpecies: string[];
}

interface PlotData {
  lengthInches: number;
  mercuryPpm: number;
  species: string;
  originalData: FishSample;
}

const SPECIES_COLORS = [
  '#1976d2', // Blue
  '#d32f2f', // Red
  '#388e3c', // Green
  '#f57c00', // Orange
  '#7b1fa2', // Purple
  '#0288d1', // Light Blue
  '#c2185b', // Pink
  '#5d4037', // Brown
  '#455a64', // Blue Grey
  '#e64a19', // Deep Orange
];

const getSpeciesColor = (species: string, allSpecies: string[]): string => {
  const index = allSpecies.indexOf(species);
  return SPECIES_COLORS[index % SPECIES_COLORS.length];
};

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload as PlotData & { isTrendPoint?: boolean };
    
    if (data.isTrendPoint) {
      // Don't show tooltips for trend line points
      return null;
    }
    
    return (
      <Paper sx={{ p: 1 }}>
        <Typography variant="body2">{data.species}</Typography>
        <Typography variant="body2">Length: {data.lengthInches.toFixed(1)}"</Typography>
        <Typography variant="body2">Mercury: {data.mercuryPpm.toFixed(3)} ppm</Typography>
      </Paper>
    );
  }
  return null;
};

export const MercuryScatterPlot: React.FC<MercuryScatterPlotProps> = ({ data, selectedSpecies }) => {
  const plotDataBySpecies = useMemo(() => {
    const speciesData: Record<string, PlotData[]> = {};
    
    data.forEach(fish => {
      const plotPoint = {
        lengthInches: mmToInches(fish.lengthMm),
        mercuryPpm: fish.mercuryPpm,
        species: fish.species,
        originalData: fish,
      };
      
      if (!speciesData[fish.species]) {
        speciesData[fish.species] = [];
      }
      speciesData[fish.species].push(plotPoint);
    });
    
    return speciesData;
  }, [data]);

  const regressionResults = useMemo(() => {
    const results: Record<string, { regression: RegressionResult; trendLine: any[] }> = {};
    
    Object.entries(plotDataBySpecies).forEach(([species, speciesData]) => {
      if (speciesData.length >= 5) { // Need minimum points for meaningful regression
        const xValues = speciesData.map(d => d.lengthInches);
        const yValues = speciesData.map(d => d.mercuryPpm);
        
        const regression = powerLawRegression(xValues, yValues);
        if (regression && regression.rSquared > 0.1) { // Only show if reasonably good fit
          const minX = Math.min(...xValues);
          const maxX = Math.max(...xValues);
          const trendPoints = generateTrendLinePoints(regression, minX, maxX);
          
          results[species] = {
            regression,
            trendLine: trendPoints,
          };
        }
      }
    });
    
    return results;
  }, [plotDataBySpecies]);


  // Create separate trend line datasets for each species
  const trendLineData = useMemo(() => {
    const trendData: Record<string, any[]> = {};
    
    Object.entries(regressionResults).forEach(([species, { trendLine }]) => {
      trendData[species] = trendLine.map(point => ({
        lengthInches: point.lengthInches,
        mercuryPpm: point.mercuryPpm,
        species,
        isTrendPoint: true,
      }));
    });
    
    return trendData;
  }, [regressionResults]);


  const { yAxisDomain, yAxisTicks } = useMemo(() => {
    const originalPoints = Object.values(plotDataBySpecies).flat();
    if (originalPoints.length === 0) return { yAxisDomain: [0, 1], yAxisTicks: [0, 0.5, 1] };
    
    const maxMercury = Math.max(...originalPoints.map(d => d.mercuryPpm));
    const maxDomain = Math.ceil(maxMercury * 1.1 * 10) / 10;
    
    // Generate nice tick values based on the max value
    let ticks: number[];
    if (maxDomain <= 0.1) {
      ticks = [0, 0.05, 0.1];
    } else if (maxDomain <= 0.2) {
      ticks = [0, 0.1, 0.2];
    } else if (maxDomain <= 0.5) {
      ticks = [0, 0.2, 0.4, maxDomain];
    } else if (maxDomain <= 1) {
      ticks = [0, 0.25, 0.5, 0.75, 1];
    } else {
      // For larger values, use automatic ticking
      ticks = [];
    }
    
    return { yAxisDomain: [0, maxDomain], yAxisTicks: ticks };
  }, [plotDataBySpecies]);

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" gutterBottom>
        Mercury vs Fish Length
        {selectedSpecies.length > 0 && ` - ${selectedSpecies.join(', ')}`}
      </Typography>
      
      <Box sx={{ width: '100%', height: { xs: 350, sm: 400 }, position: 'relative' }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 5, right: 5, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="lengthInches"
              type="number"
              label={{ value: 'Fish Length (inches)', position: 'insideBottom', offset: -8 }}
              domain={[0, 'dataMax']}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <YAxis
              dataKey="mercuryPpm"
              type="number"
              label={{ value: 'Mercury (ppm)', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle' } }}
              domain={yAxisDomain}
              ticks={yAxisTicks.length > 0 ? yAxisTicks : undefined}
              tickFormatter={(value) => value === 0 ? '0' : value.toFixed(2).replace(/\.?0+$/, '')}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Render scatter points for each species */}
            {Object.entries(plotDataBySpecies).map(([species, speciesData]) => (
              <Scatter
                key={species}
                data={speciesData}
                fill={getSpeciesColor(species, selectedSpecies)}
                fillOpacity={0.6}
                isAnimationActive={false}
                name={species}
              />
            ))}
            
            {/* Render trend lines as separate scatter series with line connection */}
            {Object.entries(trendLineData).map(([species, trendPoints]) => (
              <Scatter
                key={`trend-${species}`}
                data={trendPoints}
                fill="transparent"
                shape="circle"
                line={{ 
                  stroke: getSpeciesColor(species, selectedSpecies), 
                  strokeWidth: 2, 
                  strokeDasharray: '5 5' 
                }}
                isAnimationActive={false}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
      
      {selectedSpecies.length > 1 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedSpecies.map(species => {
            const regression = regressionResults[species]?.regression;
            const hasRegression = !!regression;
            
            return (
              <Chip
                key={species}
                label={
                  hasRegression 
                    ? `${species} (R² = ${regression.rSquared.toFixed(2)})`
                    : species
                }
                size="small"
                sx={{
                  backgroundColor: getSpeciesColor(species, selectedSpecies),
                  color: 'white',
                  '& .MuiChip-label': {
                    fontWeight: 500,
                  },
                }}
              />
            );
          })}
        </Box>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Note: FDA advisory level is 1.0 ppm
      </Typography>
    </Paper>
  );
};