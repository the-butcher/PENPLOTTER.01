import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Button, Slider, Stack, Step, StepContent, StepLabel, Stepper, Typography } from "@mui/material";
import { Mark } from '@mui/material/Slider/useSlider.types';
import * as turf from "@turf/turf";
import * as d3Array from 'd3-array';
import * as d3Contour from 'd3-contour';
import { Feature, GeoJsonProperties, LineString } from "geojson";
import { createRef, useEffect, useRef, useState } from "react";
import { Contour } from '../contour/Contour';
import { Hachure } from '../contour/Hachure';
import { IContour } from '../contour/IContour';
import { IContourProperties } from '../contour/IContourProperties';
import { IHachure } from '../contour/IHachure';
import { IRasterData } from '../raster/IRasterData';
import { Png16Loader } from '../raster/Png16Loader';
import { Raster } from '../raster/Raster';
import { GeometryUtil } from '../util/GeometryUtil';
import { ObjectUtil } from '../util/ObjectUtil';
import ContentComponent from './ContentComponent';
import CropComponent from './CropComponent';

function ImageLoaderComponent() {

    const canvasRef = createRef<HTMLCanvasElement>();
    const svgRef = createRef<SVGSVGElement>();

    const [rasterDataHeight, setRasterDataHeight] = useState<IRasterData>();
    const [hachures, setHachures] = useState<IHachure[]>([]);
    const [contours, setContours] = useState<IContour[]>([]);

    const [minHeight, setMinHeight] = useState<number>(0);
    const [maxHeight, setMaxHeight] = useState<number>(0);

    const hachuresProgressRef = useRef<IHachure[]>([]);
    const hachuresCompleteRef = useRef<IHachure[]>([]);

    const imageMargin = 50;

    const getContourFeatures = (rasterData: IRasterData, thresholds: number[]): Feature<LineString, IContourProperties>[] => {

        const contourMultiPolygons: d3Contour.ContourMultiPolygon[] = d3Contour.contours().size([rasterData.width, rasterData.height]).thresholds(thresholds)(Array.from(rasterData.data));

        const contourFeatures: Feature<LineString, IContourProperties>[] = [];
        let contourFeature: Feature<LineString, IContourProperties> | undefined;
        contourMultiPolygons.forEach(contourMultiPolygon => {
            contourMultiPolygon.coordinates.forEach(contourPolygon => {
                contourPolygon.forEach(contourRing => {
                    contourRing.forEach(contourCoordinate => {
                        if (contourCoordinate[0] < 1 || contourCoordinate[0] > rasterData.width - 1 || contourCoordinate[1] < 1 || contourCoordinate[1] > rasterData.height - 1) {
                            contourFeature = undefined;
                        } else {
                            if (!contourFeature) {
                                contourFeature = turf.feature({
                                    type: 'LineString',
                                    coordinates: []
                                }, {
                                    height: contourMultiPolygon.value

                                });
                                contourFeatures.push(contourFeature);
                            }
                            contourFeature.geometry.coordinates.push(GeometryUtil.pixelToPosition4326(contourCoordinate));
                        }
                    });
                    contourFeature = undefined;
                });
                contourFeature = undefined;
            });
        });

        return GeometryUtil.connectContours(contourFeatures, 1);

    }

    useEffect(() => {

        console.debug('✨ building ImageLoaderComponent');

        const canvasElement = canvasRef.current;
        const svgElement = svgRef.current;

        if (canvasElement && svgElement) {

            new Png16Loader().load(Raster.CONFIG.rasterName).then(imageDataRaw => {

                const _imageDataHeight: IRasterData = {
                    ...imageDataRaw,
                    data: imageDataRaw.data.map(v => Raster.sampleToHeight(v))
                }

                console.log('_imageDataHeight', _imageDataHeight, Raster.getSampleRange(_imageDataHeight));

                // initial blur of height raster to desired resolution
                d3Array.blur2({ data: _imageDataHeight.data, width: _imageDataHeight.width }, Hachure.CONFIG.blurFactor);
                setRasterDataHeight(_imageDataHeight);

            });

        }

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
        hachuresCompleteRef.current = hachuresCompleteRef.current.filter(h => h.getVertexCount() > 2)
        hachuresProgressRef.current = hachuresTemp;

    }

    const fetchContours = (height: number): IContour[] => {

        // get initial contour
        const _contours: IContour[] = [];
        const contourFeatures = getContourFeatures(rasterDataHeight!, [height]).filter(f => turf.length(f, {
            units: 'meters'
        }) > Hachure.CONFIG.contourDiv * 2); // skip very short contour lines
        contourFeatures.forEach(contourFeature => {
            _contours.push(new Contour(contourFeature, p => Raster.getRasterValue(rasterDataHeight!, p[0], p[1])));
        });
        return _contours;

    }

    useEffect(() => {

        console.log('⚙ updating ImageLoaderComponent (rasterDataHeight)', rasterDataHeight);

        if (rasterDataHeight) {

            // TODO :: as attributes on the element itself
            const svgElement = svgRef.current!;
            svgElement.setAttribute('viewBox', `${-imageMargin}, ${-imageMargin}, ${rasterDataHeight.width + imageMargin * 2}, ${rasterDataHeight.height + imageMargin * 2}`);
            svgElement.style.width = `${(rasterDataHeight.width + imageMargin * 2) * 2}`;
            svgElement.style.height = `${(rasterDataHeight.height + imageMargin * 2) * 2}`;

            const _minHeight = Raster.CONFIG.valueRangeRaster.min - Raster.CONFIG.valueRangeRaster.min % Hachure.CONFIG.contourOff + Hachure.CONFIG.contourOff;
            const _maxHeight = Raster.CONFIG.valueRangeRaster.max - Raster.CONFIG.valueRangeRaster.max % Hachure.CONFIG.contourOff;

            setMinHeight(_minHeight);
            setMaxHeight(_maxHeight);

            // renderRasterDataHeight();

        }

    }, [rasterDataHeight]);

    useEffect(() => {

        console.log('⚙ updating ImageLoaderComponent (minHeight, maxHeight)', minHeight, maxHeight);

        if (minHeight > 0 && maxHeight > 0) {

            hachuresProgressRef.current = [];
            hachuresCompleteRef.current = [];

            let minContourHeight = minHeight;
            let minContours: IContour[] = [];
            while (minContours.length === 0) {
                minContours = fetchContours(minContourHeight);
                minContourHeight += Hachure.CONFIG.contourOff;
            }
            // console.log('initial contours', _contours)
            // TODO :: do this until contours are available (in edge cases the lowest contour may all be filtered due to insufficient length)
            setTimeout(() => {
                setContours(minContours);
            }, 1)

        }

    }, [minHeight, maxHeight]);

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (contours)', contours.length);

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

                const nxtHeight = curHeight + Hachure.CONFIG.contourOff;
                const nxtContours = fetchContours(nxtHeight);
                // console.log('nxtHeight', nxtHeight, nxtContours.length);

                if (nxtContours.length > 0) {

                    // temporarily set to complete, if intersections are found, status may go back to incomplete
                    hachuresProgressRef.current.forEach(h => h.complete = true);
                    for (let j = 0; j < nxtContours.length; j++) {
                        hachuresProgressRef.current = nxtContours[j].intersectHachures(hachuresProgressRef.current);
                    }

                    hachuresProgressRef.current = hachuresProgressRef.current.filter(h => h.getVertexCount() > 1)

                    _contours.push(...nxtContours);

                    rebuildHachureRefs();
                    setTimeout(() => {
                        setContours(_contours);
                    }, 1);

                } else { // done

                    _contours.forEach(c => c.complete = true);

                    // hachuresProgressRef.current = hachuresProgressRef.current.filter(h => h.getVertexCount() > 2)
                    // hachuresCompleteRef.current = hachuresCompleteRef.current.filter(h => h.getVertexCount() > 2)
                    hachuresProgressRef.current.forEach(h => {
                        if (!h.complete) {
                            h.complete = true;
                            // h.popLastVertex();
                        }
                    });

                    rebuildHachureRefs();
                    setTimeout(() => {
                        setContours(_contours);
                    }, 1);

                }

                setHachures([
                    ...hachuresProgressRef.current,
                    ...hachuresCompleteRef.current
                ]);

            }

        }

    }, [contours]);

    useEffect(() => {

        console.debug('⚙ updating ImageLoaderComponent (hachures)', hachures.length);

        if (hachures.length > 0) {
            // nothing
        }

    }, [hachures]);

    const renderRasterDataHeight = () => {

        if (rasterDataHeight) {

            const canvasElement = canvasRef.current!;
            canvasElement.style.width = `${rasterDataHeight.width * 2}px`;
            canvasElement.width = rasterDataHeight.width;
            canvasElement.height = rasterDataHeight.height;

            const ctx = canvasElement.getContext("2d")!;
            ctx.fillStyle = '#eeeeee';
            ctx.fillRect(0, 0, rasterDataHeight.width, rasterDataHeight.height);

            const imageData = ctx.getImageData(0, 0, rasterDataHeight.width, rasterDataHeight.height);
            let pixelIndex: number;
            let valV: number;
            for (let y = 0; y < rasterDataHeight.height; y++) {
                for (let x = 0; x < rasterDataHeight.width; x++) {

                    pixelIndex = (y * rasterDataHeight.width + x);
                    valV = ObjectUtil.mapValues(rasterDataHeight.data[pixelIndex], {
                        min: Raster.CONFIG.valueRangeRaster.min,
                        max: Raster.CONFIG.valueRangeRaster.max
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

    }

    const exportHachuresGeoJson = () => {

        exportGeoJson(hachures.map(h => turf.feature(h.toLineString())), 'hachures');

    }

    const exportContoursGeoJson = () => {

        exportGeoJson(contours.filter(c => c.getHeight() % Hachure.CONFIG.contourDsp === 0).map(c => turf.feature(c.toLineString(), {
            label: c.getHeight().toFixed(0)
        })), 'contours');

    }

    const exportGeoJson = (features: Feature<LineString, GeoJsonProperties>[], prefix: string) => {

        const featureCollection = turf.featureCollection(features);

        const a = document.createElement("a");
        const e = new MouseEvent("click");
        a.download = `${prefix}_${ObjectUtil.createId()}.geojson`;
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(featureCollection, (_key, val) => {
            return val.toFixed ? Number(val.toFixed(7)) : val;
        }));
        a.dispatchEvent(e);

    }

    const createMark = (value: number): Mark => {
        return {
            value: value,
            label: `${value.toFixed(2)}m`
        };
    }

    const getCurHeight = () => {
        return contours.length > 0 ? contours[contours.length - 1].getHeight() : minHeight;
    }

    return (
        <Stack>
            <Stack
                direction={'row'}
            >
                <div>
                    <Stepper activeStep={1} orientation="vertical"
                        sx={{
                            width: '250px'
                        }}
                    >
                        <Step key={'pickpng'}
                            active={true}
                            sx={{
                                width: 'inherit'
                            }}
                        >
                            <StepLabel>
                                <Typography>
                                    content
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                {
                                    !rasterDataHeight?.name ? <div>raster picker</div> : `${rasterDataHeight?.name}`
                                }
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
                                    raster
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                origin, cellsize, valrange
                            </StepContent>
                        </Step>
                    </Stepper>
                </div>
                <div
                    style={{
                        display: 'grid'
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        style={{
                            // position: 'absolute',
                            // left: '100px',
                            // top: '100px',
                            opacity: 1.0,
                            // paddingBottom: '20px',
                            margin: `${(imageMargin - 0.5) * 2}px`,
                            gridColumn: 1,
                            gridRow: 1
                        }}
                    >
                    </canvas>
                    <svg
                        ref={svgRef}
                        style={{
                            // position: 'absolute',
                            // left: '100px',
                            // top: '100px',
                            backgroundColor: 'rgba(0,0,0,0.0)',
                            // paddingBottom: '50px',
                            gridColumn: 1,
                            gridRow: 1
                        }}
                    >
                        {
                            rasterDataHeight ? <CropComponent
                                minPosition3857={Raster.CONFIG.rasterOrigin3857}
                                maxPosition3857={[
                                    Raster.CONFIG.rasterOrigin3857[0] + (rasterDataHeight.width - 1) * Raster.CONFIG.cellsize,
                                    Raster.CONFIG.rasterOrigin3857[1] - (rasterDataHeight.height - 1) * Raster.CONFIG.cellsize,
                                ]}></CropComponent> : null
                        }
                        {
                            contours.filter(c => c.getHeight() % Hachure.CONFIG.contourDsp === 0 || !c.complete).map(c => <ContentComponent key={c.id} svgData={c.svgData} complete={c.complete} strokeWidth={0.33} />)
                        }
                        {
                            hachures.map(h => <ContentComponent key={h.id} svgData={h.svgData} complete={h.complete} strokeWidth={0.25} />)
                        }
                    </svg>
                </div>
                <div>
                    <Slider

                        orientation="vertical"
                        // valueLabelDisplay="on"
                        aria-label="height"
                        value={getCurHeight()}
                        min={minHeight}
                        max={maxHeight}
                        // valueLabelFormat={value => `${value.toFixed(2)}m`}
                        marks={[
                            createMark(minHeight),
                            createMark(getCurHeight()),
                            createMark(maxHeight),
                        ]}
                        sx={{
                            height: '100%'
                        }}
                    />
                </div>
            </Stack>
            <Stack
                direction={'row'}
            >
                <Button
                    sx={{
                        width: '200px',
                        margin: '12px'
                    }}
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<UploadFileIcon />}
                    onClick={exportHachuresGeoJson}
                >download hachures</Button>
                <Button
                    sx={{
                        width: '200px',
                        margin: '12px'
                    }}
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<UploadFileIcon />}
                    onClick={exportContoursGeoJson}
                >download contours</Button>
            </Stack>

        </Stack>
    );
}

export default ImageLoaderComponent;