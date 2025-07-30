import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DownloadIcon from '@mui/icons-material/Download';
import { Button, Divider, FormHelperText, Grid, Slider, TextField } from "@mui/material";
import { Mark } from '@mui/material/Slider/useSlider.types';
import { useEffect, useState } from "react";
import { IRange } from '../util/IRange';
import { ICommonConfigProps } from './ICommonConfigProps';
import { IHachureProcessProps } from "./IHachureProcessProps";
import { STEP_INDEX_HACHURE___CONFIG, STEP_INDEX_HACHURE__PROCESS } from './ImageLoaderComponent';

/**
 * this component offerst status of the hachure processing and buttons to download hachures and config as geojson
 *
 * @param props
 * @returns
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
function HachureProcessComponent(props: IHachureProcessProps & ICommonConfigProps) {

    const { value, valueRange, handleHachureExport, handleContourExport, handleSurfaceExport, activeStep, handleCommonConfig, showHelperTexts } = { ...props };

    useEffect(() => {
        console.debug('✨ building HachureConfigComponent');
    }, []);

    const createMark = (value: number): Mark => {
        return {
            value: value,
            label: `${value.toFixed(1)}m`
        };
    };

    const [minZ, setMinZ] = useState<number>(0);
    const [maxZ, setMaxZ] = useState<number>(9000);

    const minZRange: IRange = {
        min: 0,
        max: 20000
    };
    const maxZRange: IRange = {
        min: 0,
        max: 20000
    };

    const handleMinZInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMinZ(event.target.value === '' ? minZ : Number(event.target.value));
    };

    const handleMaxZInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMaxZ(event.target.value === '' ? maxZ : Number(event.target.value));
    };

    return (
        <Grid container spacing={2}
            sx={{
                alignItems: 'top',
                paddingTop: '12px'
            }}
        >
            {
                valueRange.max > valueRange.min ? <Grid item xs={12}
                    sx={{
                        padding: '12px 24px 0px 30px !important',
                    }}
                >
                    <FormHelperText>progress</FormHelperText>
                    <Slider
                        valueLabelDisplay={'on'}
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
                            marginTop: '36px',
                        }}
                    />
                </Grid> : null
            }
            {
                activeStep === STEP_INDEX_HACHURE__PROCESS ? <>
                    <Grid item xs={12}>
                        <TextField
                            label={'min z'}
                            value={minZ}
                            type={'number'}
                            variant={'outlined'}
                            size={'small'}
                            onChange={handleMinZInputChange}
                            disabled={activeStep !== STEP_INDEX_HACHURE__PROCESS}
                            sx={{
                                width: '100%'
                            }}
                            slotProps={{
                                htmlInput: {
                                    ...minZRange,
                                    step: 100,
                                    type: 'number'
                                },
                                inputLabel: {
                                    shrink: true
                                }
                            }}
                            helperText={showHelperTexts ? 'the maximum exportable height of vertices' : undefined}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label={'max z'}
                            value={maxZ}
                            type={'number'}
                            variant={'outlined'}
                            size={'small'}
                            onChange={handleMaxZInputChange}
                            disabled={activeStep !== STEP_INDEX_HACHURE__PROCESS}
                            sx={{
                                width: '100%'
                            }}
                            slotProps={{
                                htmlInput: {
                                    ...maxZRange,
                                    step: 100,
                                    type: 'number'
                                },
                                inputLabel: {
                                    shrink: true
                                }
                            }}
                            helperText={showHelperTexts ? 'the maximum exportable height of vertices' : undefined}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            sx={{
                                width: '100%'
                            }}
                            component={'label'}
                            role={undefined}
                            variant={'contained'}
                            size={'small'}
                            tabIndex={-1}
                            startIcon={<DownloadIcon />}
                            onClick={() => handleHachureExport(minZ, maxZ)}
                        >download hachures</Button>
                    </Grid>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Button
                            sx={{
                                width: '100%'
                            }}
                            component={'label'}
                            role={undefined}
                            variant={'contained'}
                            size={'small'}
                            tabIndex={-1}
                            startIcon={<DownloadIcon />}
                            onClick={() => handleContourExport(minZ, maxZ)}
                        >download contours</Button>
                    </Grid>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Button
                            sx={{
                                width: '100%'
                            }}
                            component={'label'}
                            role={undefined}
                            variant={'contained'}
                            size={'small'}
                            tabIndex={-1}
                            startIcon={<DownloadIcon />}
                            onClick={handleSurfaceExport}
                        >download surface</Button>
                    </Grid>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Divider></Divider>
                    </Grid>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Button
                            variant={'contained'}
                            size={'small'}
                            onClick={() => handleCommonConfig({
                                activeStep: STEP_INDEX_HACHURE___CONFIG
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
                </> : null
            }
        </Grid>
    );
}

export default HachureProcessComponent;