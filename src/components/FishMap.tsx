import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { FishSample } from '../types/fish';
import { mmToInches } from '../utils/csvParser';
import { getSpeciesColor, CALIFORNIA_MAP_BOUNDS, CALIFORNIA_CENTER } from '../utils/constants';
import type { LatLngBounds } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FishMapProps {
  data: FishSample[];
  selectedSpecies: string[];
  onBoundsChange?: (bounds: LatLngBounds | null) => void;
  initialBounds?: LatLngBounds;
  userHasAdjustedMap: boolean;
  onUserAdjustedMap: () => void;
  onResetZoom?: () => void;
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

// Reset zoom Leaflet control
const ResetZoomControl: React.FC<{
  onResetZoom?: () => void;
  userHasAdjustedMap: boolean;
}> = ({ onResetZoom, userHasAdjustedMap }) => {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (!userHasAdjustedMap) {
      // Remove control if user hasn't adjusted map
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
      return;
    }

    // Add control if user has adjusted map and control doesn't exist
    if (!controlRef.current) {
      const ResetControl = L.Control.extend({
        onAdd: function() {
          // Create container with same classes as zoom control
          const container = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar leaflet-control');

          // Create the reset button
          const resetButton = L.DomUtil.create('a', 'leaflet-control-zoom-reset', container);
          // SVG icon - circular arrow (flipped horizontally for counter-clockwise)
          resetButton.innerHTML = `
            <svg viewBox="0 0 512 512" style="width: 14px; height: 14px; transform: scaleX(-1);">
              <path fill="currentColor" d="M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 82.76A247.42 247.42 0 0 0 256 8C119.34 8 7.9 119.53 8 256.19 8.1 393.07 119.1 504 256 504a247.1 247.1 0 0 0 166.18-63.91 12 12 0 0 0 .48-17.43l-34-34a12 12 0 0 0-16.38-.55A176 176 0 1 1 402.1 157.8l-101.53-4.87a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12h200.33a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12z"/>
            </svg>
          `;
          resetButton.href = '#';
          resetButton.title = 'Reset zoom to California';
          resetButton.setAttribute('role', 'button');
          resetButton.setAttribute('aria-label', 'Reset zoom to California');

          // Style to match zoom buttons
          resetButton.style.display = 'flex';
          resetButton.style.alignItems = 'center';
          resetButton.style.justifyContent = 'center';

          L.DomEvent.on(resetButton, 'click', function(e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            // Reset to California bounds
            map.fitBounds(CALIFORNIA_MAP_BOUNDS);
            // Call the reset handler to clear URL state
            if (onResetZoom) {
              onResetZoom();
            }
          });

          return container;
        },
      });

      controlRef.current = new ResetControl({ position: 'topleft' });
      map.addControl(controlRef.current);
    }

    // Cleanup function
    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, onResetZoom, userHasAdjustedMap]);

  return null;
};

export const FishMap: React.FC<FishMapProps> = ({ data, selectedSpecies, onBoundsChange, initialBounds, userHasAdjustedMap, onUserAdjustedMap, onResetZoom }) => {
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
          <ResetZoomControl
            onResetZoom={onResetZoom}
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
