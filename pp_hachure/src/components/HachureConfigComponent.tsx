import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Button, Divider, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent, Slider, TextField } from "@mui/material";
import { Mark } from '@mui/material/Slider/useSlider.types';
import { useEffect, useRef, useState } from "react";
import { ICommonConfigProps } from './ICommonConfigProps';
import { CONTOUR_DSP_OPTIONS, IHachureConfigProps, toContourOffOption, toContourOffOptions } from './IHachureConfigProps';
import { STEP_INDEX_HACHURE__CONFIG, STEP_INDEX_HACHURE_PROCESS, STEP_INDEX_RASTER_____DATA } from './ImageLoaderComponent';
import { IRange } from '../util/IRange';
import { IRasterConfigProps } from './IRasterConfigProps';
import { ObjectUtil } from '../util/ObjectUtil';

export const toAvgSpacingDefault = (rasterConfig: Pick<IRasterConfigProps, 'cellsize' | 'converter'>) => {
    return ObjectUtil.roundFlex(0.7 * rasterConfig.cellsize / rasterConfig.converter.metersPerUnit);
};
export const toContourDivDefault = (rasterConfig: Pick<IRasterConfigProps, 'cellsize' | 'converter'>) => {
    return ObjectUtil.roundFlex(0.5 * rasterConfig.cellsize / rasterConfig.converter.metersPerUnit);
};
export const toHachureDimDefault = (rasterConfig: Pick<IRasterConfigProps, 'cellsize' | 'converter'>) => {
    return ObjectUtil.roundFlex(10 * rasterConfig.cellsize / rasterConfig.converter.metersPerUnit);
};

/**
 * this component offerst inputs for the hachure configuration
 *
 * @param props
 * @returns
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
function HachureConfigComponent(props: IHachureConfigProps & IRasterConfigProps & ICommonConfigProps) {

    const { avgSpacing, blurFactor, contourOff, contourDiv, hachureDeg, hachureDim, hachureArr, contourDsp, azimuthDeg, propsCheck, hachureUid, handleHachureConfig, converter, activeStep, showHelperTexts, handleCommonConfig } = { ...props };

    const [avgSpacingInt, setAvgSpacingInt] = useState<number>(avgSpacing);
    const [blurFactorInt, setBlurFactorInt] = useState<number>(blurFactor);
    const [contourOffInt, setContourOffInt] = useState<number>(contourOff);
    const [contourDivInt, setContourDivInt] = useState<number>(contourDiv);
    const [hachureDegInt, setHachureDegInt] = useState<number>(hachureDeg);
    const [hachureDimInt, setHachureDimInt] = useState<number>(hachureDim);
    const [hachureArrInt, setHachureArrInt] = useState<boolean>(hachureArr);
    const [contourDspInt, setContourDspInt] = useState<number>(contourDsp);
    const [azimuthDegInt, setAzimuthDegInt] = useState<number>(azimuthDeg);
    const [propsCheckInt, setPropsCheckInt] = useState<boolean>(propsCheck);

    const blurFactorRange: IRange = {
        min: 0.1,
        max: 10
    };

    const avgSpacingDefault = toAvgSpacingDefault(props);
    const avgSpacingRange: IRange = {
        min: ObjectUtil.roundFlex(avgSpacingDefault / 10),
        max: ObjectUtil.roundFlex(avgSpacingDefault * 5)
    };
    const contourDivDefault = toContourDivDefault(props);
    const contourDivRange: IRange = {
        min: ObjectUtil.roundFlex(contourDivDefault / 10),
        max: ObjectUtil.roundFlex(contourDivDefault * 5)
    };
    const hachureDegRange: IRange = {
        min: 0.25,
        max: 20
    };
    const hachureDimDefault = toHachureDimDefault(props);
    const hachureDimRange: IRange = {
        min: ObjectUtil.roundFlex(hachureDimDefault / 5),
        max: ObjectUtil.roundFlex(hachureDimDefault * 10)
    };
    // console.log('hachureDimRange', hachureDimRange);

    const handleHachureConfigToRef = useRef<number>(-1);

    useEffect(() => {
        console.debug('✨ building HachureConfigComponent');
    }, []);

    useEffect(() => {

        console.debug('⚙ updating HachureConfigComponent (avgSpacing, blurFactor, contourOff, contourDiv, hachureDeg, hachureDim, hachureArr, contourDsp, azimuthDeg, hachureUid)', avgSpacing, blurFactor, contourOff, contourDiv, hachureDeg, hachureDim, hachureArr, azimuthDeg, contourDsp, hachureUid);
        if (avgSpacing) {
            setAvgSpacingInt(avgSpacing);
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
        if (hachureDim) {
            setHachureDimInt(hachureDim);
        }
        setHachureArrInt(hachureArr);
        if (contourDsp) {
            setContourDspInt(contourDsp);
        }
        if (azimuthDeg) {
            setAzimuthDegInt(azimuthDeg);
        }

    }, [avgSpacing, blurFactor, contourOff, contourDiv, hachureDeg, hachureDim, hachureArr, contourDsp, azimuthDeg, hachureUid]);

    useEffect(() => {

        console.debug('⚙ updating HachureConfigComponent (avgSpacingInt, blurFactorInt, contourOffInt, contourDivInt, hachureDegInt, hachureDimInt, hachureArrInt, contourDspInt, azimuthDegInt, propsCheckInt)', avgSpacingInt, blurFactorInt, contourOffInt, contourDivInt, hachureDegInt, hachureDimInt, hachureArrInt, contourDspInt, azimuthDegInt, propsCheckInt);
        window.clearTimeout(handleHachureConfigToRef.current);
        const _hachureConfigFromInt = createHachureConfigFromInt();
        handleHachureConfigToRef.current = window.setTimeout(() => {
            handleHachureConfig({
                ..._hachureConfigFromInt,
                propsCheck: propsCheckInt
            });
        }, 1000);

    }, [avgSpacingInt, blurFactorInt, contourOffInt, contourDivInt, hachureDegInt, hachureDimInt, hachureArrInt, contourDspInt, azimuthDegInt, propsCheckInt]);

    const limitToRange = (value: number, range: IRange): number => {
        return Math.max(range.min, Math.min(range.max, value));
    };

    const handleHachureArrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHachureArrInt((event.target as HTMLInputElement).value === 'arrow');
    };

    const handleBlurFactorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBlurFactorInt(event.target.value === '' ? blurFactorInt : Number(event.target.value));
    };

    const handleAvgSpacingInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAvgSpacingInt(event.target.value === '' ? avgSpacingInt : Number(event.target.value));
    };

    const handleContourDivInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setContourDivInt(event.target.value === '' ? contourDivInt : Number(event.target.value));
    };

    const handleHachureDegInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHachureDegInt(event.target.value === '' ? hachureDegInt : Number(event.target.value));
    };

    const handleHachureDimInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHachureDimInt(event.target.value === '' ? hachureDimInt : Number(event.target.value));
    };

    const handleContourOffSelectChange = (event: SelectChangeEvent<number>) => {
        setContourOffInt(event.target.value === '' ? contourDspInt : Number(event.target.value));
    };

    const handleContourDspSelectChange = (event: SelectChangeEvent<number>) => {
        const _contourDiv = event.target.value === '' ? contourDspInt : Number(event.target.value);
        const _contourOff = toContourOffOption(_contourDiv, contourOffInt);
        setContourDspInt(_contourDiv);
        setContourOffInt(_contourOff);
    };

    const handleAzimuthDegSliderChange = (_event: Event, newValue: number | number[]) => {
        setAzimuthDegInt(newValue as number);
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

    const createHachureConfigFromInt = (): Omit<IHachureConfigProps, 'handleHachureConfig' | 'propsCheck'> => {
        return {
            avgSpacing: limitToRange(avgSpacingInt, avgSpacingRange),
            blurFactor: limitToRange(blurFactorInt, blurFactorRange),
            contourOff: contourOffInt,
            contourDiv: limitToRange(contourDivInt, contourDivRange),
            hachureDeg: limitToRange(hachureDegInt, hachureDegRange),
            hachureDim: limitToRange(hachureDimInt, hachureDimRange),
            hachureArr: hachureArrInt,
            contourDsp: contourDspInt,
            azimuthDeg: azimuthDegInt,
            hachureUid: ObjectUtil.createId()
        };
    };

    const hachureConfigFileFormat = '.hcc';
    const handleHachureConfigExport = () => {
        const a = document.createElement("a");
        const e = new MouseEvent("click");
        a.download = `hachure_config_${ObjectUtil.createId()}${hachureConfigFileFormat}`;
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(createHachureConfigFromInt(), (_key, val) => {
            return val.toFixed ? Number(val.toFixed(7)) : val;
        }, 2));
        a.dispatchEvent(e);
    };

    const handleHachureConfigImport = (fileList: FileList) => {
        if (fileList.length > 0) {
            const file = fileList.item(0);
            file!.text().then(text => {

                // TODO :: value validation agains current ranges
                const _hachureConfigProps: Omit<IHachureConfigProps, 'handleHachureConfig' | 'propsCheck'> = JSON.parse(text);
                handleHachureConfig({
                    ..._hachureConfigProps,
                    propsCheck: propsCheckInt
                });

            });
        }
    };

    return (
        <Grid container spacing={2}
            sx={{
                alignItems: 'top',
                paddingTop: '12px'
            }}
        >
            <Grid item xs={12}>
                <FormControl>
                    <FormLabel>
                        <FormHelperText
                            disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                            sx={{
                                margin: '0px'
                            }}
                        >hachure style</FormHelperText>
                    </FormLabel>
                    <RadioGroup
                        onChange={handleHachureArrChange}
                        value={hachureArrInt ? 'arrow' : 'plain'}
                    >
                        <FormControlLabel value="arrow" control={<Radio
                            disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                            size={'small'}
                            sx={{
                                padding: '3px 12px'
                            }}
                        />} label="arrow" />
                        <FormControlLabel value="plain" control={<Radio
                            disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                            size={'small'}
                            sx={{
                                padding: '3px 12px'
                            }}
                        />} label="plain" />
                    </RadioGroup>
                    {
                        showHelperTexts ? <FormHelperText
                            disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                        >the style of the hachure lines.</FormHelperText> : null
                    }
                </FormControl>
            </Grid>
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
                    helperText={showHelperTexts ? 'the amount of blur applied to the raster data. low values (i.e. 0.1) produce more detail, high values (i.e. 3.0) produce smoother contours and hachures' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={`hachure avg spacing (${converter.projUnitAbbr})`}
                    value={avgSpacingInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleAvgSpacingInputChange}
                    disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            ...avgSpacingRange,
                            step: 0.1,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? `the average spacing between hachure lines in  (${converter.projUnitName}). if hachures become too close, one of the lines is discontinued, if they become too far apart, new lines are inserted. the actual output value may vary to to facilitate hillshade` : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={`hachure avg length (${converter.projUnitAbbr})`}
                    value={hachureDimInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleHachureDimInputChange}
                    disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            ...hachureDimRange,
                            step: 0.1,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? `the average maximum length that a hachure line may have (${converter.projUnitName}). shorter lines may provide a more even distribution of lines, longer lines may flow more smoothly.` : undefined}
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
                    helperText={showHelperTexts ? 'the segment length in meters used to divide contours during processing. low values produce more detail, high values produce less detail, but are faster' : undefined}
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
                    helperText={showHelperTexts ? 'the minimum slope in degrees for hachure lines to be drawn. low values (i.e. 1.0) can produce more detail, but may give undesired artifacts, high values (i.e. 10.0) will miss details in terrain that is less pronounced, but may give better appearance in larger scales' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">contour processing interval (m)</InputLabel>
                    <Select
                        value={contourOffInt}
                        label={'contour vertical interval (m)'}
                        onChange={handleContourOffSelectChange}
                        disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                        size={'small'}
                    >
                        {
                            toContourOffOptions(contourDspInt).map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)
                        }
                    </Select>
                    {
                        showHelperTexts ? <FormHelperText
                            disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                        >the vertical distance in meters between contours during processing. low values produce more detail, high values are faster</FormHelperText> : null
                    }
                </FormControl>
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
                        {
                            CONTOUR_DSP_OPTIONS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)
                        }
                    </Select>
                    {
                        showHelperTexts ? <FormHelperText
                            disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                        >the vertical distance in meters between contours to be added to the output</FormHelperText> : null
                    }
                </FormControl>
            </Grid>
            <Grid item xs={12}
                sx={{
                    padding: '12px 24px 0px 30px !important',
                }}
            >
                <FormHelperText
                    disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                >illumination azimuth (deg)</FormHelperText>
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
                    showHelperTexts ? <FormHelperText
                        disabled={activeStep !== STEP_INDEX_HACHURE__CONFIG}
                    >the azimuth angle of illumination, zero pointing north</FormHelperText> : null
                }
            </Grid>
            {
                activeStep === STEP_INDEX_HACHURE__CONFIG ? <>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Button
                            sx={{
                                width: '100%',
                            }}
                            component={'label'}
                            role={undefined}
                            variant={'contained'}
                            size={'small'}
                            tabIndex={-1}
                            startIcon={<UploadIcon />}
                        >
                            import settings
                            <input
                                type={'file'}
                                onChange={(event) => handleHachureConfigImport(event.target.files!)}
                                accept={hachureConfigFileFormat}
                                style={{
                                    clip: 'rect(0 0 0 0)',
                                    clipPath: 'inset(50%)',
                                    height: 1,
                                    overflow: 'hidden',
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    whiteSpace: 'nowrap',
                                    width: 1,
                                }}
                            />
                        </Button>
                        {
                            showHelperTexts ? <FormHelperText>import a {hachureConfigFileFormat} hachure config file</FormHelperText> : null
                        }
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
                            onClick={handleHachureConfigExport}
                        >export settings</Button>
                        {
                            showHelperTexts ? <FormHelperText>export a {hachureConfigFileFormat} hachure config file</FormHelperText> : null
                        }
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
                            size={'small'}
                            onClick={() => handleCommonConfig({
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
                                handleCommonConfig({
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