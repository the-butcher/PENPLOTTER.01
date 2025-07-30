import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';

import { Button, Divider, FormHelperText, Grid, Slider, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { ObjectUtil } from '../util/ObjectUtil';
import { ICommonConfigProps } from './ICommonConfigProps';
import { IHillshadeConfigProps } from './IHillshadeConfigProps';
import { STEP_INDEX_HACHURE___CONFIG, STEP_INDEX_HILLSHADE_CONFIG, STEP_INDEX_RASTER______DATA } from './ImageLoaderComponent';
import HillshadeDefComponent from './HillshadeDefComponent';
import { IHillshadeDefProps } from './IHillshadeDefProps';
import { Mark } from '@mui/material/Slider/useSlider.types';
import { IRange } from '../util/IRange';

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
    const handleHillshadeConfigToRef = useRef<number>(-1);

    const blurFactorRange: IRange = {
        min: 0.1,
        max: 10
    };

    const handleHillshadeDef = (hillshadeDefUpdates: Omit<IHillshadeDefProps, 'handleHillshadeDef'>) => {

        console.log(`📞 handling hillshade def (hillshadeDefUpdates)`, hillshadeDefUpdates);
        for (let i = 0; i < hillshadeDefs.length; i++) {
            if (hillshadeDefs[i].id === hillshadeDefUpdates.id) {
                hillshadeDefs[i].aziDeg = hillshadeDefUpdates.aziDeg;
                hillshadeDefs[i].zenDeg = hillshadeDefUpdates.zenDeg;
                hillshadeDefs[i].weight = hillshadeDefUpdates.weight;
            }
        }
        handleHillshadeConfigInt();

        // TODO :: delete option for hillshade defs
        // TODO :: insert option for hillshade defs

    };

    useEffect(() => {
        console.debug('✨ building HillshadeConfigComponent');
    }, []);

    useEffect(() => {

        console.debug('⚙ updating HillshadeConfigComponent (zFactor, blurFactor)', zFactor, blurFactor);
        if (zFactor) {
            setZFactorInt(zFactor);
        }
        if (blurFactor) {
            setBlurFactorInt(blurFactor);
        }

    }, [zFactor, blurFactor]);

    useEffect(() => {

        console.debug('⚙ updating HillshadeConfigComponent (zFactorInt, blurFactorInt)', zFactorInt, blurFactorInt);
        handleHillshadeConfigInt();

    }, [zFactorInt, blurFactorInt]);

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
            zFactor: zFactorInt,
            blurFactor: blurFactorInt,
            hillshadeDefs
        };
    };

    const handleZFactorSliderChange = (_event: Event, newValue: number | number[]) => {
        setZFactorInt(newValue as number);
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
                    handleHillshadeConfig(_hillshadeConfig);

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

    const handleBlurFactorInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBlurFactorInt(event.target.value === '' ? blurFactorInt : Number(event.target.value));
    };

    const createMark = (value: number): Mark => {
        return {
            value: value,
            label: `${value.toFixed(0)}x`
        };
    };

    return (
        <Grid container spacing={2}
            sx={{
                alignItems: 'top',
                paddingTop: '12px'
            }}
        >
            <Grid item xs={12}
                sx={{
                    padding: '12px 24px 0px 30px !important',
                }}
            >
                <FormHelperText
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                >z-factor</FormHelperText>
                <Slider
                    valueLabelDisplay={'on'}
                    orientation={'horizontal'}
                    aria-label="zFactor"
                    value={zFactorInt}
                    step={0.5}
                    min={1}
                    max={10}
                    valueLabelFormat={value => `${value.toFixed(0)}x`}
                    onChange={handleZFactorSliderChange}
                    disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                    marks={[
                        createMark(1),
                        createMark(10),
                    ]}
                    sx={{
                        marginTop: '36px',
                    }}
                />
                {
                    showHelperTexts ? <FormHelperText
                        disabled={activeStep !== STEP_INDEX_HILLSHADE_CONFIG}
                    >the z-factor applied when calculating hillshade</FormHelperText> : null
                }
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
                            paddingTop: '8px !important'
                        }}
                    >
                        <Divider></Divider>
                    </Grid>
                    <HillshadeDefComponent key={hillshadeDef.id} {...hillshadeDef} handleHillshadeDef={handleHillshadeDef} activeStep={activeStep} showHelperTexts={showHelperTexts} handleAlertProps={handleAlertProps} handleCommonConfig={handleCommonConfig} />
                </>)
            }
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