import * as turf from "@turf/turf";
import * as d3Array from 'd3-array';
import * as d3Contour from 'd3-contour';
import { Feature, LineString } from "geojson";
import { IHillshadeConfigProps } from "../components/IHillshadeConfigProps";
import { IRasterConfigProps } from "../components/IRasterConfigProps";
import { IRasterDataProps } from '../components/IRasterDataProps';
import { IContourProperties } from "../content/IContourProperties";
import { GeometryUtil } from '../util/GeometryUtil';
import { IRange } from "../util/IRange";

export type TRasterType = 'none' | 'height' | 'hillshade';

interface IHillshadeDefRad {
    aziRad: number;
    zenRad: number;
    weight: number;
}

/**
 * utility type for raster operations
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
export class Raster {

    static RAD2DEG = 180 / Math.PI;
    static DEG2RAD = Math.PI / 180;
    static NO_DATA = 0;
    static GAMMA = 1.00;

    /**
     * https://pro.arcgis.com/en/pro-app/latest/tool-reference/3d-analyst/how-hillshade-works.htm#:~:text=The%20Hillshade%20tool%20obtains%20the,in%20relation%20to%20neighboring%20cells.
     * https://desktop.arcgis.com/en/arcmap/latest/tools/spatial-analyst-toolbox/how-slope-works.htm#:~:text=The%20Slope%20tool%20identifies%20the,or%20percent%20(percent%20rise).
     *
     * @param rasterData
     * @param cellsize
     * @returns
     */
    static calculateHillshade(rasterData: Omit<IRasterDataProps, 'handleRasterData'>, rasterConfig: IRasterConfigProps, hillshadeConfig: IHillshadeConfigProps): Omit<IRasterDataProps, 'handleRasterData'> {

        const hillshadeData = new Float32Array(rasterData.height * rasterData.width);

        let a, b, c, d, f, g, h, i: number;
        let dzdx, dzdy: number;
        let rr: number;
        let sd: number;
        let av: number;
        let hs: number;

        // const aziRad = (360 - 315 + 90) * Raster.DEG2RAD;
        // const zenRad = (90 - 80) * Raster.DEG2RAD;
        // const hillshadeDefs: IHillshadeDefRad[] = [
        //     {
        //         aziRad: (360 - 315 + 90) * Raster.DEG2RAD,
        //         zenRad: (90 - 80) * Raster.DEG2RAD,
        //         weight: 0.5
        //     },
        //     {
        //         aziRad: (360 - 45 + 90) * Raster.DEG2RAD,
        //         zenRad: (90 - 80) * Raster.DEG2RAD,
        //         weight: 0.5
        //     }
        // ];
        const hillshadeDefs: IHillshadeDefRad[] = hillshadeConfig.hillshadeDefs.map(hillshadeDef => {
            return {
                aziRad: (360 - hillshadeDef.aziDeg + 90) * Raster.DEG2RAD,
                zenRad: (90 - hillshadeDef.zenDeg) * Raster.DEG2RAD,
                weight: hillshadeDef.weight
            };
        });
        const zFactor = hillshadeConfig.zFactor;
        // console.log('aziDeg', aziRad * Raster.RAD2DEG);

        for (let y = 1; y < rasterData.height - 1; y++) {

            for (let x = 1; x < rasterData.width - 1; x++) {

                a = rasterData.data[(y - 1) * rasterData.width + x - 1];
                b = rasterData.data[(y - 1) * rasterData.width + x];
                c = rasterData.data[(y - 1) * rasterData.width + x + 1];
                d = rasterData.data[y * rasterData.width + x - 1];
                // e = rasterData.data[y * rasterData.width + x];
                f = rasterData.data[y * rasterData.width + x + 1];
                g = rasterData.data[(y + 1) * rasterData.width + x - 1];
                h = rasterData.data[(y + 1) * rasterData.width + x];
                i = rasterData.data[(y + 1) * rasterData.width + x + 1];

                dzdx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * rasterConfig.cellsize);
                dzdy = ((g + 2 * h + i) - (a + 2 * b + c)) / (8 * rasterConfig.cellsize);
                rr = zFactor * Math.sqrt(dzdx ** 2 + dzdy ** 2);
                sd = Math.atan(rr);
                av = Math.atan2(dzdy, -dzdx);
                if (av < 0) {
                    av += Math.PI * 2;
                }

                hs = 0;
                hillshadeDefs.forEach(hillshadeDef => {
                    hs += hillshadeDef.weight * ((Math.cos(hillshadeDef.zenRad) * Math.cos(sd)) + (Math.sin(hillshadeDef.zenRad) * Math.sin(sd) * Math.cos(hillshadeDef.aziRad - av)));
                });
                hillshadeData[y * rasterData.width + x] = hs;

            }
        }

        // fix vertical edges
        for (let y = 1; y < rasterData.height - 1; y++) {
            hillshadeData[y * rasterData.width + rasterData.width - 1] = hillshadeData[y * rasterData.width + rasterData.width - 2];
            hillshadeData[y * rasterData.width] = hillshadeData[y * rasterData.width + 1];
        }

        // fix horizontal edges
        for (let x = 0; x < rasterData.width; x++) {
            hillshadeData[x] = hillshadeData[rasterData.width + x];
            hillshadeData[(rasterData.height - 1) * rasterData.width + x] = hillshadeData[(rasterData.height - 2) * rasterData.width + x];
        }

        // console.log('hillshade range', Raster.getSampleRange(hillshade));
        const valueRange = Raster.getSampleRange({
            data: hillshadeData,
            width: rasterData.width,
            height: rasterData.height
        });
        const hillshade: Omit<IRasterDataProps, 'handleRasterData'> = {
            width: rasterData.width,
            height: rasterData.height,
            blurFactor: 0,
            name: 'hillshade',
            valueRange,
            data: hillshadeData
        };

        return hillshade;

    }

    static getSampleRange(rasterData: Pick<IRasterDataProps, 'data' | 'width' | 'height'>): IRange {
        let pixelIndex: number;
        let valCur: number;
        let valMin = Number.MAX_VALUE;
        let valMax = Number.MIN_VALUE;
        // let positionMin: Position = [-1, -1];
        // let positionMax: Position = [-1, -1];
        for (let y = 0; y < rasterData.height; y++) {
            for (let x = 0; x < rasterData.width; x++) {
                pixelIndex = (y * rasterData.width + x);
                valCur = rasterData.data[pixelIndex];
                if (valCur != Raster.NO_DATA) {
                    if (valCur < valMin) {
                        valMin = valCur;
                        // positionMin = [x, y];
                    }
                    if (valCur > valMax) {
                        valMax = valCur;
                        // positionMax = [x, y];
                    }
                    // valMin = Math.min(valMin, valCur);
                    // valMax = Math.max(valMax, valCur);
                }
            }
        }
        // valMin = 10832;
        // valMax = 30646;
        // console.log('sampleRange', {
        //     min: valMin,
        //     max: valMax
        // }, positionMin, positionMax);
        return {
            min: valMin,
            max: valMax
        };
    }

    static blurRasterData(rasterData: IRasterDataProps, blurFactor: number): IRasterDataProps {

        const data = new Float32Array(rasterData.data);
        d3Array.blur2({ data, width: rasterData.width }, blurFactor);

        return {
            ...rasterData,
            data,
            blurFactor
        };

    }

    static getRasterValue(rasterData: IRasterDataProps, x: number, y: number) {

        const xA = Math.floor(x);
        const xB = Math.ceil(x);
        const xF = x - xA;

        const yA = Math.floor(y);
        const yB = Math.ceil(y);
        const yF = y - yA;

        const valXAYA = rasterData.data[yA * rasterData.width + xA];
        const valXAYB = rasterData.data[yB * rasterData.width + xA];
        const valXBYA = rasterData.data[yA * rasterData.width + xB];
        const valXBYB = rasterData.data[yB * rasterData.width + xB];

        const interpolateValue = (a: number, b: number, f: number) => {
            return a + (b - a) * f;
        };

        // between upper pixels
        const valFYA = interpolateValue(valXAYA, valXBYA, xF);
        // between lower pixels
        const valFYB = interpolateValue(valXAYB, valXBYB, xF);
        // final interpolation
        const valRes = interpolateValue(valFYA, valFYB, yF);

        return valRes;

    }

    static setRasterValue(rasterData: IRasterDataProps, x: number, y: number, v: number) {

        const pixelIndex = Math.round(x) + rasterData.width * Math.round(y);
        rasterData.data[pixelIndex] = v;

    }

    static getContourFeatures(rasterData: IRasterDataProps, thresholds: number[], rasterConfig: IRasterConfigProps): Feature<LineString, IContourProperties>[] {

        // console.warn('getContourFeatures', rasterData);
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
                                contourFeatures.push(contourFeature!);
                            }
                            contourFeature!.geometry.coordinates.push(GeometryUtil.pixelToPosition4326([
                                contourCoordinate[0] - 0.5,
                                contourCoordinate[1] - 0.5,
                            ], rasterConfig));
                        }
                    });
                    contourFeature = undefined;
                });
                contourFeature = undefined;
            });
        });

        return GeometryUtil.connectContours(contourFeatures, 1);

    }

}