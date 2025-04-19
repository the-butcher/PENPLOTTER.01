import * as turf from "@turf/turf";
import * as d3Contour from 'd3-contour';
import * as d3Array from 'd3-array';
import { Feature, LineString } from "geojson";
import { IRasterDataProps } from '../components/IRasterDataProps';
import { IContourProperties } from "../content/IContourProperties";
import { GeometryUtil } from '../util/GeometryUtil';
import { IRange } from "../util/IRange";
import { IRasterConfigProps } from "../components/IRasterConfigProps";

export class Raster {

    // hallein
    // static CONFIG: IRasterConfig = {
    //     rasterName: 'png_10_10_height_scaled_pynb_hallein.png',
    //     cellsize: 10,
    //     valueRangeSample: { min: 6951.0, max: 13762.0 },
    //     valueRangeRaster: { min: 434.31433105469, max: 859.93572998047 },
    //     rasterOrigin3857: [
    //         1455149.6402537469,
    //         6055969.459849371
    //     ]
    // }

    // salzburg
    // static CONFIG: IRasterConfig = {
    //     rasterName: 'png_10_10_height_scaled_pynb_salzburg.png',
    //     cellsize: 10,
    //     valueRangeSample: { min: 6611.0, max: 10202.0 },
    //     valueRangeRaster: { min: 413.08285522461, max: 637.49353027344 },
    //     rasterOrigin3857: [
    //         1450099.6402537469,
    //         6075369.459849371
    //     ]
    // }

    // hallstatt
    // static CONFIG: IRasterConfig = {
    //     rasterName: 'png_10_10_hallstatt.png',
    //     cellsize: 10,
    //     valueRange: { min: 506.67636108398, max: 1391.3282470703 },
    //     origin3857: [
    //         1516999.6402537469,
    //         6035869.459849371
    //     ]
    // }

    // static CONFIG: IRasterConfig = {
    //     rasterName: 'foto_16.png',
    //     cellsize: 5,
    //     valueRangeSample: { min: 8109.0, max: 22266.0 },
    //     valueRangeRaster: { min: 0, max: 500 },
    //     rasterOrigin3857: [
    //         0,
    //         0
    //     ]
    // }

    // schlenken
    // static rasterName = 'png_10_10_height_scaled_pynb_schlenken.png';
    // static heightRangeSample: IRange = { min: 13547.0, max: 27105.0 };
    // static heightRangeRaster: IRange = { min: 846.51934814453, max: 1693.6798095703 };
    // static rasterOrigin3857: Position = [
    //     1469019.6402537469,
    //     6055949.459849371
    // ];

    // fuschertoerl
    // static rasterName = 'png_10_10_height_scaled_pynb_fuschertoerl.png';
    // static heightRangeRaster: IRange = { min: 1522.8586425781, max: 2586.3706054688 };
    // static rasterOrigin3857: Position = [
    //     1424999.6402537469,
    //     5963749.459849371
    // ];
    // static heightRangeSample: IRange = { min: 24371.0, max: 41391.0 };

    // vigaun
    // static rasterName = 'png_10_10_height_scaled_pynb_r8g8_vigaun.png';
    // static rasterOrigin3857: Position = [
    //     1459299.6402537469,
    //     6052689.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 7057.0, max: 13529.0 };
    // static heightRangeRaster: IRange = { min: 440.98001098633, max: 845.38366699219 };

    // wolfgang
    // static rasterOrigin3857: Position = [ // TODO :: invalid extent
    //     1493499.6402537469,
    //     6065269.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 8607.0, max: 18487.0 };
    // static heightRangeRaster: IRange = { min: 537.80029296875, max: 1155.19140625 };



    // bad gastein
    // static rasterOrigin3857: Position = [
    //     1459659.6402537469,
    //     5962469.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 13856.0, max: 29381.0 };
    // static heightRangeRaster: IRange = { min: 865.78936767578, max: 1835.9188232422 };



    // duernstein
    // static rasterName = 'png_10_10_height_scaled_pynb_duernstein.png';
    // static rasterOrigin3857: Position = [
    //     1724199.6402537469,
    //     6175169.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 3097.0, max: 9008.0 };;
    // static heightRangeRaster: IRange = { min: 193.53433227539, max: 562.87243652344 };


    // drosendorf
    // static rasterName = 'png_10_10_height_scaled_pynb_drosendorf.png';
    // static heightRangeSample: IRange = { min: 5803.0, max: 7481.0 };
    // static heightRangeRaster: IRange = { min: 362.63522338867, max: 467.44180297852 };
    // static rasterOrigin3857: Position = [
    //     1736089.6402537469,
    //     6254389.459849371
    // ];

    // // alte donau
    // static rasterName = 'png_10_10_height_scaled_pynb_r8g8_olddanube.png';
    // static rasterOrigin3857: Position = [
    //     1825299.6402537469,
    //     6147039.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 2482.0, max: 2826.0 };
    // static heightRangeRaster: IRange = { min: 155.12026977539, max: 176.60583496094 };

    // // kahlenbergerdorf
    // static rasterName = 'png_10_10_height_scaled_pynb_kahlenbergerdorf.png';
    // static heightRangeSample: IRange = { min: 2514.0, max: 7761.0 };
    // static heightRangeRaster: IRange = { min: 157.08058166504, max: 484.93157958984 };
    // static rasterOrigin3857: Position = [
    //     1818119.6402537469,
    //     6154459.459849371
    // ];

    // schoenbrunn
    // static rasterName = 'png_10_10_height_scaled_pynb_r8g8_schoenbrunn.png';
    // static rasterOrigin3857: Position = [
    //     1813099.6402537469,
    //     6138969.459849371
    // ];
    // static heightRangeRaster: IRange = { min: 173.29022216797, max: 263.4274597168 };
    // static heightRangeSample: IRange = { min: 2773.0, max: 4216.0 };


    // hainburg
    // static rasterOrigin3857: Position = [
    //     1883449.6402537469,
    //     6133269.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 2197.0, max: 6553.0 };
    // static heightRangeRaster: IRange = { min: 137.25184631348, max: 409.46697998047 };

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
        }

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
        }

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