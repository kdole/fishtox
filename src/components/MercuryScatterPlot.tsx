import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import { FishSample } from '../types/fish';
import { mmToInches } from '../utils/csvParser';

interface MercuryScatterPlotProps {
  data: FishSample[];
  selectedSpecies: string | null;
}

interface PlotData {
  lengthInches: number;
  mercuryPpm: number;
  species: string;
  originalData: FishSample;
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload as PlotData;
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
  const plotData = useMemo(() => {
    return data.map(fish => ({
      lengthInches: mmToInches(fish.lengthMm),
      mercuryPpm: fish.mercuryPpm,
      species: fish.species,
      originalData: fish,
    }));
  }, [data]);

  const { yAxisDomain, yAxisTicks } = useMemo(() => {
    if (plotData.length === 0) return { yAxisDomain: [0, 1], yAxisTicks: [0, 0.5, 1] };
    
    const maxMercury = Math.max(...plotData.map(d => d.mercuryPpm));
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
  }, [plotData]);

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" gutterBottom>
        Mercury vs Fish Length
        {selectedSpecies && ` - ${selectedSpecies}`}
      </Typography>
      
      <Box sx={{ width: '100%', height: { xs: 350, sm: 400 } }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 5, right: 5, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="lengthInches"
              type="number"
              label={{ value: 'Fish Length (inches)', position: 'insideBottom', offset: -4 }}
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
            <Scatter
              data={plotData}
              fill="#1976d2"
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Note: FDA advisory level is 1.0 ppm
      </Typography>
    </Paper>
  );
};