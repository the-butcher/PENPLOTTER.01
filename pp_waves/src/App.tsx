import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { useEffect } from 'react';
import './App.css';
import CanvasComponent from './components/CanvasComponent';

const appTheme = createTheme({
  palette: {
    // mode: 'dark',
  },
  typography: {
    fontFamily: [
      'SimplyMono-Bold',
    ].join(','),
    button: {
      textTransform: 'none'
    }
  },
  components: {
    MuiStack: {
      defaultProps: {
        spacing: 2
      }
    },
    MuiCard: {
      defaultProps: {
        elevation: 3
      },
      styleOverrides: {
        root: {
          margin: '6px',
          padding: '12px'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          margin: '6px'
        }
      }
    }
  }
});

function App() {

  useEffect(() => {

    console.debug('✨ building App');

  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <CanvasComponent nY={10} />
    </ThemeProvider>
  );

}

export default App;
