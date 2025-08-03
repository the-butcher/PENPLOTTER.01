import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';

import { Button, Divider, FormHelperText, Grid, IconButton, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { IRange } from '../util/IRange';
import { ObjectUtil } from '../util/ObjectUtil';
import HillshadeDefComponent from './HillshadeDefComponent';
import { ICommonConfigProps } from './ICommonConfigProps';
import { IHillshadeConfigProps } from './IHillshadeConfigProps';
import { IHillshadeDefProps } from './IHillshadeDefProps';
import { STEP_INDEX_HACHURE___CONFIG, STEP_INDEX_HILLSHADE_CONFIG, STEP_INDEX_RASTER______DATA } from './ImageLoaderComponent';

/**
 * this component shows input fields for raster configuration and offers the possibility to import an existing config file
 *
 * @param props
 * @returns
 *
 * @author h.fleischer
 * @since 28.047.2025
 */
function HillshadeConfigComponent(props: IHillshadeConfigProps & ICommonConfigProps) {

    const { zFactor, blurFactor, hillshadeDefs, handleHillshadeConfig, activeStep, showHelperTexts, handleCommonConfig, handleAlertProps } = { ...props };

    const [loading, setLoading] = useState<boolean>(false);
    const [zFactorInt, setZFactorInt] = useState<number>(zFactor);
    const [blurFactorInt, setBlurFactorInt] = useState<number>(blurFactor);
    const [hillshadeDefsInt, setHillshadeDefsInt] = useState<Omit<IHillshadeDefProps, 'handleHillshadeDef' | 'deleteHillshadeDef' | 'deletable'>[]>(hillshadeDefs);
    const handleHillshadeConfigToRef = useRef<number>(-1);

    const zFactorRange: IRange = {
        min: 1.00,
        max: 10.00
    };

    const blurFactorRange: IRange = {
        min: 0.00,
        max: 10.00
    };

    const appendHillshadeDef = () => {
        setHillshadeDefsInt([
            ...hillshadeDefsInt,
            {
                id: ObjectUtil.createId(),
                aziDeg: 315,
                zenDeg: 45,
                weight: 0.5
            }
        ]);
    };

    const deleteHillshadeDef = (id: string) => {
        setHillshadeDefsInt(hillshadeDefsInt.filter(hillshadeDef => hillshadeDef.id !== id));
    };

    const handleHillshadeDef = (hillshadeDefUpdates: Omit<IHillshadeDefProps, 'handleHillshadeDef' | 'deleteHillshadeDef' | 'deletable'>) => {

        console.log(`📞 handling hillshade def (hillshadeDefUpdates)`, hillshadeDefUpdates);
        const _hillshadeDefs = [...hillshadeDefsInt];
        for (let i = 0; i < _hillshadeDefs.length; i++) {
            if (_hillshadeDefs[i].id === hillshadeDefUpdates.id) {
                _hillshadeDefs[i].aziDeg = hillshadeDefUpdates.aziDeg;
                _hillshadeDefs[i].zenDeg = hillshadeDefUpdates.zenDeg;
                _hillshadeDefs[i].weight = hillshadeDefUpdates.weight;
            }
        }
        setHillshadeDefsInt(_hillshadeDefs);
        // handleHillshadeConfigInt();

        // TODO :: delete option for hillshade defs
        // TODO :: insert option for hillshade defs

    };

    useEffect(() => {
        console.debug('✨ building HillshadeConfigComponent');
    }, []);

    useEffect(() => {

        console.debug('⚙ updating HillshadeConfigComponent (zFactor, blurFactor, hillshadeDefs)', zFactor, blurFactor, hillshadeDefs);
        if (zFactor) {
            setZFactorInt(zFactor);
        }
        if (blurFactor) {
            setBlurFactorInt(blurFactor);
        }
        setHillshadeDefsInt(hillshadeDefs);
    }, [zFactor, blurFactor]);

    useEffect(() => {

        console.debug('⚙ updating HillshadeConfigComponent (zFactorInt, blurFactorInt, hillshadeDefsInt)', zFactorInt, blurFactorInt, hillshadeDefsInt);
        handleHillshadeConfigInt();

    }, [zFactorInt, blurFactorInt, hillshadeDefsInt]);

    // useEffect(() => {
    //     console.debug('⚙ updating HillshadeConfigComponent (hillshadeDefs)', hillshadeDefs);
    // }, [hillshadeDefs]);

    const handleHillshadeConfigInt = () => {
        window.clearTimeout(handleHillshadeConfigToRef.current);
        handleHillshadeConfigToRef.current = window.setTimeout(() => {
            handleHillshadeConfig(createHillshadeConfigFromInt());
        }, 100);
    };

    const createHillshadeConfigFromInt = (): Omit<IHillshadeConfigProps, 'handleHillshadeConfig'> => {
        return {
            zFactor: ObjectUtil.limitToRange(zFactorInt, zFactorRange),
            blurFactor: ObjectUtil.limitToRange(blurFactorInt, blurFactorRange),
            hillshadeDefs: hillshadeDefsInt
        };
    };

    const hillshadeConfigFileFormat = '.hsc';
    const handleHillshadeConfigExport = () => {
        const a = document.createElement("a");
        const e = new MouseEvent("click");
        a.download = `hillshade_config_${ObjectUtil.createId()}${hillshadeConfigFileFormat}`;
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(createHillshadeConfigFromInt(), (_key, val) => {
            return val.toFixed ? Number(val.toFixed(7)) : val;
        }, 2));
        a.dispatchEvent(e);
    };

    const handleHillshadeConfigImport = (fileList: FileList) => {

        if (fileList.length > 0) {

            setLoading(true);

            const file = fileList.item(0);
            file!.text().then(text => {

                if (file!.name.endsWith(hillshadeConfigFileFormat)) {

                    const _hillshadeConfig: IHillshadeConfigProps = JSON.parse(text);
                    setBlurFactorInt(_hillshadeConfig.blurFactor);
                    setZFactorInt(_hillshadeConfig.zFactor);
                    setHillshadeDefsInt(_hillshadeConfig.hillshadeDefs);
                    // handleHillshadeConfig(_hillshadeConfig);

                }

                setLoading(false);

            }).catch((e: Error) => {

                handleAlertProps({
                    severity: 'error',
                    title: 'Failed to load hillshade config!',
                    message: e.message
                });
                setLoading(false);

            });

        }
    };

    const handleZFactorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setZFactorInt(event.target.value === '' ? zFactorInt : Number(event.target.value));
    };

    const handleBlurFactorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBlurFactorInt(event.target.value === '' ? blurFactorInt : Number(event.target.value));
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
                    label={'z factor'}
                    value={zFactorInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleZFactorInputChange}
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            ...zFactorRange,
                            step: 0.1,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the z-factor applied when calculating hillshade' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'raster blur factor'}
                    value={blurFactorInt}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleBlurFactorInputChange}
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
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
                    helperText={showHelperTexts ? 'the amount of blur applied to the hillshade data' : undefined}
                />
            </Grid>
            {
                hillshadeDefs.map(hillshadeDef => <>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '12px !important'
                        }}
                    >
                        <Divider />
                    </Grid>
                    <HillshadeDefComponent key={hillshadeDef.id} deletable={hillshadeDefs.length > 1} {...hillshadeDef} handleHillshadeDef={handleHillshadeDef} deleteHillshadeDef={deleteHillshadeDef} activeStep={activeStep} showHelperTexts={showHelperTexts} handleAlertProps={handleAlertProps} handleCommonConfig={handleCommonConfig} />
                </>)
            }
            <Grid item xs={12}
                sx={{
                    paddingTop: '12px !important'
                }}
            >
                <Divider />
            </Grid>
            <Grid item xs={10}>

            </Grid>
            <Grid item xs={2}>
                <IconButton aria-label="delete" size="medium" onClick={() => appendHillshadeDef()}>
                    <WbTwilightIcon fontSize="inherit" />
                </IconButton>
            </Grid>
            {
                activeStep === STEP_INDEX_HILLSHADE_CONFIG ? <>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '12px !important'
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
                            startIcon={loading ? <RefreshIcon fontSize='small'
                                sx={{
                                    animation: "spin 2s linear infinite",
                                    "@keyframes spin": {
                                        "0%": {
                                            transform: "rotate(0deg)",
                                        },
                                        "100%": {
                                            transform: "rotate(360deg)",
                                        },
                                    },
                                }}
                            /> : <UploadIcon />}
                        >
                            import settings
                            <input
                                type={'file'}
                                onChange={(event) => handleHillshadeConfigImport(event.target.files!)}
                                accept={hillshadeConfigFileFormat}
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
                            showHelperTexts ? <FormHelperText>export a {hillshadeConfigFileFormat} hillshade config file</FormHelperText> : null
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
                            onClick={handleHillshadeConfigExport}
                        >export settings</Button>
                        {
                            showHelperTexts ? <FormHelperText>export a {hillshadeConfigFileFormat} hillshade config file</FormHelperText> : null
                        }
                    </Grid>
                </> : null
            }
            {
                activeStep === STEP_INDEX_HILLSHADE_CONFIG ? <>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Divider />
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
                                activeStep: STEP_INDEX_RASTER______DATA
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
                            disabled={false}
                            variant={'contained'}
                            size={'small'}
                            onClick={() => {
                                // setPropsCheckInt(true);
                                handleCommonConfig({
                                    activeStep: STEP_INDEX_HACHURE___CONFIG
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

export default HillshadeConfigComponent;