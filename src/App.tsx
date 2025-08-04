import React, { useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { FishToxMain } from './components/FishToxMain';
import { initializeWebVitals } from './utils/analytics';

const theme = createTheme();

function App() {
  useEffect(() => {
    initializeWebVitals();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <FishToxMain />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;