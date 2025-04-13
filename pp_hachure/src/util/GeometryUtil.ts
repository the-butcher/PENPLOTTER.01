import * as turf from "@turf/turf";
import { BBox, Feature, LineString, MultiLineString, MultiPolygon, Position } from "geojson";
import simplify from "simplify-js";
import { IContourProperties } from "../contour/IContourProperties";
import { IPositionProperties } from "../contour/IPositionProperties";
import { IMatrix2D } from "./Interfaces";
import { IRange } from "./IRange";
import { ObjectUtil } from "./ObjectUtil";

interface IPositionAtLength {
    position: Position;
    length: number;
}

export class GeometryUtil {

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

    // hallstatt
    // static rasterName = 'png_10_10_height_scaled_pynb_r8g8_hallstatt.png';
    // static rasterOrigin3857: Position = [
    //     1516999.6402537469,
    //     6035869.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 8109.0, max: 22266.0 };
    // static heightRangeRaster: IRange = { min: 506.67636108398, max: 1391.3282470703 };

    // bad gastein
    // static rasterOrigin3857: Position = [
    //     1459659.6402537469,
    //     5962469.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 13856.0, max: 29381.0 };
    // static heightRangeRaster: IRange = { min: 865.78936767578, max: 1835.9188232422 };

    // hallein
    // static rasterOrigin3857: Position = [
    //     1455149.6402537469,
    //     6055969.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 6951.0, max: 13762.0 };
    // static heightRangeRaster: IRange = { min: 434.31433105469, max: 859.93572998047 };

    // duernstein
    static rasterName = 'png_10_10_height_scaled_pynb_duernstein.png';
    static rasterOrigin3857: Position = [
        1724199.6402537469,
        6175169.4598493706
    ];
    static heightRangeSample: IRange = { min: 3097.0, max: 9008.0 };;
    static heightRangeRaster: IRange = { min: 193.53433227539, max: 562.87243652344 };

    // salzburg
    // static rasterName = 'png_10_10_height_scaled_pynb_r8g8_salzburg.png';
    // static rasterOrigin3857: Position = [
    //     1450099.6402537469,
    //     6075369.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 6611.0, max: 10202.0 };
    // static heightRangeRaster: IRange = { min: 413.08285522461, max: 637.49353027344 };

    // // alte donau
    // static rasterName = 'png_10_10_height_scaled_pynb_r8g8_olddanube.png';
    // static rasterOrigin3857: Position = [
    //     1825299.6402537469,
    //     6147039.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 2482.0, max: 2826.0 };
    // static heightRangeRaster: IRange = { min: 155.12026977539, max: 176.60583496094 };

    // // kahlenbergerdorf
    // static rasterName = 'png_10_10_height_scaled_pynb_r8g8_kahlenbergerdorf.png';
    // static rasterOrigin3857: Position = [
    //     1818119.6402537469,
    //     6154459.4598493706
    // ];
    // static heightRangeSample: IRange = { min: 2514.0, max: 7761.0 };;
    // static heightRangeRaster: IRange = { min: 157.08058166504, max: 484.93157958984 };

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

    static cellSize = 10;

    static sampleToHeight = (sample: number): number => {
        return ObjectUtil.mapValues(sample, GeometryUtil.heightRangeSample, GeometryUtil.heightRangeRaster);
    }

    static position4326ToPixel = (position4326: Position): Position => {
        const position3857 = turf.toMercator(position4326);
        return [
            (position3857[0] - GeometryUtil.rasterOrigin3857[0]) / GeometryUtil.cellSize,
            (GeometryUtil.rasterOrigin3857[1] - position3857[1]) / GeometryUtil.cellSize
        ];
    }

    static pixelToPosition4326 = (pixel: Position): Position => {
        const position3857 = [
            pixel[0] * GeometryUtil.cellSize + GeometryUtil.rasterOrigin3857[0],
            GeometryUtil.rasterOrigin3857[1] - pixel[1] * GeometryUtil.cellSize
        ];
        return turf.toWgs84(position3857);
    }

    static booleanWithinBbox(bbox: BBox, point: Position) {
        return (point[0] >= bbox[0] && point[0] <= bbox[2] && point[1] >= bbox[1] && point[1] <= bbox[3]);
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

                // curDistance = turf.distance(position00, positionI0, {
                //     units: 'meters'
                // });
                // if (curDistance < minDistance) {
                //     minDistance = curDistance;
                //     minConnects = [0, true, i, false]; // index 0 on polyline 0, index 0 in polyline i
                // }

                // curDistance = turf.distance(position00, positionIL, {
                //     units: 'meters'
                // });
                // if (curDistance < minDistance) {
                //     minDistance = curDistance;
                //     minConnects = [0, true, i, true]; // index 0 on polyline 0, index 0 in polyline i
                // }

                curDistance = turf.distance(position0L, positionI0, {
                    units: 'meters'
                })
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

    static position3857ToPositionProperties(position3857: Position): IPositionProperties {
        const position4326 = turf.toWgs84(position3857);
        const positionPixl = GeometryUtil.position4326ToPixel(position4326);
        return {
            position4326,
            positionPixl,
        };
    }

    static smooth1(positionsA: IPositionProperties[]): IPositionProperties[] {

        const coordinates3857A = positionsA.map(p => turf.toMercator(p.position4326));

        const coordinates3857ALength: IPositionAtLength[] = [];

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

        const lMax = 25;

        const positionsB: IPositionProperties[] = [];

        positionsB.push(GeometryUtil.position3857ToPositionProperties(coordinates3857ALength[0].position));
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
            positionsB.push(GeometryUtil.position3857ToPositionProperties(position3857));

        }
        positionsB.push(GeometryUtil.position3857ToPositionProperties(coordinates3857ALength[coordinates3857ALength.length - 1].position));

        return positionsB;

    }


    static smoothPositions2(coordinatesPixlA: Position[]): Position[] {

        const coordinatesPixlB: Position[] = [];
        let q: Position;
        let r: Position;
        coordinatesPixlB.push(coordinatesPixlA[0]);
        for (let i = 0; i < coordinatesPixlA.length - 1; i++) {
            const c0 = coordinatesPixlA[i];
            const c1 = coordinatesPixlA[i + 1];
            q = [0.75 * c0[0] + 0.25 * c1[0], 0.75 * c0[1] + 0.25 * c1[1]];
            r = [0.25 * c0[0] + 0.75 * c1[0], 0.25 * c0[1] + 0.75 * c1[1]];
            coordinatesPixlB.push(q);
            coordinatesPixlB.push(r);
        }
        coordinatesPixlB.push(coordinatesPixlA[coordinatesPixlA.length - 1]);
        return coordinatesPixlB;


    }

    static smooth2(positionsA: IPositionProperties[]): IPositionProperties[] {

        let coordinatesPixlA = positionsA.map(p => p.positionPixl);

        let coordinatesXY = coordinatesPixlA.map(c => {
            return {
                x: c[0],
                y: c[1]
            }
        });
        coordinatesXY = simplify(coordinatesXY, 0.25, true);
        coordinatesPixlA = coordinatesXY.map(c => {
            return [
                c.x,
                c.y
            ]
        });

        const coordinatesPixlB = GeometryUtil.smoothPositions2(GeometryUtil.smoothPositions2(coordinatesPixlA));
        return coordinatesPixlB.map(c => {
            return {
                position4326: GeometryUtil.pixelToPosition4326(c),
                positionPixl: c
            }
        });

    }

    static restructureMultiPolyline(polylines: LineString[]): MultiLineString {
        return {
            type: 'MultiLineString',
            coordinates: [...polylines.map(p => p.coordinates)]
        }
    }

    static transformMultiPolygon(polygons: MultiPolygon, matrix: IMatrix2D): MultiPolygon {
        return {
            type: 'MultiPolygon',
            coordinates: GeometryUtil.transformPosition3(polygons.coordinates, matrix)
        }
    }

    static distancePositionPosition(positionA: Position, positionB: Position) {
        const difX = positionB[0] - positionA[0], difY = positionB[1] - positionA[1];
        return Math.sqrt(difX * difX + difY * difY);
    }

    static transformPosition3(positions: Position[][][], matrix: IMatrix2D): Position[][][] {
        return positions.map(p => GeometryUtil.transformPosition2(p, matrix));
    }

    static transformPosition2(positions: Position[][], matrix: IMatrix2D): Position[][] {
        return positions.map(p => GeometryUtil.transformPosition1(p, matrix));
    }

    static transformPosition1(positions: Position[], matrix: IMatrix2D): Position[] {
        return positions.map(p => GeometryUtil.transformPosition(p, matrix));
    }

    static transformPosition(position: Position, transform: IMatrix2D): Position {
        return [
            position[0] * transform.a + position[1] * transform.c + transform.e,
            position[0] * transform.b + position[1] * transform.d + transform.f
        ];
    }

    static matrixTranslationInstance(x: number, y: number): IMatrix2D {
        return {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: x,
            f: y
        }
    }

    /**
     * https://github.com/Fionoble/transformation-matrix-js/blob/master/src/matrix.js
     * @param radians
     * @returns
     */
    static matrixRotationInstance(radians: number): IMatrix2D {
        const cos = Math.cos(radians), sin = Math.sin(radians);
        return {
            a: cos,
            b: sin,
            c: -sin,
            d: cos,
            e: 0,
            f: 0
        }
    }

    /**
     * https://github.com/Fionoble/transformation-matrix-js/blob/master/src/matrix.js
     * @param matrixA
     * @param matrixB
     * @returns
     */
    static matrixMultiply(...matrices: IMatrix2D[]): IMatrix2D {
        let matrixA = matrices[0];
        for (let i = 1; i < matrices.length; i++) {
            const matrixB = matrices[i];
            matrixA = {
                a: matrixA.a * matrixB.a + matrixA.c * matrixB.b,
                b: matrixA.b * matrixB.a + matrixA.d * matrixB.b,
                c: matrixA.a * matrixB.c + matrixA.c * matrixB.d,
                d: matrixA.b * matrixB.c + matrixA.d * matrixB.d,
                e: matrixA.a * matrixB.e + matrixA.c * matrixB.f + matrixA.e,
                f: matrixA.b * matrixB.e + matrixA.d * matrixB.f + matrixA.f
            }
        }
        return matrixA;
    }

    static matrixDeterminant(matrix: IMatrix2D): number {
        return matrix.a * matrix.d - matrix.b * matrix.c;
    }

    static matrixIsInvertible(matrix: IMatrix2D): boolean {
        return GeometryUtil.matrixDeterminant(matrix) !== 0;
    }

    static matrixInvert(matrix: IMatrix2D): IMatrix2D {

        if (GeometryUtil.matrixIsInvertible(matrix)) {
            const dt = GeometryUtil.matrixDeterminant(matrix);
            return {
                a: matrix.d / dt,
                b: -matrix.b / dt,
                c: -matrix.c / dt,
                d: matrix.a / dt,
                e: (matrix.c * matrix.f - matrix.d * matrix.e) / dt,
                f: -(matrix.a * matrix.f - matrix.b * matrix.e) / dt,
            }
        } else {
            throw "matrix is not invertible";
        }

        // inverse: function() {

        //     if (this.isIdentity()) {
        //         return new Matrix();
        //     }
        //     else if (!this.isInvertible()) {
        //         throw "Matrix is not invertible.";
        //     }
        //     else {
        //         var me = this,
        //             a = me.a,
        //             b = me.b,
        //             c = me.c,
        //             d = me.d,
        //             e = me.e,
        //             f = me.f,

        //             m = new Matrix(),
        //             dt = a * d - b * c;	// determinant(), skip DRY here...

        //         m.a = d / dt;
        //         m.b = -b / dt;
        //         m.c = -c / dt;
        //         m.d = a / dt;
        //         m.e = (c * f - d * e) / dt;
        //         m.f = -(a * f - b * e) / dt;

        //         return m;
        //     }
        // },

    }

}