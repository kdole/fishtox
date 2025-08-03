import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Paper, Typography, Box } from '@mui/material';
import { FishSample } from '../types/fish';
import { mmToInches } from '../utils/csvParser';
import type { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FishMapProps {
  data: FishSample[];
  selectedSpecies: string[];
  onBoundsChange?: (bounds: LatLngBounds) => void;
  initialBounds?: LatLngBounds;
}

const getMarkerColor = (mercuryPpm: number): string => {
  if (mercuryPpm >= 1.0) return '#d32f2f'; // Red for high mercury (FDA advisory level)
  if (mercuryPpm >= 0.5) return '#ff9800'; // Orange for medium mercury
  return '#4caf50'; // Green for low mercury
};

// Component to track map bounds changes
const MapBoundsTracker: React.FC<{ onBoundsChange?: (bounds: LatLngBounds) => void }> = ({ onBoundsChange }) => {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    },
    zoomend: () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    },
  });

  useEffect(() => {
    // Report initial bounds
    if (onBoundsChange) {
      onBoundsChange(map.getBounds());
    }
  }, [map, onBoundsChange]);

  return null;
};

// Component to fit map to data bounds only on initial load
const FitBounds: React.FC<{ 
  bounds?: [[number, number], [number, number]]; 
  initialBounds?: LatLngBounds;
}> = ({ bounds, initialBounds }) => {
  const map = useMap();
  const hasFitted = useRef(false);
  
  useEffect(() => {
    if (!hasFitted.current) {
      if (initialBounds) {
        map.fitBounds(initialBounds);
      } else if (bounds) {
        map.fitBounds(bounds);
      }
      hasFitted.current = true;
    }
  }, [map, bounds, initialBounds]);
  
  return null;
};

export const FishMap: React.FC<FishMapProps> = ({ data, selectedSpecies, onBoundsChange, initialBounds }) => {
  const { center, bounds } = useMemo(() => {
    if (data.length === 0) {
      // Default to California center
      return {
        center: [36.7783, -119.4179] as [number, number],
        bounds: undefined,
      };
    }

    const lats = data.map(fish => fish.latitude);
    const lngs = data.map(fish => fish.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    return {
      center: [centerLat, centerLng] as [number, number],
      bounds: [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]],
    };
  }, [data]);

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" gutterBottom>
        Sample Locations
        {selectedSpecies.length > 0 && ` - ${selectedSpecies.join(', ')}`}
      </Typography>
      
      <Box sx={{ height: 400, width: '100%' }}>
        <MapContainer
          center={center}
          style={{ height: '100%', width: '100%' }}
        >
          <FitBounds bounds={bounds} initialBounds={initialBounds} />
          <MapBoundsTracker onBoundsChange={onBoundsChange} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {data.map((fish, index) => (
            <CircleMarker
              key={index}
              center={[fish.latitude, fish.longitude]}
              radius={6}
              fillColor={getMarkerColor(fish.mercuryPpm)}
              color="white"
              weight={1}
              opacity={1}
              fillOpacity={0.8}
            >
              <Popup>
                <Box>
                  <Typography variant="subtitle2">{fish.species}</Typography>
                  <Typography variant="body2">
                    Length: {mmToInches(fish.lengthMm).toFixed(1)}"
                  </Typography>
                  <Typography variant="body2">
                    Mercury: {fish.mercuryPpm.toFixed(3)} ppm
                  </Typography>
                  <Typography variant="body2">
                    Location: {fish.latitude.toFixed(3)}, {fish.longitude.toFixed(3)}
                  </Typography>
                </Box>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#4caf50', borderRadius: '50%' }} />
          <Typography variant="caption">Low (&lt;0.5 ppm)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#ff9800', borderRadius: '50%' }} />
          <Typography variant="caption">Medium (0.5-1.0 ppm)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#d32f2f', borderRadius: '50%' }} />
          <Typography variant="caption">High (≥1.0 ppm)</Typography>
        </Box>
      </Box>
    </Paper>
  );
};