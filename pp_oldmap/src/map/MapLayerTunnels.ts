import * as turf from '@turf/turf';
import { BBox, Feature, LineString, MultiLineString, MultiPolygon, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import { Map } from './Map';

export class MapLayerTunnels extends AMapLayer<LineString> {

    multiPolyline04: MultiLineString;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.multiPolyline04 = {
            type: 'MultiLineString',
            coordinates: []
        };
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        const symbolValue = feature.getValue('_symbol')?.getValue() as number;

        if (symbolValue < Map.SYMBOL_INDEX_____OTHER) {
            this.multiPolyline04.coordinates.push(...polylines.map(p => p.coordinates));
        }

    }

    async closeTile(): Promise<void> { }

    async processPoly(bboxClp4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        // smaller streets
        if (this.multiPolyline04.coordinates.length > 0) {
            const linebuffer04 = turf.buffer(this.multiPolyline04, 2, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            const polygons04 = VectorTileGeometryUtil.destructureUnionPolygon(linebuffer04.geometry);
            this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygons04);
        }

        console.log(`${this.name}, clipping to bboxClp4326 ...`);
        this.multiPolyline04 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline04, bboxClp4326);

    }

    async processLine(): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        this.multiPolyline030.coordinates.push(...this.multiPolyline04.coordinates);

    }

    async postProcess(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, creating dashes ...`);

        // const dashLengthBase = 11;
        // const polylines04A = VectorTileGeometryUtil.destructureMultiPolyline(this.multiPolyline04);
        // const polylines04B = VectorTileGeometryUtil.connectPolylines(polylines04A, 10);
        // const polylines04C: LineString[] = [];
        // polylines04B.forEach(polyline04B => {
        //     const feature04 = turf.feature(polyline04B);
        //     const length = turf.length(feature04, {
        //         units: 'meters'
        //     });
        //     let dashCount = Math.round(length / dashLengthBase);
        //     if (dashCount % 2 === 0) {
        //         dashCount++;
        //     };
        //     const dashLength = length / dashCount;
        //     console.log(length, dashCount, dashLength);
        //     for (let i = 0; i < dashCount; i++) {
        //         if (i % 2 === 0) {
        //             const coordinateA = turf.along(feature04, i * dashLength, {
        //                 units: 'meters'
        //             }).geometry.coordinates;
        //             const coordinateB = turf.along(feature04, (i + 1) * dashLength, {
        //                 units: 'meters'
        //             }).geometry.coordinates;
        //             polylines04C.push({
        //                 type: 'LineString',
        //                 coordinates: [coordinateA, coordinateB]
        //             });
        //         }
        //     }
        // });
        // this.multiPolyline04 = VectorTileGeometryUtil.restructureMultiPolyline(polylines04C);

        this.multiPolyline04 = VectorTileGeometryUtil.dashMultiPolyline(this.multiPolyline04, [10, 12]);

        this.multiPolyline030.coordinates = this.multiPolyline04.coordinates;

        console.log(`${this.name}, clipping to bboxMap4326 ...`);
        this.bboxClip(bboxMap4326);

    }

    drawToCanvas(context: CanvasRenderingContext2D, coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position): void {

        context.fillStyle = 'rgba(0, 0, 0, 0.10)';
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

        this.polyData.coordinates.forEach(polygon => {
            drawPolygon(polygon);
        })

    }

}