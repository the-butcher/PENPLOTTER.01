import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Button, Divider, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, Slider, TextField } from "@mui/material";
import { Mark } from '@mui/material/Slider/useSlider.types';
import { useEffect, useRef, useState } from "react";
import { IActiveStepProps } from './IActiveStepProps';
import { IHachureConfigProps } from './IHachureConfigProps';
import { STEP_INDEX_HACHURE__CONFIG, STEP_INDEX_HACHURE_PROCESS, STEP_INDEX_RASTER_____DATA } from './ImageLoaderComponent';
import { IRange } from '../util/IRange';

/**
 * this component offerst inputs for the hachure configuration
 *
 * @param props
 * @returns
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
function HachureConfigComponent(props: IHachureConfigProps & IActiveStepProps) {

    const { minSpacing, maxSpacing, blurFactor, contourOff, contourDiv, hachureDeg, contourDsp, azimuthDeg, propsCheck, handleHachureConfig, activeStep, showHelperTexts, handleActiveStep } = { ...props };

    const [minSpacingInt, setMinSpacingInt] = useState<number>(minSpacing);
    const [maxSpacingInt, setMaxSpacingInt] = useState<number>(maxSpacing);
    const [blurFactorInt, setBlurFactorInt] = useState<number>(blurFactor);
    const [contourOffInt, setContourOffInt] = useState<number>(contourOff);
    const [contourDivInt, setContourDivInt] = useState<number>(contourDiv);
    const [hachureDegInt, setHachureDegInt] = useState<number>(hachureDeg);
    const [contourDspInt, setContourDspInt] = useState<number>(contourDsp);
    const [azimuthDegInt, setAzimuthDegInt] = useState<number>(azimuthDeg);
    const [propsCheckInt, setPropsCheckInt] = useState<boolean>(propsCheck);

    const blurFactorRange: IRange = {
        min: 0.1,
        max: 5
    };
    const minSpacingMin = 1;
    const maxSpacingMax = 30;
    const contourOffRange: IRange = {
        min: 0.1,
        max: 5
    };
    const contourDivRange: IRange = {
        min: 1,
        max: 20
    };
    const hachureDegRange: IRange = {
        min: 1,
        max: 20
    };

    const handleHachureConfigToRef = useRef<number>(-1);

    useEffect(() => {
        console.debug('✨ building HachureConfigComponent');
    }, []);

    useEffect(() => {

        console.debug('⚙ updating HachureConfigComponent (minSpacing, maxSpacing, blurFactor, contourOff, contourDiv, hachureDeg, contourDsp, azimuthDeg)', minSpacing, maxSpacing, blurFactor, contourOff, contourDiv, hachureDeg, azimuthDeg, contourDsp);
        if (minSpacing) {
            setMinSpacingInt(minSpacing);
        }
        if (maxSpacing) {
            setMaxSpacingInt(maxSpacing);
        }
        if (blurFactor) {
            setBlurFactorInt(blurFactor);
        }
        if (contourOff) {
            setContourOffInt(contourOff);
        }
        if (contourDiv) {
            setContourDivInt(contourDiv);
        }
        if (hachureDeg) {
            setHachureDegInt(hachureDeg);
        }
        if (contourDsp) {
            setContourDspInt(contourDsp);
        }
        if (azimuthDeg) {
            setAzimuthDegInt(azimuthDeg);
        }

    }, [minSpacing, maxSpacing, blurFactor, contourOff, contourDiv, hachureDeg, contourDsp, azimuthDeg]);

    useEffect(() => {

        console.debug('⚙ updating HachureConfigComponent (minSpacingInt, maxSpacingInt, blurFactorInt, contourOffInt, contourDivInt, hachureDegInt, contourDspInt, azimuthDegInt, propsCheckInt)', minSpacingInt, maxSpacingInt, blurFactorInt, contourOffInt, contourDivInt, hachureDegInt, contourDspInt, azimuthDegInt, propsCheckInt);
        window.clearTimeout(handleHachureConfigToRef.current);
        handleHachureConfigToRef.current = window.setTimeout(() => {
            handleHachureConfig({
                minSpacing: minSpacingInt,
                maxSpacing: maxSpacingInt,
                blurFactor: blurFactorInt,
                contourOff: contourOffInt,
                contourDiv: contourDivInt,
                hachureDeg: hachureDegInt,
                contourDsp: contourDspInt,
                azimuthDeg: azimuthDegInt,
                propsCheck: propsCheckInt
            });
        }, 100);

    }, [minSpacingInt, maxSpacingInt, blurFactorInt, contourOffInt, contourDivInt, hachureDegInt, contourDspInt, azimuthDegInt, propsCheckInt]);

    const limitToRange = (value: number, range: IRange): number => {
        return Math.max(range.min, Math.min(range.max, value));
    };

    const handleBlurFactorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBlurFactorInt(event.target.value === '' ? blurFactorInt : limitToRange(Number(event.target.value), blurFactorRange));
    };

    const handleMinSpacingInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMinSpacingInt(event.target.value === '' ? minSpacingInt : Math.min(getMinSpacingMax(), Math.max(minSpacingMin, Number(event.target.value))));
    };

    const handleMaxSpacingInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMaxSpacingInt(event.target.value === '' ? maxSpacingInt : Math.max(getMaxSpacingMin(), Math.min(maxSpacingMax, Number(event.target.value))));
    };

    const handleContourOffInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setContourOffInt(event.target.value === '' ? contourOffInt : limitToRange(Number(event.target.value), contourOffRange));
    };

    const handleContourDivInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setContourDivInt(event.target.value === '' ? contourDivInt : limitToRange(Number(event.target.value), contourDivRange));
    };

    const handleHachureDegInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHachureDegInt(event.target.value === '' ? hachureDegInt : limitToRange(Number(event.target.value), hachureDegRange));
    };

    const handleContourDspSelectChange = (event: SelectChangeEvent<number>) => {
        setContourDspInt(event.target.value === '' ? contourDspInt : Number(event.target.value));
    };

    const handleAzimuthDegSliderChange = (_event: Event, newValue: number | number[]) => {
        setAzimuthDegInt(newValue as number);
    };

    const getMinSpacingMax = () => {
        return maxSpacingInt - 1;
    };

    const getMaxSpacingMin = () => {
        return minSpacingInt + 1;
    };

    const areAllValuesValid = () => {
        return true;
    };

    const createMark = (value: number): Mark => {
        return {
            value: value,
            label: `${value.toFixed(0)}deg`
        };
    };

    return (
        <Grid container spacing={2}
            sx={{
                alignItems: 'top',
                paddingTop: '12px'
            }}
        >
            <Grid item xs={12}>
                <TextField
                    label={'raster blur factor'}
                    value={blurFactorInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleBlurFactorInputChange}
                    disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            ...blurFactorRange,
                            step: 0.1,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the amount of blur applied to the raster data. low values (i.e. 0.1) produce more detail, high values (i.e. 3.0) produce smoother contours and hachures.' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'hachure min spacing'}
                    value={minSpacingInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleMinSpacingInputChange}
                    disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            step: 0.1,
                            min: minSpacingMin,
                            max: getMinSpacingMax(),
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the minimum spacing between hachure lines. if hachures become too close, one of the lines is discontinued.' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'hachure max spacing'}
                    value={maxSpacingInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleMaxSpacingInputChange}
                    disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            step: 0.1,
                            min: getMaxSpacingMin(),
                            max: maxSpacingMax,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the maximum spacing between hachure lines. if hachures get too far apart, a new hachure line is started between.' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'contour vertical interval (m)'}
                    value={contourOffInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleContourOffInputChange}
                    disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            ...contourOffRange,
                            step: 0.1,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the vertical distance in meters between contours during processing. low values (i.e. 0.5) produce more detail, high values (i.e. 5.0) produce less detail, but are faster.' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'contour segment length (m)'}
                    value={contourDivInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleContourDivInputChange}
                    disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            ...contourDivRange,
                            step: 0.5,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the segment length in meters used to divide contours during processing. low values (i.e. 2.0) produce more detail, high values (i.e. 5.0) produce less detail, but are faster.' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'minimum slope (deg)'}
                    value={hachureDegInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleHachureDegInputChange}
                    disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            ...hachureDegRange,
                            step: 0.1,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the minimum slope in degrees for hachure lines to be drawn. low values (i.e. 2.0) can produce more detail, but may give undesired artifacts, high values (i.e. 10.0) will miss details in terrain that is less pronounced.' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">contour display interval (m)</InputLabel>
                    <Select
                        value={contourDspInt}
                        label={'contour display interval (m)'}
                        onChange={handleContourDspSelectChange}
                        disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                        size={'small'}
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                        <MenuItem value={200}>200</MenuItem>
                        <MenuItem value={250}>250</MenuItem>
                        <MenuItem value={500}>500</MenuItem>
                    </Select>
                    {
                        showHelperTexts ? <FormHelperText>the vertical distance in meters between contours to be added to the output.</FormHelperText> : null
                    }
                </FormControl>
            </Grid>
            <Grid item xs={12}
                sx={{
                    padding: '12px 24px 0px 30px !important',
                }}
            >
                <FormHelperText>illumination azimuth (deg)</FormHelperText>
                <Slider
                    valueLabelDisplay={'on'}
                    orientation={'horizontal'}
                    aria-label="azimuth"
                    value={azimuthDegInt}
                    step={1}
                    min={0}
                    max={360}
                    valueLabelFormat={value => `${value.toFixed(0)}deg`}
                    onChange={handleAzimuthDegSliderChange}
                    disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                    marks={[
                        createMark(0),
                        createMark(360),
                    ]}
                    sx={{
                        marginTop: '36px',
                    }}
                />
                {
                    showHelperTexts ? <FormHelperText>the azimuth angle of illumination, zero pointing north.</FormHelperText> : null
                }
            </Grid>
            {
                activeStep === STEP_INDEX_HACHURE__CONFIG ? <>
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
                            size={'small'}
                            onClick={() => handleActiveStep({
                                activeStep: STEP_INDEX_RASTER_____DATA
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
                        <Button
                            disabled={!areAllValuesValid()}
                            variant={'contained'}
                            size={'small'}
                            onClick={() => {
                                setPropsCheckInt(true);
                                handleActiveStep({
                                    activeStep: STEP_INDEX_HACHURE_PROCESS
                                });
                            }}
                            endIcon={<ArrowDownwardIcon />}
                            sx={{
                                width: '100%',
                                margin: '0px 0px 0px 0px'
                            }}
                        >
                            next
                        </Button>
                    </Grid>
                </> : null
            }


        </Grid>
    );
}

export default HachureConfigComponent;