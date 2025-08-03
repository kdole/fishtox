import React, { useEffect, useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Typography, Box, CircularProgress, Alert, Grid } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { loadFishData } from './utils/csvParser';
import { FishSample } from './types/fish';
import { SpeciesPicker } from './components/SpeciesPicker';
import { MercuryScatterPlot } from './components/MercuryScatterPlot';
import { FishMap } from './components/FishMap';
import { getUniqueSpecies, filterBySpecies } from './utils/fishUtils';

const theme = createTheme();

function App() {
  const [fishData, setFishData] = useState<FishSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);

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

  const uniqueSpecies = useMemo(() => getUniqueSpecies(fishData), [fishData]);
  const filteredData = useMemo(() => filterBySpecies(fishData, selectedSpecies), [fishData, selectedSpecies]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
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
                
                {selectedSpecies ? (
                  <>
                    <Typography variant="body1" gutterBottom>
                      Showing {filteredData.length} samples of {selectedSpecies}
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ my: 1 }}>
                      <Grid item xs={12} lg={6}>
                        <MercuryScatterPlot 
                          data={filteredData} 
                          selectedSpecies={selectedSpecies}
                        />
                      </Grid>
                      <Grid item xs={12} lg={6}>
                        <FishMap 
                          data={filteredData} 
                          selectedSpecies={selectedSpecies}
                        />
                      </Grid>
                    </Grid>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ my: 3 }}>
                    Select a fish species to view mercury data and visualizations
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;