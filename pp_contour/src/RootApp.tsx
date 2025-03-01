import { CssBaseline } from '@mui/material';
import { ThemeProvider } from 'styled-components';
import { ThemeUtil } from './util/ThemeUtil';
import ImageLoaderComponent from './components/ImageLoaderComponent';

function RootApp() {

  const theme = ThemeUtil.createTheme();



  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ImageLoaderComponent />
    </ThemeProvider>

  )
}

export default RootApp
