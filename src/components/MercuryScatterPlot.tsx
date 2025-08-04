import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps, ReferenceArea } from 'recharts';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { FishSample } from '../types/fish';
import { mmToInches } from '../utils/csvParser';
import { powerLawRegression, generateTrendLinePoints, RegressionResult, TrendLinePoint } from '../utils/regression';

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

// California OEHHA Advisory Tissue Levels (ATLs) for mercury
// For general population (Women >45 and men) - converted from ppb to ppm
const MERCURY_ATLS = [
  { servings: 7, threshold: 0.094, color: '#1b5e20', label: '7/wk' }, // Dark green
  { servings: 6, threshold: 0.109, color: '#2e7d32', label: '6/wk' }, // Green
  { servings: 5, threshold: 0.130, color: '#388e3c', label: '5/wk' }, // Medium green
  { servings: 4, threshold: 0.160, color: '#ffc107', label: '4/wk' }, // Yellow
  { servings: 3, threshold: 0.220, color: '#ff9800', label: '3/wk' }, // Orange
  { servings: 2, threshold: 0.440, color: '#f57c00', label: '2/wk' }, // Dark orange
  { servings: 1, threshold: 1.310, color: '#d32f2f', label: '1/wk' }, // Red
  { servings: 0, threshold: Infinity, color: '#b71c1c', label: '0/wk' }, // Dark red
];

const getServingRecommendation = (mercuryPpm: number): string => {
  for (const atl of MERCURY_ATLS) {
    if (mercuryPpm <= atl.threshold) {
      return atl.servings === 0 ? 'Avoid consumption' : `${atl.servings} servings/week max`;
    }
  }
  return 'Avoid consumption';
};

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload as PlotData & { isTrendPoint?: boolean };
    
    if (data.isTrendPoint) {
      // Don't show tooltips for trend line points
      return null;
    }
    
    const servingRec = getServingRecommendation(data.mercuryPpm);
    
    return (
      <Paper sx={{ p: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{data.species}</Typography>
        <Typography variant="body2">Length: {data.lengthInches.toFixed(1)}"</Typography>
        <Typography variant="body2">Mercury: {data.mercuryPpm.toFixed(3)} ppm</Typography>
        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {servingRec}
        </Typography>
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
    const results: Record<string, { regression: RegressionResult; trendLine: TrendLinePoint[] }> = {};
    
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
    const trendData: Record<string, Array<TrendLinePoint & { species: string; isTrendPoint: boolean }>> = {};
    
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


  const { yAxisDomain, yAxisTicks, mercuryZones } = useMemo(() => {
    const originalPoints = Object.values(plotDataBySpecies).flat();
    if (originalPoints.length === 0) return { 
      yAxisDomain: [0, 1], 
      yAxisTicks: [0, 0.5, 1],
      mercuryZones: []
    };
    
    const maxMercury = Math.max(...originalPoints.map(d => d.mercuryPpm));
    const maxDomain = Math.ceil(maxMercury * 1.1 * 10) / 10;
    
    // Determine the actual Y-axis max based on the tick logic
    let yAxisMax: number;
    let ticks: number[];
    if (maxDomain <= 0.1) {
      yAxisMax = 0.1;
      ticks = [0, 0.02, 0.04, 0.06, 0.08, 0.1];
    } else if (maxDomain <= 0.2) {
      yAxisMax = 0.2;
      ticks = [0, 0.05, 0.1, 0.15, 0.2];
    } else if (maxDomain <= 0.5) {
      yAxisMax = 0.5;
      ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    // } else if (maxDomain <= 1) {
    //   yAxisMax = 1;
    //   ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];
    } else {
      yAxisMax = maxDomain;
      // For larger values, use automatic ticking
      ticks = [];
    }
    
    // Generate ATL zones that cover the full Y-axis range
    const visibleZones = [];
    let prevThreshold = 0;
    
    for (let i = 0; i < MERCURY_ATLS.length; i++) {
      const atl = MERCURY_ATLS[i];
      let zoneTop;
      
      if (atl.threshold === Infinity || atl.threshold >= yAxisMax) {
        // This is the final zone - extend it to the Y-axis max
        zoneTop = yAxisMax;
      } else {
        zoneTop = atl.threshold;
      }
      
      if (zoneTop > prevThreshold) {
        visibleZones.push({
          ...atl,
          y1: prevThreshold,
          y2: zoneTop,
        });
        
        // If this zone reaches yAxisMax, we're done
        if (zoneTop >= yAxisMax) break;
      }
      
      prevThreshold = atl.threshold;
    }
    
    return { yAxisDomain: [0, yAxisMax], yAxisTicks: ticks, mercuryZones: visibleZones };
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
            
            {/* ATL Background Zones */}
            {mercuryZones.map((zone) => (
              <ReferenceArea
                key={`zone-${zone.servings}`}
                y1={zone.y1}
                y2={zone.y2}
                fill={zone.color}
                fillOpacity={0.25}
                stroke={zone.color}
                strokeOpacity={0.4}
                strokeWidth={1}
                label={{ 
                  value: zone.label, 
                  position: 'insideBottomLeft',
                  style: {
                    fill: zone.color,
                    fontWeight: 'bold',
                    fontSize: '12px',
                    textShadow: '1px 1px 1px rgba(255,255,255,0.8)'
                  }
                }}
              />
            ))}
            
            
            
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
        California OEHHA Advisory Tissue Levels show safe consumption rates (servings/week). 
        Based on general population recommendations.
      </Typography>
    </Paper>
  );
};