import * as turf from "@turf/turf";
import * as d3Contour from 'd3-contour';
import * as d3Array from 'd3-array';
import { Feature, LineString } from "geojson";
import { IRasterDataProps } from '../components/IRasterDataProps';
import { IContourProperties } from "../content/IContourProperties";
import { GeometryUtil } from '../util/GeometryUtil';
import { IRange } from "../util/IRange";
import { IRasterConfigProps } from "../components/IRasterConfigProps";

/**
 * utility type for raster operations
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
export class Raster {

    static RAD2DEG = 180 / Math.PI;
    static DEG2RAD = Math.PI / 180;

    static getSampleRange(rasterData: Pick<IRasterDataProps, 'data' | 'width' | 'height'>): IRange {
        let pixelIndex: number;
        let valCur: number;
        let valMin = Number.MAX_VALUE;
        let valMax = Number.MIN_VALUE;
        for (let y = 0; y < rasterData.height; y++) {
            for (let x = 0; x < rasterData.width; x++) {
                pixelIndex = (y * rasterData.width + x);
                valCur = rasterData.data[pixelIndex];
                valMin = Math.min(valMin, valCur);
                valMax = Math.max(valMax, valCur);
            }
        }
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
                            contourFeature!.geometry.coordinates.push(GeometryUtil.pixelToPosition4326(contourCoordinate, rasterConfig));
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