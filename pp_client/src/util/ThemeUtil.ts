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
                MuiStack: {
                    defaultProps: {
                        spacing: 2,
                    }
                },
                MuiInputBase: {
                    styleOverrides: {
                        input: {
                            '&.MuiOutlinedInput-input': {
                                padding: '10px'
                                // backgroundColor: '#F0F0F0'
                            },
                            '&.MuiInputBase-inputMultiline': {
                                whiteSpace: 'pre',
                                // fontSize: '12px',
                                padding: '0px'
                            }
                        }
                    }
                },
                MuiFormLabel: {
                    styleOverrides: {
                        root: {
                            '&.MuiInputLabel-root': {
                                // top: '-5px'
                                // backgroundColor: '#F0F0F0'
                            }
                        }
                    }
                },
                MuiSlider: {
                    styleOverrides: {
                        markLabel: {
                            fontSize: '12px',
                            top: '24px'

                        }
                    }
                }
            }

            // .css-1w301fc-MuiFormLabel-root-MuiInputLabel-root
        });
    }


}