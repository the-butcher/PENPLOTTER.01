import * as turf from '@turf/turf';
import { BBox, LineString, MultiLineString, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import { danube___new, danube___old, danube__main, danube_canal, danube_inlet, wien____main } from './Rivers';



export class MapLayerWater extends AMapLayer {

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {
        const polygons = VectorTileGeometryUtil.toPolygons(vectorTileKey, feature.coordinates).filter(p => Math.abs(turf.area(p)) > 100);
        this.multiPolygon!.coordinates.push(...polygons.map(p => p.coordinates));
    }

    async closeTile(): Promise<void> { }

    async process(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing ...`);

        turf.simplify(this.multiPolygon!, {
            mutate: true,
            tolerance: 0.000005,
            highQuality: true
        });
        turf.cleanCoords(this.multiPolygon);

        const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(this.multiPolygon, 3, -3);
        this.multiPolygon = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA);

        // console.log(`${this.name}, fill polygons, danube_canal ...`);
        // polygonsA.push(...this.findFillPolygons(danube_canal));
        // console.log(`${this.name}, fill polygons, danube_inlet ...`);
        // polygonsA.push(...this.findFillPolygons(danube_inlet));
        // console.log(`${this.name}, fill polygons, danube__main ...`);
        // polygonsA.push(...this.findFillPolygons(danube__main));
        // console.log(`${this.name}, fill polygons, wien____main ...`);
        // polygonsA.push(...this.findFillPolygons(wien____main));

        // console.log(`${this.name}, stat polygons, danube___old ...`);
        // polygonsA.push(danube___old);
        // console.log(`${this.name}, stat polygons, danube___new ...`);
        // polygonsA.push(danube___new);

        console.log(`${this.name}, union ....`);
        const unionPolygon = VectorTileGeometryUtil.unionPolygons(polygonsA);
        const polygonsM: Polygon[] = VectorTileGeometryUtil.destructureUnionPolygon(unionPolygon);
        this.multiPolygon = VectorTileGeometryUtil.restructureMultiPolygon(polygonsM);

        let distance = -5;
        const distances: number[] = [];
        for (let i = 0; i < 20; i++) {
            distances.push(distance);
            distance *= 1.25;
        }
        const polygonsB: Polygon[] = VectorTileGeometryUtil.bufferCollect(unionPolygon, false, ...distances);
        let multiPolygonB = VectorTileGeometryUtil.restructureMultiPolygon(polygonsB);

        console.log(`${this.name}, clipping to bboxClp4326 (1) ...`);
        this.multiPolygon = VectorTileGeometryUtil.bboxClipMultiPolygon(this.multiPolygon, bboxClp4326); // outer ring only, for potential future clipping operations
        console.log(`${this.name}, clipping to bboxClp4326 (2) ...`);
        multiPolygonB = VectorTileGeometryUtil.bboxClipMultiPolygon(multiPolygonB, bboxClp4326); // with buffered rings

        const coordinates005: Position[][] = multiPolygonB.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline005.coordinates.push(...coordinates005);

        // first ring is 0.3 for a distinct water line
        const coordinates030: Position[][] = this.multiPolygon.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline030.coordinates.push(...coordinates030);

        console.log(`${this.name}, clipping to bboxMap4326 ....`);
        this.bboxClip(bboxMap4326);
        console.log(`${this.name}, done`);

    }

    findFillPolygons(river: LineString, drawPoint?: (coordinate: Position, label?: string) => void): Polygon[] {

        const fillPolygons: Polygon[] = [];

        // map and sort intersections along line
        const intersections = turf.lineIntersect(this.multiPolygon!, river).features!;
        if (intersections.length > 0) {

            const mappedToLine = intersections.map(i => turf.nearestPointOnLine(river, i));
            mappedToLine.sort((a, b) => a.properties!.location - b.properties!.location);

            const lineCoordinates: Position[][] = [];
            this.multiPolygon.coordinates.forEach(coordinates => {
                lineCoordinates.push(coordinates[0]);
            });
            const multiLine: MultiLineString = {
                type: 'MultiLineString',
                coordinates: lineCoordinates
            };

            // draw and label the points
            let featureA = mappedToLine[0];
            let featureB = mappedToLine[1];

            let pointOnPolygonA = turf.nearestPointOnLine(multiLine, featureA.geometry.coordinates);
            let pointOnPolygonB = turf.nearestPointOnLine(multiLine, featureB.geometry.coordinates);

            let startIndex = 0;
            if (pointOnPolygonA.properties.multiFeatureIndex === pointOnPolygonB.properties.multiFeatureIndex) {
                startIndex = 1;
            }

            for (let i = startIndex; i < mappedToLine.length - 1; i += 2) { // NOTE :: there is another increment further down in this loop

                featureA = mappedToLine[i]; // end of segment
                featureB = mappedToLine[i + 1]; // start of segment
                if (i < mappedToLine.length - 3) {
                    if (mappedToLine[i + 2].properties.location - mappedToLine[i + 1].properties.location < 0.006) {
                        i += 2;
                        featureB = mappedToLine[i + 1];
                    }
                }

                pointOnPolygonA = turf.nearestPointOnLine(multiLine, featureA.geometry.coordinates);
                pointOnPolygonB = turf.nearestPointOnLine(multiLine, featureB.geometry.coordinates);

                if (drawPoint) {
                    drawPoint(featureA.geometry.coordinates, `${i}`);
                    drawPoint(featureB.geometry.coordinates, `${i + 1}`);
                }

                // context.fillStyle = 'rgba(0,0,0,0.00)';
                // drawPolygon(polygonA.coordinates);
                // drawPolygon(polygonB.coordinates);
                // context.fillStyle = 'rgba(0,0,0,0.75)';

                const findCornerIndex = (direction: number, index: number, polygonA: Polygon, polygonB: Polygon): number => {

                    const distanceR = turf.distance(pointOnPolygonA.geometry.coordinates, pointOnPolygonB.geometry.coordinates, {
                        units: 'meters'
                    });
                    // console.log('distanceR', distanceR);

                    let pointOnPolygonR = polygonA.coordinates[0][index];
                    let pointOnPolygonP: Position;
                    let distanceP: number;
                    let cornerIndexR = index;
                    let cornerIndexP: number;
                    for (let j = 1; j < 100; j++) {
                        cornerIndexP = index + j * direction + polygonA.coordinates[0].length * 10;
                        pointOnPolygonP = polygonA.coordinates[0][cornerIndexP % polygonA.coordinates[0].length];
                        distanceP = turf.pointToPolygonDistance(pointOnPolygonP, polygonB, {
                            units: 'meters'
                        });
                        // console.log('distanceP', j * direction, distanceP);
                        if (drawPoint) {
                            drawPoint(pointOnPolygonP);
                        }
                        if (distanceP > (distanceR * 1.40)) {
                            if (pointOnPolygonR) {
                                if (drawPoint) {
                                    drawPoint(pointOnPolygonR);
                                }
                            }
                            return cornerIndexR % polygonA.coordinates[0].length;
                        }
                        pointOnPolygonR = pointOnPolygonP;
                        cornerIndexR = cornerIndexP;

                    }
                    return index;

                }

                const polygonA: Polygon = {
                    type: 'Polygon',
                    coordinates: this.multiPolygon!.coordinates[pointOnPolygonA.properties.multiFeatureIndex]
                }
                const polygonB: Polygon = {
                    type: 'Polygon',
                    coordinates: this.multiPolygon!.coordinates[pointOnPolygonB.properties.multiFeatureIndex]
                }

                // console.log('A-');
                const minIndexA = findCornerIndex(-1, pointOnPolygonA.properties.index, polygonA, polygonB);
                // console.log('A+');
                let maxIndexA = findCornerIndex(1, pointOnPolygonA.properties.index, polygonA, polygonB);
                while (maxIndexA < minIndexA) {
                    maxIndexA += polygonA.coordinates[0].length;
                }
                // console.log('B-');
                const minIndexB = findCornerIndex(-1, pointOnPolygonB.properties.index, polygonB, polygonA);
                // console.log('B+');
                let maxIndexB = findCornerIndex(1, pointOnPolygonB.properties.index, polygonB, polygonA);
                while (maxIndexB < minIndexB) {
                    maxIndexB += polygonB.coordinates[0].length;
                }

                // console.log(i, ' --> ', minIndexA % polygonA.coordinates[0].length, maxIndexA % polygonA.coordinates[0].length, minIndexB % polygonB.coordinates[0].length, maxIndexB % polygonB.coordinates[0].length);
                if (minIndexA != maxIndexA && minIndexB != maxIndexB) {
                    const fillPolygon: Polygon = {
                        type: 'Polygon',
                        coordinates: [
                            []
                        ]
                    }
                    for (let j = minIndexA; j <= maxIndexA; j++) {
                        fillPolygon.coordinates[0].push(polygonA.coordinates[0][j % polygonA.coordinates[0].length])
                    }
                    for (let j = minIndexB; j <= maxIndexB; j++) {
                        fillPolygon.coordinates[0].push(polygonB.coordinates[0][j % polygonB.coordinates[0].length])
                    }
                    fillPolygon.coordinates[0].push(fillPolygon.coordinates[0][0]); // close polygon
                    fillPolygons.push(fillPolygon);
                }

                // break;

            }

        }

        return fillPolygons;

    }

    drawToCanvas(context: CanvasRenderingContext2D, coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position): void {

        context.fillStyle = 'rgba(0, 0, 255, 0.10)';
        context.strokeStyle = 'rgba(0, 0, 0, 0.50)';
        context.lineWidth = 2;
        context.font = "24px Consolas";

        // const rectSize = 4;
        // const drawPoint = (coordinate: Position, label?: string) => {
        //     const coordinateCanvas = coordinate4326ToCoordinateCanvas(coordinate);
        //     context.fillRect(coordinateCanvas[0] - rectSize / 2, coordinateCanvas[1] - rectSize / 2, rectSize, rectSize);
        //     if (label) {
        //         context.strokeRect(coordinateCanvas[0] - rectSize / 2, coordinateCanvas[1] - rectSize / 2, rectSize, rectSize);
        //         context.fillText(label, coordinateCanvas[0] + 2, coordinateCanvas[1] - 2);
        //     }
        // }

        const drawRing = (ring: Position[]) => {
            let isMove = true;
            ring.forEach(coordinate => {
                const coordinateCanvas = coordinate4326ToCoordinateCanvas(coordinate);
                if (isMove) {
                    context.moveTo(coordinateCanvas[0], coordinateCanvas[1]);
                } else {
                    context.lineTo(coordinateCanvas[0], coordinateCanvas[1]);
                }
                isMove = false;
            });
        }

        // const drawPolyline = (polyline: Position[]) => {
        //     context.beginPath();
        //     drawRing(polyline);
        //     context.stroke();
        // }

        const drawPolygon = (polygon: Position[][]) => {
            context.beginPath();
            polygon.forEach(ring => {
                drawRing(ring);
            });
            context.fill();
            // context.stroke();
        }

        super.drawToCanvas(context, coordinate4326ToCoordinateCanvas);

        this.multiPolygon.coordinates.forEach(polygon => {
            drawPolygon(polygon);
        })

        // drawPolyline(danube_canal.coordinates);

        // context.fillStyle = 'rgba(255,0,0,0.50)';
        // const fillPolysC = this.findFillPolygons(danube_canal, drawPoint);
        // fillPolysC.forEach(fillPolyC => {
        //     drawPolygon(fillPolyC.coordinates);
        // })

    }

}