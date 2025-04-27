import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UploadIcon from '@mui/icons-material/Upload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button, Divider, FormHelperText, Grid, TextField } from "@mui/material";
import { Position } from "geojson";
import proj4, { ProjectionDefinition } from 'proj4';
import { useEffect, useRef, useState } from "react";
import { IRange } from '../util/IRange';
import { ICommonConfigProps } from './ICommonConfigProps';
import { ICoordinateConverter } from './ICoordinateConverter';
import { STEP_INDEX_RASTER_____DATA, STEP_INDEX_RASTER___CONFIG } from './ImageLoaderComponent';
import { IRasterConfigProps } from "./IRasterConfigProps";
import { TUnitAbbr, TUnitName } from './TUnit';

export const areRasterConfigPropsValid = (props: Omit<IRasterConfigProps, 'handleRasterConfig'>) => {
    return props.cellsize > 0 && props.valueRange.max > props.valueRange.min;
};

type FIELD_COLOR = "primary" | "error" | "secondary" | "info" | "success" | "warning";


/**
 * this component shows input fields for raster configuration and offers the possibility to import an existing config file
 *
 * @param props
 * @returns
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
function RasterConfigComponent(props: IRasterConfigProps & ICommonConfigProps) {

    const { cellsize, wkt, valueRange, originProj, converter, handleRasterConfig, activeStep, showHelperTexts, handleCommonConfig, handleAlertProps } = { ...props };

    const [cellsizeInt, setCellsizeInt] = useState<number>(cellsize);
    const [wktInt, setWktInt] = useState<string>(wkt);
    const [originProjInt, setOriginProjInt] = useState<Position>(originProj);
    const [converterInt, setConverterInt] = useState<ICoordinateConverter>(converter);
    const [valueRangeInt, setValueRangeInt] = useState<IRange>(valueRange);
    const [loading, setLoading] = useState<boolean>(false);

    const [wktColor, setWktColor] = useState<FIELD_COLOR>('primary');

    const handleRasterConfigToRef = useRef<number>(-1);

    useEffect(() => {
        console.debug('✨ building RasterConfigComponent');
        // proj4(GeometryUtil.WKT_3857); // be sure proj4 is ready when the user first updates a value
    }, []);

    useEffect(() => {

        console.debug('⚙ updating RasterConfigComponent (cellsize, wkt, valueRange, originProj, converter)', cellsize, wkt, valueRange, originProj, converter);
        if (cellsize) {
            setCellsizeInt(cellsize);
        }
        if (wkt) {
            setWktInt(wkt);
        }
        if (valueRange) {
            setValueRangeInt(valueRange);
        }
        if (originProj) {
            setOriginProjInt(originProj);
        }
        if (converter) {
            setConverterInt(converter);
        }

    }, [cellsize, wkt, valueRange, originProj, converter]);

    useEffect(() => {

        console.debug('⚙ updating RasterConfigComponent (cellsizeInt, valueRangeInt, originProjInt, converterInt)', cellsizeInt, valueRangeInt, originProjInt, converterInt);
        handleRasterConfigInt();

    }, [cellsizeInt, valueRangeInt, originProjInt, converterInt]);

    useEffect(() => {

        console.debug('⚙ updating RasterConfigComponent (wktInt)', wktInt);

        if (wktInt) {

            try {

                const proj4Converter = proj4(wktInt);
                console.log('proj4Converter', proj4Converter);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const proj4Definition = (proj4Converter as any)['oProj'] as ProjectionDefinition;
                console.log('proj4Definition', proj4Definition);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const proj4Unit = (proj4Definition as any)['UNIT'];

                let unitName: TUnitName | undefined;
                let unitAbbr: TUnitAbbr | undefined;

                const proj4UnitName = proj4Unit.name as string;
                if ((proj4UnitName.toLowerCase().indexOf('meter') != -1)) {
                    unitName = 'meters';
                    unitAbbr = 'm';
                } else if ((proj4UnitName.toLowerCase().indexOf('foot') != -1)) {
                    unitName = 'feet';
                    unitAbbr = 'ft';
                }
                console.log('proj4Unit', proj4Unit);

                if (!unitName || !unitAbbr) {
                    handleAlertProps({
                        severity: 'error',
                        title: 'Unsupported unit!',
                        message: `The unit of the wkt string must be meters or feet or degrees, but found ${proj4UnitName}.`
                    });
                    setWktColor('error');
                    return;
                }

                setWktColor('success');

                // type Units = "meters" | "metres" | "millimeters" | "millimetres" | "centimeters" | "centimetres" | "kilometers" | "kilometres" | "miles" | "nauticalmiles" | "inches" | "yards" | "feet" | "radians" | "degrees";
                const _converter: ICoordinateConverter = {
                    convert4326ToProj: proj4Converter.forward,
                    convertProjTo4326: proj4Converter.inverse,
                    projUnitName: unitName,
                    projUnitAbbr: unitAbbr,
                    metersPerUnit: proj4Unit.convert
                };
                setConverterInt(_converter);
                console.log('_converter', _converter);

                handleRasterConfigInt();

            } catch (e: unknown) {

                setWktColor('error');
                console.warn(e);

            }


        }

    }, [wktInt]);

    const handleRasterConfigInt = () => {
        window.clearTimeout(handleRasterConfigToRef.current);
        handleRasterConfigToRef.current = window.setTimeout(() => {
            handleRasterConfig({
                cellsize: cellsizeInt,
                wkt: wktInt,
                valueRange: valueRangeInt,
                originProj: originProjInt,
                converter: converterInt
            });
        }, 100);
    };

    const handleCellsizeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCellsizeInt(event.target.value === '' ? cellsizeInt : Number(event.target.value));
    };

    const handleWktInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWktInt(event.target.value);
    };

    const handleOriginProjXInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOriginProjInt([
            event.target.value === '' ? originProjInt[0] : Number(event.target.value),
            originProjInt[1]
        ]);
    };

    const handleOriginProjYInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOriginProjInt([
            originProjInt[0],
            event.target.value === '' ? originProjInt[1] : Number(event.target.value),
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

    const handleRasterConfigImport = (fileList: FileList) => {

        if (fileList.length > 0) {

            setLoading(true);

            const file = fileList.item(0);
            file!.text().then(text => {

                if (file!.name.endsWith('pgc')) {

                    const _rasterConfig: IRasterConfigProps = JSON.parse(text);
                    setCellsizeInt(_rasterConfig.cellsize);
                    setValueRangeInt(_rasterConfig.valueRange);
                    setOriginProjInt(_rasterConfig.originProj);
                    setWktInt(_rasterConfig.wkt);

                } else if (file!.name.endsWith('pgw')) {
                    const lines = text.split(/\r?\n/);
                    // '10.0000000000', '0.0000000000', '0.0000000000', '-10.0000000000', '1469019.6402537469', '6055949.4598493706', ''
                    if (lines.length >= 6) {
                        setCellsizeInt(parseFloat(lines[0]));
                        setOriginProjInt([
                            parseFloat(lines[4]),
                            parseFloat(lines[5])
                        ]);
                    }
                }

                setLoading(false);

            }).catch((e: Error) => {

                handleAlertProps({
                    severity: 'error',
                    title: 'Failed to load settings!',
                    message: e.message
                });
                setLoading(false);

            });

        }
    };

    const areAllValuesValid = () => {
        return areRasterConfigPropsValid({
            cellsize: cellsizeInt,
            wkt: wktInt,
            valueRange: valueRangeInt,
            originProj: originProjInt,
            converter: converterInt
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
                    label={'wkt'}
                    value={wktInt}
                    variant={'outlined'}
                    size={'small'}
                    color={wktColor}
                    onChange={handleWktInputChange}
                    disabled={activeStep !== STEP_INDEX_RASTER___CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                />
                {
                    showHelperTexts ? <FormHelperText>the <a href='https://en.wikipedia.org/wiki/Well-known_text_representation_of_coordinate_reference_systems' rel='noreferrer' target='_blank'>WKT</a> string of the raster data spatial reference. x and y units are derived from the spatial reference. vertical units are assumed to be meters</FormHelperText> : null
                }
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={`cellsize (${converterInt.projUnitAbbr})`}
                    value={cellsizeInt > 0 ? cellsizeInt : ''}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleCellsizeInputChange}
                    disabled={activeStep !== STEP_INDEX_RASTER___CONFIG}
                    sx={{
                        width: '100%',

                    }}
                    slotProps={{
                        htmlInput: {
                            step: 1,
                            min: 0.01,
                            max: 1000,
                            type: 'number'
                        },
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? `pixel size in ${converterInt.projUnitAbbr}` : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={`origin-x (${converterInt.projUnitAbbr})`}
                    value={originProjInt[0]}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleOriginProjXInputChange}
                    disabled={activeStep !== STEP_INDEX_RASTER___CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? `x-coordinate of the center of the upper left pixel in ${converterInt.projUnitAbbr}` : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={`origin-y (${converterInt.projUnitAbbr})`}
                    value={originProjInt[1]}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
                    onChange={handleOriginProjYInputChange}
                    disabled={activeStep !== STEP_INDEX_RASTER___CONFIG}
                    sx={{
                        width: '100%'
                    }}
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    helperText={showHelperTexts ? `y-coordinate of the center of the upper left pixel in ${converterInt.projUnitAbbr}` : undefined}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label={'elevation-min (m)'}
                    value={valueRangeInt.min}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
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
                    value={valueRangeInt.max}
                    type={'number'}
                    variant={'outlined'}
                    size={'small'}
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
                        import raster config
                        <input
                            type={'file'}
                            onChange={(event) => handleRasterConfigImport(event.target.files!)}
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
                        showHelperTexts ? <FormHelperText>import a .pgc raster config file (<a href="example.pgc" target='_blank'>example.pgc</a>) or a .pgw world file (<a href="example.pgw" target='_blank'>example.pgw</a>) for convenience</FormHelperText> : null
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
                            size={'small'}
                            onClick={() => handleCommonConfig({
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