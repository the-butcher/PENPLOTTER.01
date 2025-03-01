import { CssBaseline } from '@mui/material';
import { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import UserInterfaceComponent from './components/UserInterfaceComponent';
import { ProtocolTypesPrimitives } from './protobuf/base/decode/ProtocolTypesPrimitives';
import { ProtocolTypesVectortile } from './protobuf/vectortile/ProtocolTypesVectortile';
import { ThemeUtil } from './util/ThemeUtil';

function RootApp() {

  const theme = ThemeUtil.createTheme();

  useEffect(() => {

    console.debug('✨ building root app component');

    ProtocolTypesPrimitives.init();
    ProtocolTypesVectortile.init();

  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserInterfaceComponent />
    </ThemeProvider>
  )
}

export default RootApp
