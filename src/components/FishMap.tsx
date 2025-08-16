import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { FishSample } from '../types/fish';
import { mmToInches } from '../utils/csvParser';
import { getSpeciesColor, CALIFORNIA_MAP_BOUNDS, CALIFORNIA_CENTER } from '../utils/constants';
import type { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FishMapProps {
  data: FishSample[];
  selectedSpecies: string[];
  onBoundsChange?: (bounds: LatLngBounds | null) => void;
  initialBounds?: LatLngBounds;
  userHasAdjustedMap: boolean;
  onUserAdjustedMap: () => void;
}

// Component to track map bounds changes
const MapBoundsTracker: React.FC<{
  onBoundsChange?: (bounds: LatLngBounds | null) => void;
  onUserAdjustedMap: () => void;
  userHasAdjustedMap: boolean;
}> = ({ onBoundsChange, onUserAdjustedMap, userHasAdjustedMap }) => {
  const map = useMapEvents({
    moveend: () => {
      onUserAdjustedMap();
      if (onBoundsChange && userHasAdjustedMap) {
        onBoundsChange(map.getBounds());
      }
    },
    zoomend: () => {
      onUserAdjustedMap();
      if (onBoundsChange && userHasAdjustedMap) {
        onBoundsChange(map.getBounds());
      }
    },
  });

  useEffect(() => {
    // Report initial bounds for filtering, but don't save to URL
    if (onBoundsChange) {
      onBoundsChange(userHasAdjustedMap ? map.getBounds() : null);
    }
  }, [map, onBoundsChange, userHasAdjustedMap]);

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
        // User had previously adjusted the map
        map.fitBounds(initialBounds);
      } else if (bounds) {
        // Show full California extent on initial load
        map.fitBounds(bounds);
      }
      hasFitted.current = true;
    }
  }, [map, bounds, initialBounds]);

  return null;
};

export const FishMap: React.FC<FishMapProps> = ({ data, selectedSpecies, onBoundsChange, initialBounds, userHasAdjustedMap, onUserAdjustedMap }) => {
  // Use hardcoded California bounds for consistent initial view
  const center = CALIFORNIA_CENTER;
  const bounds = CALIFORNIA_MAP_BOUNDS;

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" gutterBottom>
        Sample Locations
      </Typography>

      <Box sx={{ height: 400, width: '100%' }}>
        <MapContainer
          center={center}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <FitBounds bounds={bounds} initialBounds={initialBounds} />
          <MapBoundsTracker
            onBoundsChange={onBoundsChange}
            onUserAdjustedMap={onUserAdjustedMap}
            userHasAdjustedMap={userHasAdjustedMap}
          />
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
