import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { FishToxMain } from './components/FishToxMain';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <FishToxMain />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;