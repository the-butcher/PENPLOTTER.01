import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import UploadIcon from '@mui/icons-material/Upload';
import { Button, Divider, FormHelperText, Grid, TextField } from "@mui/material";
import { decode } from 'fast-png';
import { useEffect } from "react";
import { Raster } from '../raster/Raster';
import { ObjectUtil } from '../util/ObjectUtil';
import { ICommonConfigProps } from './ICommonConfigProps';
import { STEP_INDEX_HILLSHADE_CONFIG, STEP_INDEX_RASTER______DATA, STEP_INDEX_RASTER____CONFIG } from './ImageLoaderComponent';
import { IRasterDataProps } from './IRasterDataProps';

export const areRasterDataPropsValid = (props: Omit<IRasterDataProps, 'handleRasterData'>) => {
    return props.name !== '' && props.width > 0 && props.height > 0 && props.data.length > 0 && props.valueRange.max > props.valueRange.min;
};

/**
 * this component renders raster properties and offers the possibility to import a raster file
 *
 * @param props
 * @returns
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
function RasterDataComponent(props: IRasterDataProps & ICommonConfigProps) {

    const { name, data, width, height, valueRange, handleRasterData, activeStep, showHelperTexts, handleCommonConfig, handleAlertProps } = { ...props };

    useEffect(() => {
        console.debug('✨ building RasterDataComponent');
    }, []);

    // useEffect(() => {
    //     console.debug('⚙ updating RasterDataComponent (name, data)', name, data);
    // }, [data]);

    const handleRasterFileImport = (fileList: FileList) => {

        if (fileList.length > 0) {
            const file = fileList.item(0);
            file!.arrayBuffer().then(arrayBuffer => {

                const decodedPng = decode(arrayBuffer);

                // const maxMeters = 10000;
                // if (decodedPng.width * cellsize > maxMeters || decodedPng.height * cellsize > maxMeters) {
                //     handleAlertProps({
                //         severity: 'error',
                //         title: 'Invalid png dimensions!',
                //         message: `The maximum width or heigth of the image must not exceed ${maxMeters.toFixed(2)} m, but found ${(decodedPng.width * cellsize).toFixed(2)} m / ${(decodedPng.height * cellsize).toFixed(2)} m.`
                //     });
                //     return;
                // }
                if (decodedPng.depth < 16 || decodedPng.channels > 1) {
                    handleAlertProps({
                        severity: 'error',
                        title: 'Invalid png image!',
                        message: `The image must have a single channel with a depth of 16, but found ${decodedPng.channels} channels having a depth of ${decodedPng.depth}.`
                    });
                    return;
                }

                const name = file!.name;
                const width = decodedPng.width;
                const height = decodedPng.height;

                let pixelIndexRGB: number;
                const data = new Float32Array(width * height);
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        pixelIndexRGB = y * width + x;
                        data[pixelIndexRGB] = decodedPng.data[pixelIndexRGB];
                    }
                }

                const valueRangeSample = Raster.getSampleRange({
                    data,
                    width: width,
                    height: height
                });
                // console.log('valueRangeSample', valueRangeSample);

                const sampleToHeight = (sample: number): number => {
                    return ObjectUtil.mapValues(sample, valueRangeSample, valueRange);
                };

                handleRasterData({
                    name,
                    data: data.map(v => sampleToHeight(v)),
                    width,
                    height,
                    blurFactor: 0,
                    valueRange
                });

            });
        }

    };

    const areAllValuesValid = () => {
        return areRasterDataPropsValid({
            name,
            width,
            height,
            valueRange,
            blurFactor: 0,
            data
        });
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
                    label={'name'}
                    value={name}
                    variant={'outlined'}
                    size={'small'}
                    disabled={activeStep !== STEP_INDEX_RASTER______DATA}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            readOnly: true
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the name of the raster, readonly' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'width (px)'}
                    value={width > 0 ? width : ''}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    disabled={activeStep !== STEP_INDEX_RASTER______DATA}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            readOnly: true
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the width of the raster in pixels, readonly' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'height (px)'}
                    value={height > 0 ? height : ''}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    disabled={activeStep !== STEP_INDEX_RASTER______DATA}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        htmlInput: {
                            readOnly: true
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'the height of the raster in pixels, readonly' : undefined}
                />
            </Grid>
            {
                activeStep === STEP_INDEX_RASTER______DATA ? <Grid item xs={12}
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
                        variant='contained'
                        size={'small'}
                        tabIndex={-1}
                        startIcon={<UploadIcon />}
                    >
                        import raster file
                        <input
                            type={'file'}
                            onChange={(event) => handleRasterFileImport(event.target.files!)}
                            accept={'.png'}
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
                        showHelperTexts ? <FormHelperText>import a .png raster file (<a href="example.png" target='_blank'>example.png</a>). the raster must have a single channel in 16_BIT_UNSIGNED format</FormHelperText> : null
                    }
                </Grid> : null
            }
            {
                activeStep === STEP_INDEX_RASTER______DATA ? <>
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
                                activeStep: STEP_INDEX_RASTER____CONFIG
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
                            onClick={() => handleCommonConfig({
                                activeStep: STEP_INDEX_HILLSHADE_CONFIG
                            })}
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

export default RasterDataComponent;