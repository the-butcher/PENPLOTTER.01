import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DownloadIcon from '@mui/icons-material/Download';
import { Button, Divider, FormHelperText, Grid, Slider } from "@mui/material";
import { Mark } from '@mui/material/Slider/useSlider.types';
import { useEffect } from "react";
import { IActiveStepProps } from './IActiveStepProps';
import { IHachureProcessProps } from "./IHachureProcessProps";
import { STEP_INDEX_HACHURE__CONFIG, STEP_INDEX_HACHURE_PROCESS } from './ImageLoaderComponent';

function HachureProcessComponent(props: IHachureProcessProps & IActiveStepProps) {


    const { value, valueRange, handleHachureExport, handleContourExport, activeStep, handleActiveStep } = { ...props };

    useEffect(() => {
        console.debug('✨ building HachureConfigComponent');
    }, []);

    // useEffect(() => {
    //     console.log('⚙ updating HachureConfigComponent (value, valueRange)', value, valueRange);
    // }, [value, valueRange]);

    const createMark = (value: number): Mark => {
        return {
            value: value,
            label: `${value.toFixed(1)}m`
        };
    }

    return (
        <Grid container spacing={2}
            sx={{
                alignItems: 'top',
                paddingTop: '12px'
            }}
        >
            {
                valueRange.min > 0 && valueRange.max > valueRange.min ? <Grid item xs={12}
                    sx={{
                        padding: '24px 24px 0px 36px !important',
                        // paddingLeft: '48px !important'
                    }}
                >
                    <Slider
                        valueLabelDisplay="on"
                        orientation={'horizontal'}
                        aria-label="height"
                        value={value}
                        min={valueRange.min}
                        max={valueRange.max}
                        valueLabelFormat={value => `${value.toFixed(1)}m`}
                        marks={[
                            createMark(valueRange.min),
                            // createMark(value),
                            createMark(valueRange.max),
                        ]}
                        sx={{
                            marginTop: '24px',
                            // width: 'calc(100% - 24px)'
                        }}
                    />
                </Grid> : null
            }
            {
                activeStep === STEP_INDEX_HACHURE_PROCESS ? <>
                    <Grid item xs={12}>
                        <Button
                            sx={{
                                width: '100%',
                                padding: '6px'
                            }}
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<DownloadIcon />}
                            onClick={handleHachureExport}
                        >download hachures</Button>
                    </Grid>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Button
                            sx={{
                                width: '100%',
                                padding: '6px'
                            }}
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<DownloadIcon />}
                            onClick={handleContourExport}

                        >download contours</Button>

                    </Grid>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Divider></Divider>
                    </Grid>

                    <Grid item xs={6}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Button
                            variant={'contained'}
                            onClick={() => handleActiveStep({
                                activeStep: STEP_INDEX_HACHURE__CONFIG
                            })}
                            startIcon={<ArrowUpwardIcon />}
                            sx={{
                                width: '100%',
                                margin: '0px 0px 0px 0px'
                            }}
                        >
                            back
                        </Button>
                    </Grid>
                    <Grid item xs={6}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                    </Grid>
                </> : null
            }
        </Grid>
    );
}

export default HachureProcessComponent;