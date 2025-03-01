import * as turf from '@turf/turf';
import { BBox, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";

export class MapLayerMisc extends AMapLayer {

    outin: [number, number];
    minArea: number;
    fillStyle: string;

    constructor(name: string, filter: IVectorTileFeatureFilter, outin: [number, number], minArea: number, fillStyle: string) {
        super(name, filter);
        this.outin = outin;
        this.minArea = minArea;
        this.fillStyle = fillStyle;
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {
        const polygons = VectorTileGeometryUtil.toPolygons(vectorTileKey, feature.coordinates).filter(p => Math.abs(turf.area(p)) > this.minArea);
        this.multiPolygon.coordinates.push(...polygons.map(p => p.coordinates));
    }

    async closeTile(): Promise<void> { }

    async process(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing ...`);

        turf.simplify(this.multiPolygon!, {
            mutate: true,
            tolerance: 0.00001,
            highQuality: true
        });
        turf.cleanCoords(this.multiPolygon, {
            mutate: true
        });

        console.log(`${this.name}, buffer in-out [${this.outin[0]}, ${this.outin[1]}] ....`);
        const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(this.multiPolygon, ...this.outin);
        this.multiPolygon = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA);

        console.log(`${this.name}, clipping ...`);
        this.multiPolygon = VectorTileGeometryUtil.bboxClipMultiPolygon(this.multiPolygon, bboxClp4326);

        const coordinates01: Position[][] = this.multiPolygon.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline010.coordinates.push(...coordinates01);

        const polylines = VectorTileGeometryUtil.destructureMultiPolyline(this.multiPolyline010).filter(p => turf.length(turf.feature(p), {
            units: 'meters'
        }) > 50);
        this.multiPolyline010 = VectorTileGeometryUtil.restructureMultiPolyline(polylines);


        this.bboxClip(bboxMap4326);
        console.log(`${this.name}, done`);

    }

    drawToCanvas(context: CanvasRenderingContext2D, coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position): void {

        context.fillStyle = this.fillStyle;
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