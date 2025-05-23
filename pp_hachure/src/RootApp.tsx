import { CssBaseline } from '@mui/material';
import { ThemeProvider } from 'styled-components';
import ImageLoaderComponent from './components/ImageLoaderComponent';
import { ThemeUtil } from './util/ThemeUtil';

function RootApp() {

  const theme = ThemeUtil.createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ImageLoaderComponent />
    </ThemeProvider>
  );

}

export default RootApp;
