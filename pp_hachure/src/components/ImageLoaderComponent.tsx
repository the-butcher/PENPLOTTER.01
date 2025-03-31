import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Button } from "@mui/material";
import * as turf from "@turf/turf";
import * as d3Array from 'd3-array';
import * as d3Contour from 'd3-contour';
import { Feature, LineString } from "geojson";
import { createRef, useEffect, useState } from "react";
import { Contour } from '../contour/Contour';
import { IContour } from '../contour/IContour';
import { IContourProperties } from '../contour/IContourProperties';
import { IHachure } from '../contour/IHachure';
import { GeometryUtil } from '../util/GeometryUtil';
import { IRange } from '../util/IRange';
import { IRasterData } from '../util/IRasterData';
import { ObjectUtil } from '../util/ObjectUtil';
import { RasterLoader } from '../util/RasterLoader';

export interface IBluetoothSenderProps {
    dummy?: never;
}

function ImageLoaderComponent() {

    const canvasRef = createRef<HTMLCanvasElement>();
    const svgRef = createRef<SVGSVGElement>();

    const [rasterDataHeight, setRasterDataHeight] = useState<IRasterData>();

    const [dH, setDH] = useState<string>('');
    const [dV, setDV] = useState<string>('');
    const [dW, setDW] = useState<string>('');
    const [dL, setDL] = useState<string>('');

    const [hachures, setHachures] = useState<IHachure[]>([]);

    const heightRangeSample: IRange = { min: 3097.0, max: 9008.0 };;
    const heightRangeRaster: IRange = { min: 193.53433227539, max: 562.87243652344 };

    const sampleToHeight = (sample: number): number => {
        return ObjectUtil.mapValues(sample, heightRangeSample, heightRangeRaster);
    }


    const rasterDataHeightBlurFactor = 3;
    const rasterDataContourInterval = 20;

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


    const toSvgContourData = (rasterData: IRasterData, thresholds: number[]): string => {

        let svgContourData = '';

        const contourFeatures = getContourFeatures(rasterData, thresholds.filter(t => t % 25 === 0));
        contourFeatures.forEach(contourFeature => {
            let command = 'M';
            for (let coordinateIndex = 0; coordinateIndex < contourFeature.geometry.coordinates.length; coordinateIndex++) {

                const contourPoint = GeometryUtil.position4326ToPixel(contourFeature.geometry.coordinates[coordinateIndex]);
                svgContourData += `${command}${contourPoint[0]} ${contourPoint[1]}`;
                command = 'L';

            }
        });

        return svgContourData;

    }

    useEffect(() => {

        console.debug('✨ building ImageLoaderComponent');

        const canvasElement = canvasRef.current;
        const svgElement = svgRef.current;

        if (canvasElement && svgElement) {

            new RasterLoader().load('png_10_10_height_scaled_pynb_r8g8.png', sampleToHeight).then(_imageDataHeight => {

                console.log('_imageDataHeight', _imageDataHeight);

                // initial blur
                d3Array.blur2({ data: _imageDataHeight.data, width: _imageDataHeight.width }, rasterDataHeightBlurFactor);
                setRasterDataHeight(_imageDataHeight);

            });

        }

    }, []);

    useEffect(() => {

        console.log('⚙ updating ImageLoaderComponent (rasterDataHeight)', rasterDataHeight);

        if (rasterDataHeight) {

            const minHeight = heightRangeRaster.min - heightRangeRaster.min % rasterDataContourInterval + rasterDataContourInterval;
            const maxHeight = heightRangeRaster.max - heightRangeRaster.max % rasterDataContourInterval;

            console.log('minHeight', minHeight, 'maxHeight', maxHeight);
            const thresholds: number[] = [];
            for (let i = minHeight; i <= maxHeight; i += 2.5) {
                thresholds.push(i);
            }

            const svgElement = svgRef.current!;
            svgElement.setAttribute('viewBox', `0, 0, ${rasterDataHeight.width}, ${rasterDataHeight.height}`);
            svgElement.style.width = `${rasterDataHeight.width * 4}`;
            svgElement.style.height = `${rasterDataHeight.height * 4}`;

            setDL(toSvgContourData(rasterDataHeight, thresholds));

            let _dV = '';
            let _dW = '';

            const contours: IContour[] = [];
            let _hachures: IHachure[] = [];

            console.log('building contours ....');
            const contourFeatures = getContourFeatures(rasterDataHeight, thresholds).filter(f => turf.length(f, {
                units: 'meters'
            }) > Contour.SEGMENT_BASE_LENGTH);
            contourFeatures.forEach(contourFeature => {
                contours.push(new Contour(contourFeature));
            });

            // console.log('contours[contours.length - 1]', contours[contours.length - 1]);
            // _dW += contours[0].getSvgData();
            // _dW += contours[1].getSvgData();
            console.log('done building contours');

            for (let i = 0; i < thresholds.length - 1; i++) {

                const heightA = thresholds[i];
                const heightB = thresholds[i + 1];

                console.log(`handling heights: ${heightA}, ${heightB} (${_hachures.length})`);

                const heightAContours = contours.filter(c => c.getHeight() === heightA);

                // const extraHachuresA: IHachure[] = [];
                for (let j = 0; j < heightAContours.length; j++) {
                    _hachures.push(...heightAContours[j].handleHachures(_hachures));
                }

                const heightBContours = contours.filter(c => c.getHeight() === heightB);
                for (let j = 0; j < heightBContours.length; j++) {
                    _hachures = heightBContours[j].intersectHachures(_hachures);
                }

                _hachures = _hachures.filter(h => h.getVertexCount() > 1)

            }

            // hachures.forEach(hachure => {
            //     _dV += hachure.getSvgDataFw();
            // });

            // _hachures.forEach(hachure => {
            //     _dH += hachure.getSvgData();
            // });

            setHachures(_hachures);

            // setDV(_dV);
            // setDW(_dW);
            // setDH(_dH);

            // renderRasterDataHeight();

        }

    }, [rasterDataHeight]);

    useEffect(() => {

        console.log('⚙ updating ImageLoaderComponent (hachures)', hachures);

        if (hachures) {

            let _dH = '';

            hachures.forEach(hachure => {
                _dH += hachure.getSvgData();
            });

            setDH(_dH);
            renderRasterDataHeight();

        }

    }, [hachures]);

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
                        min: heightRangeRaster.min,
                        max: heightRangeRaster.max * 2
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

    const exportHachureGeoJson = () => {

        // const layer = map!.findLayerByName(id);
        const exportFeatures: Feature<LineString>[] = [];
        hachures.forEach(hachure => {
            exportFeatures.push(turf.feature(hachure.toLineString()));
        })

        // const polygons = VectorTileGeometryUtil.destructureMultiPolygon(layer!.polyData);
        // const features = polygons.map(p => turf.feature(p));
        const featureCollection = turf.featureCollection(exportFeatures);

        const a = document.createElement("a");
        const e = new MouseEvent("click");
        a.download = `hachures_${ObjectUtil.createId()}.json`;
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(featureCollection));
        a.dispatchEvent(e);

    }

    const exportSVG = () => {

        // https://stackoverflow.com/questions/60241398/how-to-download-and-svg-element-as-an-svg-file
        const svg = svgRef.current;

        if (svg) {

            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.style.width = `${svgRef.current.width}`;
            svg.style.height = `${svgRef.current.height}`;
            svg.style.maxWidth = `${svgRef.current.width}`;
            svg.style.maxHeight = `${svgRef.current.height}`;
            svg.style.transform = '';

            const outerSVG = svg!.outerHTML;

            svg.style.width = `${svgRef.current.width}`;
            svg.style.height = `${svgRef.current.height}`;
            svg.style.maxWidth = `${svgRef.current.width}`;
            svg.style.maxHeight = `${svgRef.current.height}`;

            const base64doc = btoa(unescape(encodeURIComponent(outerSVG)));
            const a = document.createElement('a');
            const e = new MouseEvent('click');
            a.download = `fold.svg`;
            a.href = 'data:image/svg+xml;base64,' + base64doc;
            a.dispatchEvent(e);

        }

    };

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
                        stroke: `rgba(100, 100, 100, 0.75)`,
                        strokeWidth: '0.5',
                        fill: 'none',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    }}
                    d={dH}
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
                />
                <path
                    style={{
                        stroke: `rgba(100, 100, 100, 0.75)`,
                        strokeWidth: '0.2',
                        fill: 'none',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                    }}
                    d={dL}
                />

                {/* {
                    normals.map(force => <path
                        key={force.id}
                        style={{
                            stroke: 'rgba(0, 0, 0, 0.5)',
                            strokeWidth: 0.5,
                            fill: 'none',
                            strokeLinejoin: 'round'
                        }}
                        d={force.path}
                    />)
                } */}

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
                onClick={exportHachureGeoJson}
            >download</Button>
        </div>
    );
}

export default ImageLoaderComponent;