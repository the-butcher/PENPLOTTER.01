import DeleteIcon from '@mui/icons-material/Delete';
import { Grid, IconButton, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { IRange } from "../util/IRange";
import { ObjectUtil } from "../util/ObjectUtil";
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

    const { id, aziDeg, zenDeg, weight, deletable, handleHillshadeDef, deleteHillshadeDef, activeStep, showHelperTexts } = { ...props };

    const [aziDegInt, setAziDegInt] = useState<number>(aziDeg);
    const [zenDegInt, setZenDegInt] = useState<number>(zenDeg);
    const [weightInt, setWeightInt] = useState<number>(weight);

    const handleHillshadeDefToRef = useRef<number>(-1);

    const aziDegRange: IRange = {
        min: 0.00,
        max: 360.00
    };

    const zenDegRange: IRange = {
        min: 0.00,
        max: 90.00
    };

    const weightRange: IRange = {
        min: 0.10,
        max: 2.00
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

    const createHillshadeDefFromInt = (): Omit<IHillshadeDefProps, 'handleHillshadeDef' | 'deleteHillshadeDef' | 'deletable'> => {
        return {
            id,
            aziDeg: ObjectUtil.limitToRange(aziDegInt, aziDegRange),
            zenDeg: ObjectUtil.limitToRange(zenDegInt, zenDegRange),
            weight: ObjectUtil.limitToRange(weightInt, weightRange)
        };
    };

    const handleAziDegInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAziDegInt(event.target.value === '' ? aziDegInt : Number(event.target.value));
    };

    const handleZenDegInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setZenDegInt(event.target.value === '' ? zenDegInt : Number(event.target.value));
    };

    const handleWeightInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWeightInt(event.target.value === '' ? weightInt : Number(event.target.value));
    };

    return (
        <>
            <Grid item xs={10}>
                <TextField
                    label={'azimuth'}
                    value={aziDegInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleAziDegInputChange}
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            ...aziDegRange,
                            step: 0.1,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the azimuth angle of illumination, zero pointing north, 90 pointing east' : undefined}
                />
            </Grid>
            <Grid item xs={10}>
                <TextField
                    label={'altitude'}
                    value={zenDegInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleZenDegInputChange}
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            ...zenDegRange,
                            step: 0.1,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the altitude of illumination, 90° being vertical' : undefined}
                />
            </Grid>
            <Grid item xs={10}>
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
            <Grid item xs={2}>
                <IconButton disabled={!deletable} aria-label="delete" size="medium" onClick={() => deleteHillshadeDef(id)}>
                    <DeleteIcon fontSize="inherit" />
                </IconButton>
            </Grid>
        </>
    );
}

export default HillshadeDefComponent;