import { Alert, AlertTitle, Box, Checkbox, FormControlLabel, FormGroup, Snackbar, SnackbarCloseReason, Stack, Step, StepContent, StepLabel, Stepper, Typography } from "@mui/material";
import * as turf from "@turf/turf";
import { Feature, GeoJsonProperties, LineString } from "geojson";
import { createRef, useEffect, useRef, useState } from "react";
import { Contour } from '../content/Contour';
import { IContour } from '../content/IContour';
import { IHachure } from '../content/IHachure';
import { Raster } from '../raster/Raster';
import { ObjectUtil } from '../util/ObjectUtil';
import ContentComponent from './ContentComponent';
import CropComponent from './CropComponent';
import HachureConfigComponent from './HachureConfigComponent';
import HachureProcessComponent from './HachureProcessComponent';
import { IActiveStepProps } from './IActiveStepProps';
import { IHachureConfigProps } from './IHachureConfigProps';
import { IHachureProcessProps } from './IHachureProcessProps';
import { IRasterConfigProps } from './IRasterConfigProps';
import { IRasterDataProps } from './IRasterDataProps';
import RasterConfigComponent, { areRasterConfigPropsValid } from './RasterConfigComponent';
import RasterDataComponent, { areRasterDataPropsValid } from './RasterDataComponent';
import { IAlertProps } from "./IAlertProps";

export const STEP_INDEX_COMMON___CONFIG = 0;
export const STEP_INDEX_RASTER___CONFIG = 1;
export const STEP_INDEX_RASTER_____DATA = 2;
export const STEP_INDEX_HACHURE__CONFIG = 3;
export const STEP_INDEX_HACHURE_PROCESS = 4;

function ImageLoaderComponent() {

    const canvasRef = createRef<HTMLCanvasElement>();
    const svgRef = createRef<SVGSVGElement>();

    const [hachures, setHachures] = useState<IHachure[]>([]);
    const hachuresProgressRef = useRef<IHachure[]>([]);
    const hachuresCompleteRef = useRef<IHachure[]>([]);

    const [contours, setContours] = useState<IContour[]>([]);
    const contoursRef = useRef<IContour[]>([]);

    const [active, setActive] = useState<boolean>(false);
    const [showRaster, setShowRaster] = useState<boolean>(false);

    const setContourToRef = useRef<number>(-1);

    const handleRasterConfig = (rasterConfigUpdates: Omit<IRasterConfigProps, 'handleRasterConfig'>) => {
        console.debug(`📞 handling raster config (rasterConfigUpdates)`, rasterConfigUpdates);
        setRasterConfig({
            ...rasterConfigUpdates,
            handleRasterConfig
        });
        // this may only change the value range, raster data itself may not be set at that time
        setRasterData({
            ...rasterData,
            valueRange: rasterConfigUpdates.valueRange
        });
    };

    const handleRasterData = (rasterDataUpdates: Omit<IRasterDataProps, 'handleRasterData'>) => {
        console.debug(`📞 handling raster data (rasterDataUpdates)`, rasterDataUpdates);
        setRasterDataRaw({
            ...rasterDataUpdates,
            handleRasterData
        });
    };

    const handleHachureConfig = (hachureConfigUpdates: Omit<IHachureConfigProps, 'handleHachureConfig'>) => {
        console.debug(`📞 handling hachure config (hachureConfigUpdates)`, hachureConfigUpdates);
        setHachureConfig({
            ...hachureConfigUpdates,
            handleHachureConfig
        });
    };

    const handleHachureExport = () => {
        console.debug('handleHachureExport', hachures);
        const _hachures = [
            ...hachuresProgressRef.current,
            ...hachuresCompleteRef.current
        ];
        handleGeoJsonExport(_hachures.map(h => turf.feature(h.toLineString())), 'hachures');
    };

    const handleContourExport = () => {
        handleGeoJsonExport(contoursRef.current.filter(c => c.getHeight() % hachureConfig.contourDsp === 0).map(c => turf.feature(c.toLineString(), {
            label: c.getHeight().toFixed(0)
        })), 'contours');
    };

    const handleGeoJsonExport = (features: Feature<LineString, GeoJsonProperties>[], prefix: string) => {
        const featureCollection = turf.featureCollection(features);
        const a = document.createElement("a");
        const e = new MouseEvent("click");
        a.download = `${prefix}_${ObjectUtil.createId()}.geojson`;
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(featureCollection, (_key, val) => {
            return val.toFixed ? Number(val.toFixed(7)) : val;
        }));
        a.dispatchEvent(e);
    };

    const handleActiveStep = (activeStepUpdates: Omit<IActiveStepProps, 'handleActiveStep' | 'handleAlertProps' | 'showHelperTexts'>) => {
        console.debug(`📞 handling active step (activeStepUpdates)`, activeStepUpdates);
        setActiveStep({
            ...activeStep,
            ...activeStepUpdates,
        });
    };

    const handleAlertProps = (alertPropsUpdates: Omit<IAlertProps, 'open'>) => {
        console.debug(`📞 handling alert props (alertProps)`, alertProps);
        setAlertProps({
            ...alertPropsUpdates,
            open: true
        });
    };

    const handleAlertPropsClose = (_event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        console.debug(`📞 handling alert props close (alertProps)`, alertProps);
        if (reason === 'clickaway') {
            return;
        }
        setAlertProps({
            ...alertProps,
            open: false
        });
    };

    const [activeStep, setActiveStep] = useState<IActiveStepProps>({
        activeStep: STEP_INDEX_RASTER___CONFIG,
        showHelperTexts: true,
        handleActiveStep,
        handleAlertProps
    });
    const [rasterConfig, setRasterConfig] = useState<IRasterConfigProps>({
        cellsize: -1,
        valueRange: {
            min: -1,
            max: -1
        },
        origin3857: [
            0,
            0
        ],
        handleRasterConfig
    });
    const [rasterDataRaw, setRasterDataRaw] = useState<IRasterDataProps>({
        name: '',
        width: -1,
        height: -1,
        valueRange: {
            min: -1,
            max: -1
        },
        data: new Float32Array(),
        blurFactor: 0,
        handleRasterData
    });
    const [rasterData, setRasterData] = useState<IRasterDataProps>({
        name: '',
        width: -1,
        height: -1,
        valueRange: {
            min: -1,
            max: -1
        },
        data: new Float32Array(),
        blurFactor: 0,
        handleRasterData
    });
    const [hachureConfig, setHachureConfig] = useState<IHachureConfigProps>({
        minSpacing: 6,
        maxSpacing: 8,
        blurFactor: 0.10,
        contourOff: 0.5,
        contourDiv: 2,
        hachureDeg: 2.5,
        contourDsp: 50,
        azimuthDeg: 280,
        propsCheck: false,
        handleHachureConfig
    });
    const [hachureProcess, setHachureProcess] = useState<IHachureProcessProps>({
        value: -1,
        valueRange: {
            min: -1,
            max: -1
        },
        handleHachureExport,
        handleContourExport
    });
    const [alertProps, setAlertProps] = useState<IAlertProps>({
        severity: 'success',
        title: '',
        message: '',
        open: false
    });



    const imageMargin = 50;

    useEffect(() => {
        console.debug('✨ building ImageLoaderComponent');
    }, []);

    const rebuildHachureRefs = () => {

        const hachuresTemp: IHachure[] = [];
        hachuresProgressRef.current.forEach(h => {
            if (h.complete) {
                // h.popLastVertex();
                hachuresCompleteRef.current.push(h);
            } else {
                hachuresTemp.push(h);
            }
        });
        hachuresCompleteRef.current = hachuresCompleteRef.current.filter(h => h.getVertexCount() > 2);
        hachuresProgressRef.current = hachuresTemp;

    };

    const fetchContours = (height: number): IContour[] => {

        // get initial contour
        const _contours: IContour[] = [];
        const contourFeatures = Raster.getContourFeatures(rasterData, [height], rasterConfig).filter(f => turf.length(f, {
            units: 'meters'
        }) > hachureConfig.contourDiv * 2); // skip very short contour lines
        contourFeatures.forEach(contourFeature => {
            _contours.push(new Contour(contourFeature, rasterConfig, hachureConfig, p => Raster.getRasterValue(rasterData, p[0], p[1])));
        });
        return _contours;

    };

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (rasterConfig)', rasterConfig);

        const minHeight = rasterConfig.valueRange.min - rasterConfig.valueRange.min % hachureConfig.contourOff + hachureConfig.contourOff;
        const maxHeight = rasterConfig.valueRange.max - rasterConfig.valueRange.max % hachureConfig.contourOff;
        setHachureProcess({
            ...hachureProcess,
            value: minHeight,
            valueRange: {
                min: minHeight,
                max: maxHeight
            }
        });

    }, [rasterConfig]);

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (rasterDataRaw)', rasterDataRaw);

        if (areRasterDataPropsValid(rasterDataRaw)) {
            setRasterData(Raster.blurRasterData(rasterDataRaw, hachureConfig.blurFactor));
        }

    }, [rasterDataRaw]);

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (rasterData)', rasterData);

        // handleSettingsUpdate();

        if (areRasterDataPropsValid(rasterData)) {

            // const canvasElement = canvasRef.current;
            const svgElement = svgRef.current!;

            // TODO :: as attributes on the element itself
            svgElement.setAttribute('viewBox', `${-imageMargin}, ${-imageMargin}, ${rasterData.width + imageMargin * 2}, ${rasterData.height + imageMargin * 2}`);
            svgElement.style.width = `${(rasterData.width + imageMargin * 2) * 2}`;
            svgElement.style.height = `${(rasterData.height + imageMargin * 2) * 2}`;

        } else { // raster data is invalid

            setActive(false);

        }

    }, [rasterData]);

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (hachureConfig)', hachureConfig);

        if (hachureConfig.blurFactor !== rasterData.blurFactor) {
            if (areRasterDataPropsValid(rasterDataRaw)) {
                setRasterData(Raster.blurRasterData(rasterDataRaw, hachureConfig.blurFactor));
            }
        }

        if (hachureConfig.propsCheck) {

            setActive(false);
            setTimeout(() => {
                setActive(true);
            }, 100);

        }

    }, [hachureConfig]);

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (active)', active);

        if (active) {

            hachuresProgressRef.current = [];
            hachuresCompleteRef.current = [];

            const minHeight = rasterConfig.valueRange.min - rasterConfig.valueRange.min % hachureConfig.contourOff + hachureConfig.contourOff;
            // const maxHeight = rasterConfig.valueRange.max - rasterConfig.valueRange.max % hachureConfig.contourOff;

            let minContourHeight = minHeight;
            let minContours: IContour[] = [];
            while (minContours.length === 0) {
                minContours = fetchContours(minContourHeight);
                minContourHeight += hachureConfig.contourOff;
            }

            // set the initial contours
            window.clearTimeout(setContourToRef.current);
            setContourToRef.current = window.setTimeout(() => {
                contoursRef.current = minContours;
                setContours(contoursRef.current);
                setHachureProcess({
                    ...hachureProcess,
                    value: minContourHeight
                });
            }, 1);

        } else {

            window.clearTimeout(setContourToRef.current);

            contoursRef.current = [];
            setContours(contoursRef.current);

            hachuresProgressRef.current = [];
            hachuresCompleteRef.current = [];
            setHachures([]);

            setHachureConfig({
                ...hachureConfig,
                propsCheck: false
            });

            setHachureProcess({
                ...hachureProcess,
                value: hachureProcess.valueRange.min
            });

        }

    }, [active]);

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (contours.length)', contours.length);

        if (contours.length > 0) {

            const _contours = [...contours];

            const curHeight = contours[contours.length - 1].getHeight();
            const curContours = contours.filter(c => c.getHeight() === curHeight && !c.complete);
            // console.log('curHeight', curHeight, curContours.length);

            if (curContours.length > 0) {

                _contours.forEach(contour => contour.complete = contour.getHeight() !== curHeight);

                for (let j = 0; j < curContours.length; j++) {
                    hachuresProgressRef.current.push(...curContours[j].handleHachures(hachuresProgressRef.current, hachuresCompleteRef.current));
                }
                hachuresProgressRef.current.forEach(h => {
                    if (h.complete) {
                        h.popLastVertex(); // complete means "got to close" at this point, shorten hachure in this case
                    }
                });

                rebuildHachureRefs();

                const nxtHeight = curHeight + hachureConfig.contourOff;
                const nxtContours = fetchContours(nxtHeight);
                // console.log('nxtHeight', nxtHeight, nxtContours.length);

                if (nxtContours.length > 0) {

                    // temporarily set to complete, if intersections are found, status may go back to incomplete
                    hachuresProgressRef.current.forEach(h => h.complete = true);
                    for (let j = 0; j < nxtContours.length; j++) {
                        hachuresProgressRef.current = nxtContours[j].intersectHachures(hachuresProgressRef.current);
                    }

                    hachuresProgressRef.current = hachuresProgressRef.current.filter(h => h.getVertexCount() > 1);

                    _contours.push(...nxtContours);

                    rebuildHachureRefs();
                    window.clearTimeout(setContourToRef.current);
                    setContourToRef.current = window.setTimeout(() => {
                        contoursRef.current = _contours;
                        setContours(contoursRef.current);
                        setHachureProcess({
                            ...hachureProcess,
                            value: nxtHeight
                        });
                    }, 1);

                } else { // done

                    _contours.forEach(c => c.complete = true);

                    hachuresProgressRef.current.forEach(h => {
                        if (!h.complete) {
                            h.complete = true;
                            // h.popLastVertex();
                        }
                    });

                    rebuildHachureRefs();
                    window.clearTimeout(setContourToRef.current);
                    setContourToRef.current = window.setTimeout(() => {
                        contoursRef.current = _contours;
                        setContours(contoursRef.current);
                        setHachureProcess({
                            ...hachureProcess,
                            value: rasterData.valueRange.max
                        });
                    }, 1);

                }

                setHachures([
                    ...hachuresProgressRef.current,
                    ...hachuresCompleteRef.current
                ]);

            }

        }

    }, [contours]);

    const renderRasterDataHeight = () => {

        const canvasElement = canvasRef.current;
        if (canvasElement && rasterData) {

            canvasElement.style.width = `${rasterData.width * 2}px`;
            canvasElement.width = rasterData.width;
            canvasElement.height = rasterData.height;

            const ctx = canvasElement.getContext("2d")!;
            ctx.fillStyle = '#eeeeee';
            ctx.fillRect(0, 0, rasterData.width, rasterData.height);

            const imageData = ctx.getImageData(0, 0, rasterData.width, rasterData.height);
            let pixelIndex: number;
            let valV: number;
            for (let y = 0; y < rasterData.height; y++) {
                for (let x = 0; x < rasterData.width; x++) {

                    pixelIndex = (y * rasterData.width + x);
                    valV = ObjectUtil.mapValues(rasterData.data[pixelIndex], {
                        min: rasterConfig.valueRange.min,
                        max: rasterConfig.valueRange.max
                    }, {
                        min: 0,
                        max: 255
                    });

                    imageData.data[pixelIndex * 4 + 0] = valV;
                    imageData.data[pixelIndex * 4 + 1] = valV;
                    imageData.data[pixelIndex * 4 + 2] = valV;

                }
            }
            ctx.putImageData(imageData, 0, 0);

        }

    };


    return (
        <>
            <Snackbar
                open={alertProps.open}
                autoHideDuration={20000}
                onClose={handleAlertPropsClose}
            >
                <Alert
                    onClose={handleAlertPropsClose}
                    severity={alertProps.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                    }}
                >
                    <AlertTitle>{alertProps.title}</AlertTitle>
                    {alertProps.message}
                </Alert>
            </Snackbar>
            <Stack
                direction={'row'}
            >
                <Box sx={{
                    mb: 2,
                    height: 'calc(100vh - 36px)',
                    width: '400px',
                    minWidth: '400px',
                    overflow: "hidden",
                    overflowY: "scroll",
                }}>

                    <Stepper activeStep={activeStep.activeStep} orientation="vertical"
                        sx={{
                            width: '100%'
                        }}
                    >
                        <Step key={'commonconf'}
                            active={true}
                            sx={{
                                width: 'inherit'
                            }}
                        >
                            <StepLabel>
                                <Typography>
                                    common settings
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <FormGroup>
                                    <FormControlLabel
                                        control={<Checkbox
                                            onChange={e => setShowRaster(e.target.checked)}
                                        />}
                                        checked={showRaster}
                                        label="show raster"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox
                                            onChange={e => setActiveStep({
                                                ...activeStep,
                                                showHelperTexts: e.target.checked
                                            })}
                                        />}
                                        checked={activeStep.showHelperTexts}
                                        label="show helper texts"
                                    />
                                </FormGroup>
                            </StepContent>
                        </Step>
                        <Step key={'rasterconf'}
                            active={true}
                            sx={{
                                width: 'inherit'
                            }}
                        >
                            <StepLabel>
                                <Typography>
                                    raster settings
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <RasterConfigComponent {...{
                                    ...rasterConfig,
                                    ...activeStep
                                }} />
                            </StepContent>
                        </Step>
                        <Step key={'pickpng'}
                            active={true}
                            sx={{
                                width: 'inherit'
                            }}
                        >
                            <StepLabel>
                                <Typography>
                                    raster data
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <RasterDataComponent {...{
                                    ...rasterData,
                                    ...rasterConfig,
                                    ...activeStep
                                }} />
                            </StepContent>
                        </Step>
                        <Step key={'hachureconf'}
                            active={true}
                            sx={{
                                width: 'inherit'
                            }}
                        >
                            <StepLabel>
                                <Typography>
                                    hachure config
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <HachureConfigComponent {...{
                                    ...hachureConfig,
                                    ...activeStep
                                }} />
                            </StepContent>
                        </Step>
                        <Step key={'hachureprocess'}
                            active={true}
                            sx={{
                                width: 'inherit'
                            }}
                        >
                            <StepLabel>
                                <Typography>
                                    hachure processing
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <HachureProcessComponent {...{
                                    ...hachureProcess,
                                    ...activeStep
                                }} />
                            </StepContent>
                        </Step>
                    </Stepper>
                </Box>

                <div
                    style={{
                        display: 'grid'
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        style={{
                            opacity: 1.0,
                            margin: `${(imageMargin - 0.5) * 2}px`,
                            gridColumn: 1,
                            gridRow: 1
                        }}
                    >
                    </canvas>
                    <svg
                        ref={svgRef}
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.0)',
                            gridColumn: 1,
                            gridRow: 1
                        }}
                    >
                        {
                            areRasterDataPropsValid(rasterData) && areRasterConfigPropsValid(rasterConfig) ? <CropComponent {...{
                                ...rasterConfig,
                                minPosition3857: rasterConfig.origin3857,
                                maxPosition3857: [
                                    rasterConfig.origin3857[0] + (rasterData.width - 1) * rasterConfig.cellsize,
                                    rasterConfig.origin3857[1] - (rasterData.height - 1) * rasterConfig.cellsize,
                                ]
                            }}></CropComponent> : null
                        }
                        {
                            contours.filter(c => c.getHeight() % hachureConfig.contourDsp === 0 || !c.complete).map(c => <ContentComponent key={c.id} svgData={c.svgData} complete={c.complete} strokeWidth={0.33} />)
                        }
                        {
                            hachures.map(h => <ContentComponent key={h.id} svgData={h.svgData} complete={h.complete} strokeWidth={0.25} />)
                        }
                    </svg>
                </div>

            </Stack>

        </>
    );
}

export default ImageLoaderComponent;