import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import { Alert, AlertTitle, Box, Checkbox, Divider, FormControlLabel, FormGroup, FormHelperText, IconButton, Snackbar, SnackbarCloseReason, Stack, Step, StepContent, StepLabel, Stepper, Typography } from "@mui/material";
import * as turf from "@turf/turf";
import { Feature, GeoJsonProperties, LineString } from "geojson";
import { createRef, useEffect, useRef, useState } from "react";
import { Contour } from '../content/Contour';
import { IContour } from '../content/IContour';
import { IHachure } from '../content/IHachure';
import { ISurface } from '../content/ISurface';
import { Raster } from '../raster/Raster';
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from '../util/ObjectUtil';
import ContentComponent from './ContentComponent';
import CropComponent from './CropComponent';
import HachureConfigComponent, { toAvgSpacingDefault, toContourDivDefault, toHachureDimDefault } from './HachureConfigComponent';
import HachureProcessComponent from './HachureProcessComponent';
import { IAlertProps } from "./IAlertProps";
import { ICommonConfigProps } from './ICommonConfigProps';
import { HACHURE_CONFIG_DEFAULT_METERS, IHachureConfigProps, toContourDspOption, toContourOffOptions } from './IHachureConfigProps';
import { IHachureProcessProps } from './IHachureProcessProps';
import { IRasterConfigProps } from './IRasterConfigProps';
import { IRasterDataProps } from './IRasterDataProps';
import RasterConfigComponent, { areRasterConfigPropsValid } from './RasterConfigComponent';
import RasterDataComponent, { areRasterDataPropsValid } from './RasterDataComponent';

export const STEP_INDEX_COMMON___CONFIG = 0;
export const STEP_INDEX_RASTER___CONFIG = 1;
export const STEP_INDEX_RASTER_____DATA = 2;
export const STEP_INDEX_HACHURE__CONFIG = 3;
export const STEP_INDEX_HACHURE_PROCESS = 4;

/**
 * central component of the app. all dependencies and flow is taken care of here
 *
 * @returns
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
function ImageLoaderComponent() {

    const canvasRef = createRef<HTMLCanvasElement>();

    // const svgRef = useCallback((svgElement: SVGSVGElement) => {
    //     if (svgElement !== null) {
    //         console.log('svgElement', svgElement);
    //     }
    // }, []);
    const svgRef = useRef<SVGSVGElement>();
    const svgCallbackRef = (svgElement: SVGSVGElement) => {

        if (svgElement && !svgRef.current) {

            console.log('svgElement', svgElement);
            svgRef.current = svgElement;

            document.addEventListener('keydown', e => {
                if (e.key === 'p') {
                    window.clearTimeout(setExportPngRef.current);
                    setExportPngRef.current = window.setTimeout(() => {
                        exportToPng(svgRef.current!);
                    }, 100);
                }
            });

        }
    };


    const [hachures, setHachures] = useState<IHachure[]>([]);
    const hachuresProgressRef = useRef<IHachure[]>([]);
    const hachuresCompleteRef = useRef<IHachure[]>([]);

    const [contours, setContours] = useState<IContour[]>([]);
    const contoursRef = useRef<IContour[]>([]);

    const surfaceRef = useRef<ISurface>();

    const [active, setActive] = useState<boolean>(false);
    const [showRaster, setShowRaster] = useState<boolean>(true);

    const setContourToRef = useRef<number>(-1);
    const setExportPngRef = useRef<number>(-1);

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
        if (rasterConfigUpdates.cellsize > 0) {
            const contourDsp = toContourDspOption(2 * rasterConfigUpdates.cellsize / rasterConfigUpdates.converter.metersPerUnit);
            const avgSpacing = toAvgSpacingDefault(rasterConfigUpdates);
            const contourDiv = toContourDivDefault(rasterConfigUpdates);
            const hachureDim = toHachureDimDefault(rasterConfigUpdates);
            setHachureConfig({
                ...hachureConfig,
                avgSpacing,
                contourOff: toContourOffOptions(contourDsp)[1],
                contourDiv,
                contourDsp,
                hachureDim,
                handleHachureConfig
            });
        }
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

    const handleHachureExport = (minZ: number, maxZ: number) => {
        console.debug('handleHachureExport', hachures);
        const _hachures = [
            ...hachuresProgressRef.current,
            ...hachuresCompleteRef.current
        ].filter(h => h.getLastVertex().height >= minZ || h.getFirstVertex().height <= maxZ);
        handleGeoJsonExport(_hachures.map(h => turf.feature(h.toLineString(minZ, maxZ), {
            minHeight: h.getFirstVertex().height,
            maxHeight: h.getLastVertex().height,
        })), 'hachures');
    };

    const handleContourExport = (minZ: number, maxZ: number) => {
        handleGeoJsonExport(contoursRef.current.filter(c => c.getHeight() % hachureConfig.contourDsp === 0 && c.getHeight() >= minZ && c.getHeight() <= maxZ).map(c => turf.feature(c.toLineString(minZ, maxZ), {
            height: c.getHeight().toFixed(0)
        })), 'contours');
    };

    const handleSurfaceExport = () => {
        const a = document.createElement("a");
        const e = new MouseEvent("click");
        a.download = `surface_${ObjectUtil.createId()}.json`;
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(surfaceRef.current, (_key, val) => {
            return val.toFixed ? Number(val.toFixed(2)) : val;
        }));
        a.dispatchEvent(e);
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

    const handleCommonConfig = (commonConfigUpdates: Omit<ICommonConfigProps, 'handleCommonConfig' | 'handleAlertProps' | 'showHelperTexts'>) => {
        console.log(`📞 handling common config (commonConfigUpdates)`, commonConfigUpdates, commonConfigRef.current);
        commonConfigRef.current = {
            ...commonConfigRef.current,
            ...commonConfigUpdates,
        };
        setCommonConfig(commonConfigRef.current);
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

    const commonConfigRef = useRef<ICommonConfigProps>({
        activeStep: STEP_INDEX_RASTER___CONFIG,
        showHelperTexts: true,
        handleCommonConfig,
        handleAlertProps
    });
    const [commonConfig, setCommonConfig] = useState<ICommonConfigProps>(commonConfigRef.current);
    const [rasterConfig, setRasterConfig] = useState<IRasterConfigProps>({
        cellsize: -1,
        wkt: GeometryUtil.WKT_3857,
        valueRange: {
            min: 0,
            max: 1
        },
        originProj: [
            0,
            0
        ],
        converter: {
            convert4326ToProj: turf.toMercator,
            convertProjTo4326: turf.toWgs84,
            metersPerUnit: 1,
            projUnitName: 'meters',
            projUnitAbbr: 'm'
        },
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
        ...HACHURE_CONFIG_DEFAULT_METERS,
        handleHachureConfig
    });
    const [hachureProcess, setHachureProcess] = useState<IHachureProcessProps>({
        value: -1,
        valueRange: {
            min: -1,
            max: -1
        },
        handleHachureExport,
        handleContourExport,
        handleSurfaceExport
    });
    const [alertProps, setAlertProps] = useState<IAlertProps>({
        severity: 'success',
        title: '',
        message: '',
        open: false
    });

    const imageMargin = 55;

    useEffect(() => {
        console.debug('✨ building ImageLoaderComponent');
        // console.log('svgRef', svgRef);

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
        const minLength = hachureConfig.contourDiv * 2;
        const _contours: IContour[] = [];
        const contourFeatures = Raster.getContourFeatures(rasterData, [height], rasterConfig).filter(f => turf.length(f, {
            units: rasterConfig.converter.projUnitName
        }) > minLength); // skip very short contour lines
        contourFeatures.forEach(contourFeature => {
            _contours.push(new Contour(contourFeature, rasterConfig, hachureConfig, p => Raster.getRasterValue(rasterData, p[0], p[1])));
        });
        return _contours;

    };

    const recalculateHeights = () => {
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
    };

    useEffect(() => {

        console.log('⚙ updating ImageLoaderComponent (commonConfig)', commonConfig);

    }, [commonConfig]);

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (rasterConfig)', rasterConfig);
        recalculateHeights();

    }, [rasterConfig]);

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (rasterDataRaw)', rasterDataRaw);

        if (areRasterDataPropsValid(rasterDataRaw)) {
            setRasterData(Raster.blurRasterData(rasterDataRaw, hachureConfig.blurFactor));
        }

    }, [rasterDataRaw]);

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (rasterData)', rasterData);

        if (areRasterDataPropsValid(rasterData)) {

            const svgElement = svgRef.current!;

            // TODO :: as attributes on the element itself
            svgElement.setAttribute('viewBox', `${-imageMargin}, ${-imageMargin}, ${rasterData.width + imageMargin * 2}, ${rasterData.height + imageMargin * 2}`);
            svgElement.style.width = `${(rasterData.width + imageMargin * 2) * 2}`;
            svgElement.style.height = `${(rasterData.height + imageMargin * 2) * 2}`;

            renderRasterData(rasterData);

            const _surface: ISurface = {
                originProj: rasterConfig.originProj,
                width: rasterData.width,
                height: rasterData.height,
                cellsize: rasterConfig.cellsize,
                data: []
            };

            // const surfacePositions: IPositionProperties[] = [];
            for (let y = 0; y < rasterData.height; y++) {
                for (let x = 0; x < rasterData.width; x++) {

                    _surface.data.push(Raster.getRasterValue(rasterData, x, y));

                    // const positionPixl: Position = [
                    //     x,
                    //     y,
                    //     r
                    // ];
                    // const position4326: Position = [
                    //     ...GeometryUtil.pixelToPosition4326(positionPixl, rasterConfig),
                    //     r
                    // ];
                    // surfacePositions.push({
                    //     positionPixl,
                    //     position4326
                    // });

                }
            }
            surfaceRef.current = _surface;

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

            recalculateHeights();
            setActive(false);
            setShowRaster(false);
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

            // console.log('minHeight', minHeight);

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

                const nxtHeight = Math.round((curHeight + hachureConfig.contourOff) * 1000) / 1000;
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
                        contoursRef.current = _contours.filter(c => c.getHeight() % hachureConfig.contourDsp === 0 || !c.complete);
                        setContours(contoursRef.current);
                        setHachureProcess({
                            ...hachureProcess,
                            value: nxtHeight
                        });
                    }, 1);

                } else { // done

                    // console.warn("no more next");

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
                        // contoursRef.current = _contours;
                        contoursRef.current = _contours.filter(c => c.getHeight() % hachureConfig.contourDsp === 0 || !c.complete);
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

            } else {

                // TODO :: if not finalized yet => finalize (and maybe run another handleHachure iteration)
                // console.warn("no more curr");

            }

        }

    }, [contours]);

    const renderRasterData = (_rasterData: IRasterDataProps) => {

        const canvasElement = canvasRef.current;
        if (canvasElement) {

            canvasElement.style.width = `${_rasterData.width * 2}px`;
            canvasElement.width = _rasterData.width;
            canvasElement.height = _rasterData.height;

            const ctx = canvasElement.getContext("2d")!;
            ctx.fillStyle = '#eeeeee';
            ctx.fillRect(0, 0, _rasterData.width, _rasterData.height);

            const imageData = ctx.getImageData(0, 0, _rasterData.width, _rasterData.height);
            let pixelIndex: number;
            let valV: number;
            for (let y = 0; y < _rasterData.height; y++) {
                for (let x = 0; x < _rasterData.width; x++) {

                    pixelIndex = (y * _rasterData.width + x);
                    valV = ObjectUtil.mapValues(_rasterData.data[pixelIndex], {
                        min: rasterConfig.valueRange.min,
                        max: rasterConfig.valueRange.max
                    }, {
                        min: 0,
                        max: 128
                    });

                    imageData.data[pixelIndex * 4 + 0] = valV;
                    imageData.data[pixelIndex * 4 + 1] = valV;
                    imageData.data[pixelIndex * 4 + 2] = valV;

                }
            }
            ctx.putImageData(imageData, 0, 0);

        }

    };

    const handleShowHelperTextChange = (showHelperTexts: boolean) => {
        commonConfigRef.current = {
            ...commonConfigRef.current,
            showHelperTexts
        };
        setCommonConfig(commonConfigRef.current);
    };


    /**
     * https://gist.github.com/SunPj/14fe4f10db43be2d84751f5595d48246
     * @param stylesheet
     * @returns
     */
    const stringifyStylesheet = (stylesheet: CSSStyleSheet): string => {
        return stylesheet.cssRules ? Array.from(stylesheet.cssRules).map(rule => rule.cssText || '').join('\n') : '';
    };
    /**
     * iterates all stylesheets in the document and collects and concatenates all rules from those stylesheets
     * @returns
     */
    const collectStyles = (): string => {
        return Array.from(document.styleSheets).map(s => stringifyStylesheet(s)).join('\n');
    };
    /**
     * collects all styles in the document and creates a <def/> node from it
     * needed for exporting when all current styles need to be attached to the <svg/> clone
     * @returns
     */
    const collectDefs = (): string => {
        const styles = collectStyles();
        return `<defs><style type="text/css"><![CDATA[${styles}]]></style></defs>`;
    };

    /**
     * exports this chart to a png image
     */
    const exportToPng = (svgElement: SVGSVGElement) => {

        const { width, height } = svgElement.getBoundingClientRect();

        const chartSvgClone: SVGElement = svgElement.cloneNode(true) as SVGElement;

        const defs = collectDefs();
        chartSvgClone.insertAdjacentHTML('afterbegin', defs);

        const svgContent = (new XMLSerializer()).serializeToString(chartSvgClone);
        const svgBlob = new Blob([svgContent], {
            type: 'image/svg+xml;charset=utf-8'
        });
        const svgDataUrl = URL.createObjectURL(svgBlob);

        const image = new Image();
        image.onload = () => {

            const pngPadding = 10;

            const canvas = document.createElement('canvas');
            canvas.width = width + pngPadding * 2;
            canvas.height = height + pngPadding * 2;

            const context = canvas.getContext('2d')!;
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, pngPadding, pngPadding, width, height);

            const pngDataUrl = canvas.toDataURL();
            const pngDownloadLink = document.createElement('a');
            pngDownloadLink.setAttribute('href', pngDataUrl);
            pngDownloadLink.setAttribute('download', `testpng_${ObjectUtil.createId()}`); // TODO format with dates
            pngDownloadLink.click();

        };
        image.onerror = (e) => {
            console.error('failed to complete export', e);
        };
        image.src = svgDataUrl;

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

                    <Stepper activeStep={commonConfig.activeStep} orientation="vertical"
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
                                            sx={{
                                                padding: '3px 12px'
                                            }}
                                            size={'small'}
                                            onChange={e => setShowRaster(e.target.checked)}
                                        />}
                                        disabled={!areRasterDataPropsValid(rasterData)}
                                        checked={showRaster}
                                        label="show raster"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox
                                            sx={{
                                                padding: '3px 12px'
                                            }}
                                            size={'small'}
                                            onChange={e => handleShowHelperTextChange(e.target.checked)}
                                        />}
                                        checked={commonConfig.showHelperTexts}
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
                                {
                                    commonConfig.showHelperTexts ? <FormHelperText>raster settings describe the position of the raster, its scale through cellsize and its minimum and maximum elevation. values can either be entered manually or by importing a configuration file or partially by importing a world file. the raster itself is loaded in the next step.</FormHelperText> : null
                                }
                                <RasterConfigComponent {...{
                                    ...rasterConfig,
                                    ...commonConfig
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
                                {
                                    commonConfig.showHelperTexts ? <FormHelperText>raster data can be imported in this step. the raster must be in 16_BIT_UNSIGNED format. there is an example <a href="example_arcpy.py" target="_blank">example_arcpy.py</a> script that can be used in ArcGIS Pro to export rasters in that format from a DEM layer. the raster data must be present in the Web Mercator projection (EPSG:3857).</FormHelperText> : null
                                }
                                <RasterDataComponent {...{
                                    ...rasterData,
                                    ...rasterConfig,
                                    ...commonConfig
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
                                    hachure settings
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                {
                                    commonConfig.showHelperTexts ? <FormHelperText>the hachure settings offer possibilities to alter adapt output. raster processing will start after proceeding to the next step.</FormHelperText> : null
                                }
                                <HachureConfigComponent {...{
                                    ...hachureConfig,
                                    ...rasterConfig,
                                    ...commonConfig
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
                                {
                                    commonConfig.showHelperTexts ? <FormHelperText>this step offers information about progress and the option to export hachures and contours in geojson format.</FormHelperText> : null
                                }
                                <HachureProcessComponent {...{
                                    ...hachureProcess,
                                    ...commonConfig
                                }} />
                            </StepContent>
                        </Step>
                        <Step key={'credits'}
                            active={true}
                            sx={{
                                width: 'inherit'
                            }}
                        >
                            <StepLabel>
                                <Typography>
                                    credits
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Stack direction={'row'} alignItems={'center'}>
                                    <FormHelperText>Hannes Fleischer </FormHelperText>
                                    <IconButton size='small' onClick={() => window.open('https://www.linkedin.com/in/hannes-fleischer-97621415b/')}>
                                        <LinkedInIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size='small' onClick={() => window.open('https://x.com/FleischerHannes')}>
                                        <XIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                                <Divider></Divider>
                                <FormHelperText>Inspired by an article from Daniel Huffman: <a href="https://somethingaboutmaps.wordpress.com/2024/07/07/automated-hachuring-in-qgis/">Automated Hachuring in QGIS</a></FormHelperText>
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
                            opacity: showRaster ? 1.0 : 0.0,
                            margin: `${(imageMargin - 0.5) * 2}px`,
                            gridColumn: 1,
                            gridRow: 1
                        }}
                    >
                    </canvas>
                    <svg
                        ref={svgCallbackRef}
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.0)',
                            gridColumn: 1,
                            gridRow: 1
                        }}
                    >
                        {
                            areRasterDataPropsValid(rasterData) && areRasterConfigPropsValid(rasterConfig) ? <CropComponent {...{
                                ...rasterConfig,
                                minPositionProj: rasterConfig.originProj,
                                maxPositionProj: [
                                    rasterConfig.originProj[0] + (rasterData.width - 1) * rasterConfig.cellsize,
                                    rasterConfig.originProj[1] - (rasterData.height - 1) * rasterConfig.cellsize,
                                ]
                            }}></CropComponent> : null
                        }
                        {
                            contours.filter(c => c.getHeight() % hachureConfig.contourDsp === 0 || !c.complete).map(c => <ContentComponent key={c.id} svgData={c.svgData} closed={false} complete={c.complete} background={showRaster ? 'dark' : 'light'} strokeWidth={0.25} />)
                        }
                        {
                            hachures.map(h => <ContentComponent key={h.id} svgData={h.svgData} closed={false} complete={h.complete} background={showRaster ? 'dark' : 'light'} strokeWidth={0.25} />)
                        }
                    </svg>
                </div>

            </Stack>

        </>
    );
}

export default ImageLoaderComponent;