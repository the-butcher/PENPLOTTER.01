import { Theme, createTheme } from "@mui/material";

export class ThemeUtil {

    static createTheme(): Theme {
        return createTheme({
            typography: {
                fontFamily: [
                    'Consolas',
                ].join(','),
                button: {
                    textTransform: 'none'
                }
            },
            components: {
                MuiSlider: {
                    styleOverrides: {
                        markLabel: {
                            fontSize: '12px',
                            top: '24px'
                        },
                        valueLabel: {
                            fontSize: '12px',
                        }
                    }
                },
                MuiSnackbar: {
                    styleOverrides: {
                        root: {
                            top: '10px !important',
                            left: '10px !important',
                            right: '10px !important',
                            bottom: 'unset !important'
                        }
                    }
                },
            }
        });
    }

}