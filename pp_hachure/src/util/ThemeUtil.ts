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
                // MuiAlert: {
                //     styleOverrides: {
                //         root: {
                //             height: '37px',
                //             padding: '1px 12px',
                //             boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)'
                //         },
                //         message: {
                //             overflow: 'hidden',
                //         }
                //     }
                // }
            }

            // .css-1w301fc-MuiFormLabel-root-MuiInputLabel-root
        });
    }


}