
import { FormHelperText, Grid, Slider, TextField } from "@mui/material";
import { Mark } from "@mui/material/Slider/useSlider.types";
import { useEffect, useRef, useState } from "react";
import { IRange } from "../util/IRange";
import { ICommonConfigProps } from './ICommonConfigProps';
import { IHillshadeDefProps } from './IHillshadeDefProps';
import { STEP_INDEX_HILLSHADE_CONFIG } from './ImageLoaderComponent';

/**
 * this component shows input fields for raster configuration and offers the possibility to import an existing config file
 *
 * @param props
 * @returns
 *
 * @author h.fleischer
 * @since 28.047.2025
 */
function HillshadeDefComponent(props: IHillshadeDefProps & ICommonConfigProps) {

    const { id, aziDeg, zenDeg, weight, handleHillshadeDef, activeStep, showHelperTexts } = { ...props };

    const [aziDegInt, setAziDegInt] = useState<number>(aziDeg);
    const [zenDegInt, setZenDegInt] = useState<number>(zenDeg);
    const [weightInt, setWeightInt] = useState<number>(weight);

    const handleHillshadeDefToRef = useRef<number>(-1);

    const weightRange: IRange = {
        min: 0.1,
        max: 2
    };

    useEffect(() => {
        console.debug('✨ building HillshadeDefComponent');
    }, []);

    useEffect(() => {

        console.debug('⚙ updating HillshadeConfigComponent (aziDeg, zenDeg, weight)', aziDeg, zenDeg, weight);
        if (aziDeg) {
            setAziDegInt(aziDeg);
        }
        if (zenDeg) {
            setZenDegInt(zenDeg);
        }
        if (weight) {
            setWeightInt(weight);
        }


    }, [aziDeg, zenDeg, weight]);

    useEffect(() => {

        console.debug('⚙ updating HillshadeConfigComponent (aziDegInt, zenDegInt, weightInt)', aziDegInt, zenDegInt, weightInt);

        window.clearTimeout(handleHillshadeDefToRef.current);
        handleHillshadeDefToRef.current = window.setTimeout(() => {
            handleHillshadeDef(createHillshadeDefFromInt());
        }, 100);

    }, [aziDegInt, zenDegInt, weightInt]);

    const createHillshadeDefFromInt = (): Omit<IHillshadeDefProps, 'handleHillshadeDef'> => {
        return {
            id,
            aziDeg: aziDegInt,
            zenDeg: zenDegInt,
            weight: weightInt
        };
    };

    const handleAziDegSliderChange = (_event: Event, newValue: number | number[]) => {
        setAziDegInt(newValue as number);
    };

    const handleZenDegSliderChange = (_event: Event, newValue: number | number[]) => {
        setZenDegInt(newValue as number);
    };

    const handleWeightInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWeightInt(event.target.value === '' ? weightInt : Number(event.target.value));
    };


    const createMark = (value: number): Mark => {
        return {
            value: value,
            label: `${value.toFixed(0)}deg`
        };
    };

    return (
        <>
            <Grid item xs={12}
                sx={{
                    padding: '12px 24px 0px 30px !important',
                }}
            >
                <FormHelperText
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                >illumination azimuth (deg)</FormHelperText>
                <Slider
                    valueLabelDisplay={'on'}
                    orientation={'horizontal'}
                    aria-label="azimuth"
                    value={aziDegInt}
                    step={1}
                    min={0}
                    max={360}
                    valueLabelFormat={value => `${value.toFixed(0)}deg`}
                    onChange={handleAziDegSliderChange}
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
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
                        disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                    >the azimuth angle of illumination, zero pointing north</FormHelperText> : null
                }
            </Grid>
            <Grid item xs={12}
                sx={{
                    padding: '12px 24px 0px 30px !important',
                }}
            >
                <FormHelperText
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                >illumination altitude (deg)</FormHelperText>
                <Slider
                    valueLabelDisplay={'on'}
                    orientation={'horizontal'}
                    aria-label="altitude"
                    value={zenDegInt}
                    step={1}
                    min={0}
                    max={90}
                    valueLabelFormat={value => `${value.toFixed(0)}deg`}
                    onChange={handleZenDegSliderChange}
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                    marks={[
                        createMark(0),
                        createMark(90),
                    ]}
                    sx={{
                        marginTop: '36px',
                    }}
                />
                {
                    showHelperTexts ? <FormHelperText
                        disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                    >the azimuth angle of illumination, zero pointing north</FormHelperText> : null
                }
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'weight'}
                    value={weightInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleWeightInputChange}
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            ...weightRange,
                            step: 0.1,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the weight of this illumination layer' : undefined}
                />
            </Grid>
        </>
    );
}

export default HillshadeDefComponent;