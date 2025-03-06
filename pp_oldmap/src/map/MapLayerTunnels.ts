import * as turf from '@turf/turf';
import { BBox, LineString, MultiLineString, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import { Map } from './Map';

export class MapLayerTunnels extends AMapLayer {

    multiPolyline02: MultiLineString;
    multiPolyline34: MultiLineString;
    multiPolyline56: MultiLineString;
    multiPolyline78: MultiLineString;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.multiPolyline02 = {
            type: 'MultiLineString',
            coordinates: []
        };
        this.multiPolyline34 = {
            type: 'MultiLineString',
            coordinates: []
        };
        this.multiPolyline56 = {
            type: 'MultiLineString',
            coordinates: []
        };
        this.multiPolyline78 = {
            type: 'MultiLineString',
            coordinates: []
        };
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        const symbolValue = feature.getValue('_symbol')?.getValue() as number;

        if (symbolValue < Map.SYMBOL_INDEX_____OTHER) {
            this.multiPolyline78.coordinates.push(...polylines.map(p => p.coordinates));
        }

    }

    async closeTile(): Promise<void> { }

    async process(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing ...`);

        console.log(`${this.name}, clipping to bboxClp4326 ...`);
        this.multiPolyline02 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline02, bboxClp4326);
        this.multiPolyline34 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline34, bboxClp4326);
        this.multiPolyline56 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline56, bboxClp4326);
        this.multiPolyline78 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline78, bboxClp4326);

        // const dashLengthBase = 11;
        // const polylines78A = VectorTileGeometryUtil.destructureMultiPolyline(this.multiPolyline78);
        // const polylines78B = VectorTileGeometryUtil.connectPolylines(polylines78A, 10);
        // const polylines78C: LineString[] = [];
        // polylines78B.forEach(polyline78B => {
        //     const feature78 = turf.feature(polyline78B);
        //     const length = turf.length(feature78, {
        //         units: 'meters'
        //     });
        //     let dashCount = Math.round(length / dashLengthBase);
        //     if (dashCount % 2 === 0) {
        //         dashCount++;
        //     };
        //     const dashLength = length / dashCount;
        //     // console.log(dashCount, dashLength);
        //     for (let i = 0; i < dashCount - 1; i++) {
        //         if (i % 2 === 0) {
        //             const coordinateA = turf.along(feature78, i * dashLength, {
        //                 units: 'meters'
        //             }).geometry.coordinates;
        //             const coordinateB = turf.along(feature78, (i + 1) * dashLength, {
        //                 units: 'meters'
        //             }).geometry.coordinates;
        //             polylines78C.push({
        //                 type: 'LineString',
        //                 coordinates: [coordinateA, coordinateB]
        //             });
        //         }
        //     }
        // });
        // this.multiPolyline78 = VectorTileGeometryUtil.restructureMultiPolyline(polylines78C);

        // this.multiPolyline030.coordinates.push(...this.multiPolyline78.coordinates);

        console.log(`${this.name}, clipping to bboxMap4326 ....`);
        this.bboxClip(bboxMap4326);
        console.log(`${this.name}, done`);

    }

    async postProcess(): Promise<void> {

        console.log(`${this.name}, creating dashes ....`);

        const dashLengthBase = 11;
        const polylines78A = VectorTileGeometryUtil.destructureMultiPolyline(this.multiPolyline78);
        const polylines78B = VectorTileGeometryUtil.connectPolylines(polylines78A, 10);
        const polylines78C: LineString[] = [];
        polylines78B.forEach(polyline78B => {
            const feature78 = turf.feature(polyline78B);
            const length = turf.length(feature78, {
                units: 'meters'
            });
            let dashCount = Math.round(length / dashLengthBase);
            if (dashCount % 2 === 0) {
                dashCount++;
            };
            const dashLength = length / dashCount;
            // console.log(dashCount, dashLength);
            for (let i = 0; i < dashCount - 1; i++) {
                if (i % 2 === 0) {
                    const coordinateA = turf.along(feature78, i * dashLength, {
                        units: 'meters'
                    }).geometry.coordinates;
                    const coordinateB = turf.along(feature78, (i + 1) * dashLength, {
                        units: 'meters'
                    }).geometry.coordinates;
                    polylines78C.push({
                        type: 'LineString',
                        coordinates: [coordinateA, coordinateB]
                    });
                }
            }
        });
        this.multiPolyline78 = VectorTileGeometryUtil.restructureMultiPolyline(polylines78C);

        this.multiPolyline030.coordinates.push(...this.multiPolyline78.coordinates);

    }

    drawToCanvas(context: CanvasRenderingContext2D, coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position): void {

        context.fillStyle = 'rgba(0, 0, 0, 0.50)';
        context.strokeStyle = 'rgba(0, 0, 0, 0.50)';

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

        const drawPolygon = (polygon: Position[][]) => {
            context.beginPath();
            polygon.forEach(ring => {
                // console.log('ring', ring);
                drawRing(ring);
            });
            context.fill();
            // context.stroke();
        }

        super.drawToCanvas(context, coordinate4326ToCoordinateCanvas);

        this.multiPolygon.coordinates.forEach(polygon => {
            drawPolygon(polygon);
        })

    }

}