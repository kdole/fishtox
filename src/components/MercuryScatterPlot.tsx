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

  const yAxisDomain = useMemo(() => {
    if (plotData.length === 0) return [0, 1];
    const maxMercury = Math.max(...plotData.map(d => d.mercuryPpm));
    return [0, Math.ceil(maxMercury * 1.1 * 10) / 10];
  }, [plotData]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Mercury vs Fish Length
        {selectedSpecies && ` - ${selectedSpecies}`}
      </Typography>
      
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="lengthInches"
              type="number"
              label={{ value: 'Fish Length (inches)', position: 'insideBottom', offset: -10 }}
              domain={[0, 'dataMax']}
            />
            <YAxis
              dataKey="mercuryPpm"
              type="number"
              label={{ value: 'Mercury (ppm)', angle: -90, position: 'insideLeft' }}
              domain={yAxisDomain}
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