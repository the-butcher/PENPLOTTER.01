import * as turf from "@turf/turf";
import { BBox, Feature, LineString, Position } from "geojson";
import simplify from "simplify-js";
import { IRasterConfigProps } from "../components/IRasterConfigProps";
import { IContourProperties } from "../content/IContourProperties";
import { IPositionProperties } from "../content/IPositionProperties";
import { IPositionWithLength } from "./IPositionWithLength";

export class GeometryUtil {

    static position4326ToPixel = (position4326: Position, rasterConfig: IRasterConfigProps): Position => {
        const position3857 = turf.toMercator(position4326);
        return [
            (position3857[0] - rasterConfig.origin3857[0]) / rasterConfig.cellsize,
            (rasterConfig.origin3857[1] - position3857[1]) / rasterConfig.cellsize
        ];
    };

    static pixelToPosition4326 = (pixel: Position, rasterConfig: IRasterConfigProps): Position => {
        const position3857 = [
            pixel[0] * rasterConfig.cellsize + rasterConfig.origin3857[0],
            rasterConfig.origin3857[1] - pixel[1] * rasterConfig.cellsize
        ];
        return turf.toWgs84(position3857);
    };

    static booleanWithinBbox(bbox: BBox, point: Position) {
        return (point[0] >= bbox[0] && point[0] <= bbox[2] && point[1] >= bbox[1] && point[1] <= bbox[3]);
    }

    static booleanWithinRange(val: number, min: number, max: number): boolean {
        return val >= min && val <= max;
    }

    static booleanBboxOverlap(bboxA: BBox, bboxB: BBox) {

        let xOverlap = false;
        xOverlap = xOverlap || GeometryUtil.booleanWithinRange(bboxA[0], bboxB[0], bboxB[2]);
        xOverlap = xOverlap || GeometryUtil.booleanWithinRange(bboxA[2], bboxB[0], bboxB[2]);
        xOverlap = xOverlap || GeometryUtil.booleanWithinRange(bboxB[0], bboxA[0], bboxA[2]);
        xOverlap = xOverlap || GeometryUtil.booleanWithinRange(bboxB[2], bboxA[0], bboxA[2]);

        let yOverlap = false;
        yOverlap = yOverlap || GeometryUtil.booleanWithinRange(bboxA[1], bboxB[1], bboxB[3]);
        yOverlap = yOverlap || GeometryUtil.booleanWithinRange(bboxA[3], bboxB[1], bboxB[3]);
        yOverlap = yOverlap || GeometryUtil.booleanWithinRange(bboxB[1], bboxA[1], bboxA[3]);
        yOverlap = yOverlap || GeometryUtil.booleanWithinRange(bboxB[3], bboxA[1], bboxA[3]);

        return xOverlap && yOverlap;

    }

    static connectContours(contours: Feature<LineString, IContourProperties>[], toleranceMeters: number): Feature<LineString, IContourProperties>[] {

        const results: Feature<LineString, IContourProperties>[] = [];
        const inclone: Feature<LineString, IContourProperties>[] = [...contours];

        while (inclone.length > 0) {

            let minDistance = toleranceMeters;
            let curDistance: number;
            let minConnects: [number, number] = [-1, -1];

            const position00 = inclone[0].geometry.coordinates[0]; // start of polyline0
            const position0L = inclone[0].geometry.coordinates[inclone[0].geometry.coordinates.length - 1]; // end of polyline0

            for (let i = 1; i < inclone.length; i++) {

                const positionI0 = inclone[i].geometry.coordinates[0]; // start of polylineI
                const positionIL = inclone[i].geometry.coordinates[inclone[i].geometry.coordinates.length - 1]; // end of polylineI

                curDistance = turf.distance(position0L, positionI0, {
                    units: 'meters'
                });
                if (curDistance < minDistance) {

                    minDistance = curDistance;
                    minConnects = [0, i];

                }

                curDistance = turf.distance(positionIL, position00, {
                    units: 'meters'
                });
                if (curDistance < minDistance) {
                    minDistance = curDistance;
                    minConnects = [i, 0];
                }

            }


            if (minConnects[0] >= 0 && minConnects[1] >= 0) {

                // console.log('minConnects', minConnects, minDistance);

                inclone.push(turf.feature({
                    type: 'LineString',
                    coordinates: [
                        ...inclone[minConnects[0]].geometry.coordinates,
                        ...inclone[minConnects[1]].geometry.coordinates,
                    ]
                }, {
                    ...inclone[minConnects[0]].properties
                }));

                // remove, larger index must be removed first
                inclone.splice(Math.max(minConnects[0], minConnects[1]), 1);
                inclone.splice(Math.min(minConnects[1], minConnects[0]), 1);

            } else {
                results.push(...inclone.splice(0, 1));
            }

        }

        return results.map(p => turf.cleanCoords(p, {
            mutate: true
        }));

    }

    static position3857ToPositionProperties(position3857: Position, rasterConfig: IRasterConfigProps): IPositionProperties {
        const position4326 = turf.toWgs84(position3857);
        const positionPixl = GeometryUtil.position4326ToPixel(position4326, rasterConfig);
        return {
            position4326,
            positionPixl,
        };
    }

    static smoothPositions(positionsA: IPositionProperties[], rasterConfig: IRasterConfigProps): IPositionProperties[] {

        const coordinates3857A = positionsA.map(p => turf.toMercator(p.position4326));

        const coordinates3857ALength: IPositionWithLength[] = [];

        // build an array of positions at their lengths along the path
        let length = 0;
        coordinates3857ALength.push({
            length,
            position: coordinates3857A[0]
        });
        for (let i = 0; i < coordinates3857A.length - 1; i++) {
            const xDiff = coordinates3857A[i + 1][0] - coordinates3857A[i][0];
            const yDiff = coordinates3857A[i + 1][1] - coordinates3857A[i][1];
            length += Math.sqrt(xDiff ** 2 + yDiff ** 2);
            coordinates3857ALength.push({
                length,
                position: coordinates3857A[i + 1]
            });
        }

        const lMax = 30;

        const positionsB: IPositionProperties[] = [];

        positionsB.push(GeometryUtil.position3857ToPositionProperties(coordinates3857ALength[0].position, rasterConfig));
        for (let i = 0; i < coordinates3857ALength.length; i++) {

            let xSum = 0;
            let ySum = 0;
            let wSum = 0;

            for (let j = 0; j < coordinates3857ALength.length; j++) {

                const lCur = Math.abs(coordinates3857ALength[i].length - coordinates3857ALength[j].length);
                if (lCur <= lMax) {

                    // const wCur = (lMax - lCur) / lMax;
                    // https://www.desmos.com/calculator/abn1jhhprz
                    const wCur = (Math.cos(lCur * Math.PI / lMax) + 1) / 2;

                    xSum += coordinates3857ALength[j].position[0] * wCur;
                    ySum += coordinates3857ALength[j].position[1] * wCur;
                    wSum += wCur;
                }

            }

            const position3857: Position = [
                xSum / wSum,
                ySum / wSum
            ];
            positionsB.push(GeometryUtil.position3857ToPositionProperties(position3857, rasterConfig));

        }
        positionsB.push(GeometryUtil.position3857ToPositionProperties(coordinates3857ALength[coordinates3857ALength.length - 1].position, rasterConfig));

        return positionsB;

    }


    /**
     * this method performs a very light simplification, thus keeping practically all of the hachure shape,
     * yet reducing export size by a factor of 3
     * @param positionsA
     * @returns
     */
    static simplifyPositions(positionsA: IPositionProperties[], rasterConfig: IRasterConfigProps): IPositionProperties[] {

        let coordinates3857A = positionsA.map(p => turf.toMercator(p.position4326));

        let coordinatesXY = coordinates3857A.map(c => {
            return {
                x: c[0],
                y: c[1]
            };
        });
        coordinatesXY = simplify(coordinatesXY, 0.10, true);
        coordinates3857A = coordinatesXY.map(c => {
            return [
                c.x,
                c.y
            ];
        });

        const positionsB: IPositionProperties[] = [];
        for (let i = 0; i < coordinates3857A.length; i++) {
            positionsB.push(GeometryUtil.position3857ToPositionProperties(coordinates3857A[i], rasterConfig));
        }
        return positionsB;

    }

}