import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { FishSample } from '../types/fish';
import { mmToInches } from '../utils/csvParser';
import { getSpeciesColor } from '../utils/constants';
import type { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FishMapProps {
  data: FishSample[];
  selectedSpecies: string[];
  onBoundsChange?: (bounds: LatLngBounds) => void;
  initialBounds?: LatLngBounds;
}

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

    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLng = Math.min(...lngs);
    let maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // If all points are at the same location, add a small padding to create valid bounds
    if (minLat === maxLat && minLng === maxLng) {
      const padding = 0.01; // About 1km padding
      minLat -= padding;
      maxLat += padding;
      minLng -= padding;
      maxLng += padding;
    }

    return {
      center: [centerLat, centerLng] as [number, number],
      bounds: [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]],
    };
  }, [data]);

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" gutterBottom>
        Sample Locations
      </Typography>

      <Box sx={{ height: 400, width: '100%' }}>
        <MapContainer
          center={center}
          zoom={13}
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
              radius={7}
              fillColor={getSpeciesColor(fish.species, selectedSpecies)}
              color="white"
              weight={2}
              opacity={1}
              fillOpacity={0.7}
            >
              <Popup>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {fish.species}
                  </Typography>
                  <Typography variant="body2">
                    Length: {mmToInches(fish.lengthMm).toFixed(1)}"
                  </Typography>
                  <Typography variant="body2">
                    Mercury: {fish.mercuryPpm.toFixed(3)} ppm
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {fish.latitude.toFixed(4)}, {fish.longitude.toFixed(4)}
                  </Typography>
                </Box>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </Box>

      {selectedSpecies.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedSpecies.map(species => (
            <Chip
              key={species}
              label={species}
              size="small"
              sx={{
                backgroundColor: getSpeciesColor(species, selectedSpecies),
                color: 'white',
                '& .MuiChip-label': {
                  fontWeight: 500,
                },
              }}
            />
          ))}
        </Box>
      )}

    </Paper>
  );
};
