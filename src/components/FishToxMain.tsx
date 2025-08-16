import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Link } from '@mui/material';
import { loadFishData } from '../utils/csvParser';
import { FishSample } from '../types/fish';
import { SpeciesPicker } from './SpeciesPicker';
import { MercuryScatterPlot } from './MercuryScatterPlot';
import { FishMap } from './FishMap';
import { AboutModal } from './AboutModal';
import { getUniqueSpecies, filterBySpecies } from '../utils/fishUtils';
import { useUrlState } from '../hooks/useUrlState';
import type { LatLngBounds } from 'leaflet';

export const FishToxMain: React.FC = () => {
  const [fishData, setFishData] = useState<FishSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const [initialBounds, setInitialBounds] = useState<LatLngBounds | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [userHasAdjustedMap, setUserHasAdjustedMap] = useState(false);

  const { selectedSpecies, setSelectedSpecies, mapBounds: urlMapBounds, setMapBounds: setUrlMapBounds } = useUrlState();

  const handleMapBoundsChange = useCallback((bounds: LatLngBounds | null) => {
    setMapBounds(bounds);
    // Only save to URL if user has manually adjusted the map
    if (bounds && userHasAdjustedMap) {
      setUrlMapBounds(bounds);
    }
  }, [setUrlMapBounds, userHasAdjustedMap]);

  const handleUserAdjustedMap = useCallback(() => {
    if (!userHasAdjustedMap) {
      setUserHasAdjustedMap(true);
    }
  }, [userHasAdjustedMap]);

  useEffect(() => {
    loadFishData()
      .then(data => {
        setFishData(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load fish data');
        setLoading(false);
        console.error(err);
      });
  }, []);

  useEffect(() => {
    if (urlMapBounds && !initialBounds) {
      import('leaflet').then((L) => {
        const bounds = new L.LatLngBounds(
          [urlMapBounds.south, urlMapBounds.west],
          [urlMapBounds.north, urlMapBounds.east],
        );
        setInitialBounds(bounds);
        setMapBounds(bounds);
        setUserHasAdjustedMap(true); // URL bounds mean user had adjusted map
      });
    }
  }, [urlMapBounds, initialBounds]);

  const uniqueSpecies = useMemo(() => getUniqueSpecies(fishData), [fishData]);
  const filteredData = useMemo(() => filterBySpecies(fishData, selectedSpecies), [fishData, selectedSpecies]);

  const mapFilteredData = useMemo(() => {
    if (!mapBounds || !userHasAdjustedMap) return filteredData;

    return filteredData.filter(fish =>
      mapBounds.contains([fish.latitude, fish.longitude]),
    );
  }, [filteredData, mapBounds, userHasAdjustedMap]);

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Typography variant="h3" component="h1" gutterBottom>
          FishTox
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Mercury levels in California fish
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            <Box my={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <SpeciesPicker
                    species={uniqueSpecies}
                    selectedSpecies={selectedSpecies}
                    onSpeciesChange={setSelectedSpecies}
                  />
                </Grid>
              </Grid>
            </Box>

            {selectedSpecies.length > 0 ? (
              <>
                <Typography variant="body1" gutterBottom>
                  {userHasAdjustedMap && mapBounds && mapFilteredData.length !== filteredData.length ? (
                    <>Showing {mapFilteredData.length} {selectedSpecies.join(', ')} samples (filtered by map bounds)</>
                  ) : (
                    <>Showing {filteredData.length} {selectedSpecies.join(', ')} samples</>
                  )}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  💡 Tip: Zoom and pan the map to filter the scatter plot data
                </Typography>

                <Grid container spacing={3} sx={{ my: 1 }}>
                  <Grid item xs={12} lg={6}>
                    <MercuryScatterPlot
                      data={userHasAdjustedMap && mapBounds ? mapFilteredData : filteredData}
                      selectedSpecies={selectedSpecies}
                    />
                  </Grid>
                  <Grid item xs={12} lg={6}>
                    <FishMap
                      data={filteredData}
                      selectedSpecies={selectedSpecies}
                      onBoundsChange={handleMapBoundsChange}
                      initialBounds={initialBounds || undefined}
                      userHasAdjustedMap={userHasAdjustedMap}
                      onUserAdjustedMap={handleUserAdjustedMap}
                    />
                  </Grid>
                </Grid>

                <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 4 }}>
                  Informational purposes only. See the{' '}
                  <a
                    href="https://oehha.ca.gov/fish/advisories"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit' }}
                  >
                    California OEHHA Fish Advisories
                  </a>{' '}
                  for official guidance.{' '}
                  <Link
                    component="button"
                    variant="caption"
                    onClick={() => setAboutOpen(true)}
                    sx={{ color: 'text.secondary', textDecoration: 'underline' }}
                  >
                    Learn more
                  </Link>
                </Typography>
              </>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ my: 3 }}>
                Select one or more fish species to view mercury data and visualizations
              </Typography>
            )}
          </>
        )}
      </Box>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </Container>
  );
};
