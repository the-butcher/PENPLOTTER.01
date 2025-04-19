import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UploadIcon from '@mui/icons-material/Upload';
import { Button, Divider, FormHelperText, Grid, TextField } from "@mui/material";
import { Position } from "geojson";
import { useEffect, useRef, useState } from "react";
import { IRange } from '../util/IRange';
import { IActiveStepProps } from './IActiveStepProps';
import { STEP_INDEX_RASTER_____DATA, STEP_INDEX_RASTER___CONFIG } from './ImageLoaderComponent';
import { IRasterConfigProps } from "./IRasterConfigProps";

export const areRasterConfigPropsValid = (props: Omit<IRasterConfigProps, 'handleRasterConfig'>) => {
    return props.cellsize > 0 && props.valueRange.min > 0 && props.valueRange.max > props.valueRange.min;
};

/**
 * this component shows input fields for raster configuration and offers the possibility to upload an existing config file
 *
 * @param props
 * @returns
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
function RasterConfigComponent(props: IRasterConfigProps & IActiveStepProps) {

    const { cellsize, valueRange, origin3857, handleRasterConfig, activeStep, showHelperTexts, handleActiveStep } = { ...props };

    const [cellsizeInt, setCellsizeInt] = useState<number>(cellsize);
    const [origin3857Int, setOrigin3857Int] = useState<Position>(origin3857);
    const [valueRangeInt, setValueRangeInt] = useState<IRange>(valueRange);

    const handleRasterConfigToRef = useRef<number>(-1);

    useEffect(() => {
        console.debug('✨ building RasterConfigComponent');
    }, []);

    useEffect(() => {

        console.debug('⚙ updating RasterConfigComponent (cellsize, valueRange, origin3857)', cellsize, valueRange, origin3857);
        if (cellsize) {
            setCellsizeInt(cellsize);
        }
        if (valueRange) {
            setValueRangeInt(valueRange);
        }
        if (origin3857) {
            setOrigin3857Int(origin3857);
        }

    }, [cellsize, valueRange, origin3857]);

    useEffect(() => {

        console.debug('⚙ updating RasterConfigComponent (cellsizeInt, valueRangeInt, origin3857Int)', cellsizeInt, valueRangeInt, origin3857Int);
        window.clearTimeout(handleRasterConfigToRef.current);
        handleRasterConfigToRef.current = window.setTimeout(() => {
            handleRasterConfig({
                cellsize: cellsizeInt,
                valueRange: valueRangeInt,
                origin3857: origin3857Int
            });
        }, 100);

    }, [cellsizeInt, valueRangeInt, origin3857Int]);


    const handleCellsizeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCellsizeInt(event.target.value === '' ? cellsizeInt : Number(event.target.value));
    };

    const handleOrigin3857XInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrigin3857Int([
            event.target.value === '' ? origin3857Int[0] : Number(event.target.value),
            origin3857Int[1]
        ]);
    };

    const handleOrigin3857YInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOrigin3857Int([
            origin3857Int[0],
            event.target.value === '' ? origin3857Int[1] : Number(event.target.value),
        ]);
    };

    const handleValueRangeMinInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValueRangeInt({
            min: event.target.value === '' ? valueRangeInt.min : Number(event.target.value),
            max: valueRangeInt.max
        });
    };

    const handleValueRangeMaxInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValueRangeInt({
            min: valueRangeInt.min,
            max: event.target.value === '' ? valueRangeInt.max : Number(event.target.value),
        });
    };

    const handleRasterConfigUpload = (fileList: FileList) => {
        if (fileList.length > 0) {
            const file = fileList.item(0);
            file!.text().then(text => {

                if (file!.name.endsWith('pgc')) {
                    const _rasterConfig: IRasterConfigProps = JSON.parse(text);
                    setCellsizeInt(_rasterConfig.cellsize);
                    setValueRangeInt(_rasterConfig.valueRange);
                    setOrigin3857Int(_rasterConfig.origin3857);
                } else if (file!.name.endsWith('pgw')) {
                    const lines = text.split(/\r?\n/);
                    // '10.0000000000', '0.0000000000', '0.0000000000', '-10.0000000000', '1469019.6402537469', '6055949.4598493706', ''
                    if (lines.length >= 6) {
                        setCellsizeInt(parseFloat(lines[0]));
                        setOrigin3857Int([
                            parseFloat(lines[4]),
                            parseFloat(lines[5])
                        ]);
                    }
                }

            });
        }
    };

    const areAllValuesValid = () => {
        return cellsize > 0 && valueRange.min > 0 && valueRange.max > valueRange.min;
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
                    label={'cellsize (m)'}
                    value={cellsizeInt > 0 ? cellsizeInt : ''}
                    type="number"
                    variant="outlined"
                    size='small'
                    onChange={handleCellsizeInputChange}
                    disabled={activeStep !== STEP_INDEX_RASTER___CONFIG}
                    sx={{
                        width: '100%',

                    }}
                    slotProps={{
                        htmlInput: {
                            step: 1,
                            min: 1,
                            max: 100,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'pixel size in meters' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'origin-x (m)'}
                    value={origin3857Int[0]}
                    type="number"
                    variant="outlined"
                    onChange={handleOrigin3857XInputChange}
                    disabled={activeStep !== STEP_INDEX_RASTER___CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'x-coordinate of the center of the upper left pixel in meters' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'origin-y (m)'}
                    value={origin3857Int[1]}
                    type="number"
                    variant="outlined"
                    onChange={handleOrigin3857YInputChange}
                    disabled={activeStep !== STEP_INDEX_RASTER___CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'y-coordinate of the center of the upper left pixel in meters' : undefined}
                />
            </Grid>


            <Grid item xs={12}>
                <TextField
                    label={'elevation-min (m)'}
                    value={valueRangeInt.min > 0 ? valueRangeInt.min : ''}
                    type="number"
                    variant="outlined"
                    onChange={handleValueRangeMinInputChange}
                    disabled={activeStep !== STEP_INDEX_RASTER___CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'elevation minimum of the raster in meters' : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'elevation-max (m)'}
                    value={valueRangeInt.max > 0 ? valueRangeInt.max : ''}
                    type="number"
                    variant="outlined"
                    onChange={handleValueRangeMaxInputChange}
                    disabled={activeStep !== STEP_INDEX_RASTER___CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? 'elevation maximum of the raster in meters' : undefined}
                />
            </Grid>
            {
                activeStep === STEP_INDEX_RASTER___CONFIG ? <Grid item xs={12}
                    sx={{
                        paddingTop: '12px !important'
                    }}
                >
                    <Button
                        sx={{
                            width: '100%',
                            padding: '6px',
                        }}
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<UploadIcon />}
                    >
                        upload raster config
                        <input
                            type="file"
                            onChange={(event) => handleRasterConfigUpload(event.target.files!)}
                            accept={'.pgc, .pgw'}
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
                        showHelperTexts ? <FormHelperText>upload a .pgc raster config file (<a href="example.pgc" target='_blank'>example.pgc</a>) or a .pgw world file (<a href="example.pgw" target='_blank'>example.pgw</a>) for convenience</FormHelperText> : null
                    }

                </Grid> : null
            }
            {
                activeStep === STEP_INDEX_RASTER___CONFIG ? <>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Divider />
                    </Grid>
                    <Grid item xs={12}
                        sx={{
                            paddingTop: '8px !important'
                        }}
                    >
                        <Button
                            disabled={!areAllValuesValid()}
                            variant={'contained'}
                            onClick={() => handleActiveStep({
                                activeStep: STEP_INDEX_RASTER_____DATA
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

export default RasterConfigComponent;