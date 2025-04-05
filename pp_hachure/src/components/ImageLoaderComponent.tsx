import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Button } from "@mui/material";
import * as turf from "@turf/turf";
import * as d3Array from 'd3-array';
import * as d3Contour from 'd3-contour';
import { Feature, GeoJsonProperties, LineString } from "geojson";
import { createRef, useEffect, useState } from "react";
import { Contour } from '../contour/Contour';
import { Hachure } from '../contour/Hachure';
import { IContour } from '../contour/IContour';
import { IContourProperties } from '../contour/IContourProperties';
import { IHachure } from '../contour/IHachure';
import { GeometryUtil } from '../util/GeometryUtil';
import { IRasterData } from '../util/IRasterData';
import { ObjectUtil } from '../util/ObjectUtil';
import { RasterLoader } from '../util/RasterLoader';
import { RasterUtil } from '../util/RasterUtil';

function ImageLoaderComponent() {

    const canvasRef = createRef<HTMLCanvasElement>();
    const svgRef = createRef<SVGSVGElement>();

    const [rasterDataHeight, setRasterDataHeight] = useState<IRasterData>();

    const [dH, setDH] = useState<string>('');
    // const [dV, setDV] = useState<string>('');
    // const [dW, setDW] = useState<string>('');
    const [dL, setDL] = useState<string>('');
    // const [dS, setDS] = useState<string>('');

    const [hachures, setHachures] = useState<IHachure[]>([]);
    const [contours, setContours] = useState<IContour[]>([]);


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

            new RasterLoader().load('png_10_10_height_scaled_pynb_r8g8.png', GeometryUtil.sampleToHeight).then(_imageDataHeight => {

                console.log('_imageDataHeight', _imageDataHeight);

                // initial blur
                d3Array.blur2({ data: _imageDataHeight.data, width: _imageDataHeight.width }, Hachure.CONFIG.blurFactor);
                setRasterDataHeight(_imageDataHeight);

            });

        }

    }, []);

    useEffect(() => {

        console.log('⚙ updating ImageLoaderComponent (rasterDataHeight)', rasterDataHeight);

        if (rasterDataHeight) {

            const minHeight = GeometryUtil.heightRangeRaster.min - GeometryUtil.heightRangeRaster.min % Hachure.CONFIG.contourOff + Hachure.CONFIG.contourOff;
            const maxHeight = GeometryUtil.heightRangeRaster.max - GeometryUtil.heightRangeRaster.max % Hachure.CONFIG.contourOff;

            console.log('minHeight', minHeight, 'maxHeight', maxHeight);
            const thresholds: number[] = [];
            for (let i = minHeight; i <= maxHeight; i += Hachure.CONFIG.contourOff) {
                thresholds.push(i);
            }

            const svgElement = svgRef.current!;
            svgElement.setAttribute('viewBox', `0, 0, ${rasterDataHeight.width}, ${rasterDataHeight.height}`);
            svgElement.style.width = `${rasterDataHeight.width * 4}`;
            svgElement.style.height = `${rasterDataHeight.height * 4}`;

            const _contours: IContour[] = [];

            console.log('building contours ....');
            const contourFeatures = getContourFeatures(rasterDataHeight, thresholds).filter(f => turf.length(f, {
                units: 'meters'
            }) > Hachure.CONFIG.contourDiv * 2);
            let height = -1;
            contourFeatures.forEach(contourFeature => {
                // just for logging
                if (contourFeature.properties.height != height) {
                    height = contourFeature.properties.height;
                    console.log('contour height: ', height);
                }
                _contours.push(new Contour(contourFeature, p => RasterUtil.getRasterValue(rasterDataHeight, p[0], p[1])));
            });

            let _dL = '';
            _contours.filter(c => c.getHeight() % Hachure.CONFIG.contourDsp === 0).forEach(contour => {
                _dL += contour.getSvgData()
            });
            setDL(_dL);

            console.log('done building contours');

            console.log('building hachures ....');

            let _hachuresProgress: IHachure[] = [];
            let _hachuresComplete: IHachure[] = [];
            let _hachuresTemp: IHachure[] = [];
            for (let i = 0; i < thresholds.length - 1; i++) {

                const heightA = thresholds[i];
                const heightB = thresholds[i + 1];

                console.log(`handling heights: ${heightA}, ${heightB} (${_hachuresProgress.length}, ${_hachuresComplete.length})`);

                const heightAContours = _contours.filter(c => c.getHeight() === heightA);

                // const extraHachuresA: IHachure[] = [];
                for (let j = 0; j < heightAContours.length; j++) {
                    _hachuresProgress.push(...heightAContours[j].handleHachures(_hachuresProgress, _hachuresComplete));
                }

                _hachuresTemp = [];
                _hachuresProgress.forEach(h => {
                    if (h.isComplete()) {
                        h.popLastVertex(); // complete means "got to close" at this point, shorten hachure in this case
                        _hachuresComplete.push(h);
                    } else {
                        _hachuresTemp.push(h);
                    }
                });
                _hachuresProgress = _hachuresTemp;

                _hachuresProgress.forEach(h => h.setComplete())
                const heightBContours = _contours.filter(c => c.getHeight() === heightB);
                for (let j = 0; j < heightBContours.length; j++) {
                    _hachuresProgress = heightBContours[j].intersectHachures(_hachuresProgress);
                }

                _hachuresProgress = _hachuresProgress.filter(h => h.getVertexCount() > 1)

                _hachuresTemp = [];
                _hachuresProgress.forEach(h => {
                    if (h.isComplete()) { // still complete means did not find intersection
                        _hachuresComplete.push(h);
                    } else {
                        _hachuresTemp.push(h);
                    }
                });
                _hachuresProgress = _hachuresTemp;

            }

            // one more time filtering by distance, so some hachures can have their last vertex removed
            const heightA = thresholds[thresholds.length - 1];
            const heightAContours = _contours.filter(c => c.getHeight() === heightA);

            for (let j = 0; j < heightAContours.length; j++) {
                _hachuresProgress.push(...heightAContours[j].handleHachures(_hachuresProgress, _hachuresComplete));
            }

            _hachuresTemp = [];
            _hachuresProgress.forEach(h => {
                if (h.isComplete()) {
                    h.popLastVertex(); // complete means "got to close" at this point, shorten hachure in this case
                    _hachuresComplete.push(h);
                } else {
                    _hachuresTemp.push(h);
                }
            });
            _hachuresProgress = _hachuresTemp;

            _hachuresProgress = _hachuresProgress.filter(h => h.getVertexCount() > 2)
            _hachuresComplete = _hachuresComplete.filter(h => h.getVertexCount() > 2)

            setHachures([
                ..._hachuresProgress,
                ..._hachuresComplete
            ]);
            setContours(_contours.filter(c => c.getHeight() % Hachure.CONFIG.contourDsp === 0));

        }

    }, [rasterDataHeight]);

    useEffect(() => {

        console.log('⚙ updating ImageLoaderComponent (hachures)', hachures);

        if (hachures) {

            let _dH = '';
            // let _dS = '';

            hachures.forEach(hachure => {
                _dH += hachure.getSvgData();
            });
            // hachures.forEach(hachure => {
            //     _dS += hachure.getSvgDataSteep()
            // });


            setDH(_dH);
            // setDS(_dS);
            // renderRasterDataHeight();

        }

    }, [hachures, contours]);

    const renderRasterDataHeight = () => {

        if (rasterDataHeight) {

            const canvasElement = canvasRef.current!;
            canvasElement.style.width = `${rasterDataHeight.width * 4}px`;
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
                        min: GeometryUtil.heightRangeRaster.min,
                        max: GeometryUtil.heightRangeRaster.max * 2
                    }, {
                        min: 0,
                        max: 255
                    });
                    // valV = ObjectUtil.mapValues(rasterDataAspect2.data[pixelIndex], {
                    //     min: 0,
                    //     max: 360
                    // }, {
                    //     min: 0,
                    //     max: 255
                    // });
                    // valV = ObjectUtil.mapValues(rasterDataSlope2.data[pixelIndex], {
                    //     min: 0,
                    //     max: 30
                    // }, {
                    //     min: 0,
                    //     max: 255
                    // });

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

        exportGeoJson(contours.map(c => turf.feature(c.toLineString(), {
            label: c.getHeight().toFixed(0)
        })), 'contours');

    }

    const exportGeoJson = (features: Feature<LineString, GeoJsonProperties>[], prefix: string) => {

        const featureCollection = turf.featureCollection(features);

        const a = document.createElement("a");
        const e = new MouseEvent("click");
        a.download = `${prefix}_${ObjectUtil.createId()}.geojson`;
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(featureCollection));
        a.dispatchEvent(e);

    }

    // const exportSVG = () => {

    //     // https://stackoverflow.com/questions/60241398/how-to-download-and-svg-element-as-an-svg-file
    //     const svg = svgRef.current;

    //     if (svg) {

    //         svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    //         svg.style.width = `${svgRef.current.width}`;
    //         svg.style.height = `${svgRef.current.height}`;
    //         svg.style.maxWidth = `${svgRef.current.width}`;
    //         svg.style.maxHeight = `${svgRef.current.height}`;
    //         svg.style.transform = '';

    //         const outerSVG = svg!.outerHTML;

    //         svg.style.width = `${svgRef.current.width}`;
    //         svg.style.height = `${svgRef.current.height}`;
    //         svg.style.maxWidth = `${svgRef.current.width}`;
    //         svg.style.maxHeight = `${svgRef.current.height}`;

    //         const base64doc = btoa(unescape(encodeURIComponent(outerSVG)));
    //         const a = document.createElement('a');
    //         const e = new MouseEvent('click');
    //         a.download = `fold.svg`;
    //         a.href = 'data:image/svg+xml;base64,' + base64doc;
    //         a.dispatchEvent(e);

    //     }

    // };

    return (
        <div>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    left: '100px',
                    top: '100px',
                    opacity: 1,
                    paddingBottom: '20px'
                }}
            >
            </canvas>
            <svg
                ref={svgRef}
                style={{
                    position: 'absolute',
                    left: '100px',
                    top: '100px',
                    backgroundColor: 'rgba(0,0,0,0.0)',
                    paddingBottom: '50px'
                }}
            >
                <path
                    style={{
                        stroke: `rgba(50, 50, 50, 0.75)`,
                        strokeWidth: '0.33',
                        fill: 'none', // 'rgba(50, 50, 50, 0.25)',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    }}
                    d={dH}
                />
                {/* <path
                    style={{
                        stroke: `rgba(50, 50, 50, 0.75)`,
                        strokeWidth: '0.66',
                        fill: 'none',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    }}
                    d={dS}
                />
                <path
                    style={{
                        stroke: `rgba(255, 0, 0, 0.50)`,
                        strokeWidth: '0.1',
                        fill: 'none',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    }}
                    d={dV}
                />
                <path
                    style={{
                        stroke: `rgba(0, 0, 255, 0.50)`,
                        strokeWidth: '0.1',
                        fill: 'none',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    }}
                    d={dW}
                /> */}
                <path
                    style={{
                        stroke: `rgba(50, 50, 50, 0.75)`,
                        strokeWidth: '0.25',
                        fill: 'none',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    }}
                    d={dL}
                />


            </svg>
            <Button
                sx={{
                    width: '200px',
                    marginLeft: '100px'
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
                    marginLeft: '100px'
                }}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<UploadFileIcon />}
                onClick={exportContoursGeoJson}
            >download contours</Button>
        </div>
    );
}

export default ImageLoaderComponent;