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
                MuiAccordion: {
                    styleOverrides: {
                        root: {
                            backgroundColor: '#ffffff',
                        }
                    }
                },
                MuiAccordionSummary: {
                    styleOverrides: {
                        content: {
                            '&.Mui-expanded': {
                                margin: '6px 0px',
                            },
                            margin: '6px 0px',
                        }
                    }
                },
                MuiAccordionDetails: {
                    styleOverrides: {
                        root: {
                            paddingLeft: '40px',
                        }
                    }
                },
                MuiStack: {
                    defaultProps: {
                        spacing: 2,
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
                MuiSnackbar: {
                    styleOverrides: {
                        root: {
                            top: '15px !important',
                            left: '60px !important',
                            right: '15px !important',
                            bottom: 'unset !important'
                        }
                    }
                },
                MuiAlert: {
                    styleOverrides: {
                        root: {
                            height: '37px',
                            padding: '1px 12px',
                            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)'
                        },
                        message: {
                            overflow: 'hidden',
                        }
                    }
                }
            }

            // .css-1w301fc-MuiFormLabel-root-MuiInputLabel-root
        });
    }


}