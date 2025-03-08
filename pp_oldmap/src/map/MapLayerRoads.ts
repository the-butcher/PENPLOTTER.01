import * as turf from '@turf/turf';
import { BBox, Feature, LineString, MultiLineString, MultiPolygon, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import { Map } from './Map';

export class MapLayerRoads extends AMapLayer<LineString> {

    multiPolyline02: MultiLineString;
    multiPolyline34: MultiLineString;
    multiPolyline56: MultiLineString;
    multiPolyline78: MultiLineString;

    polygons02: Polygon[];
    polygons34: Polygon[];
    polygons56: Polygon[];
    polygons78: Polygon[];

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
        this.polygons02 = [];
        this.polygons34 = [];
        this.polygons56 = [];
        this.polygons78 = [];
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        const symbolValue = feature.getValue('_symbol')?.getValue() as number;
        if (symbolValue === Map.SYMBOL_INDEX___HIGHWAY || symbolValue === Map.SYMBOL_INDEX______RAMP || symbolValue === Map.SYMBOL_INDEX__SPEEDWAY) {
            this.multiPolyline02.coordinates.push(...polylines.map(p => p.coordinates));
        } else if (symbolValue === Map.SYMBOL_INDEX_____MAJOR || symbolValue === Map.SYMBOL_INDEX_COMMUNITY) {
            this.multiPolyline34.coordinates.push(...polylines.map(p => p.coordinates));
        } else if (symbolValue === Map.SYMBOL_INDEX_____OTHER) {
            this.multiPolyline56.coordinates.push(...polylines.map(p => p.coordinates));
        } else if (symbolValue === Map.SYMBOL_INDEX_____MINOR || symbolValue === Map.SYMBOL_INDEX__PEDEST_A || symbolValue === Map.SYMBOL_INDEX__PEDEST_B) {
            this.multiPolyline78.coordinates.push(...polylines.map(p => p.coordinates));
        }


    }

    async closeTile(): Promise<void> { }

    async processData(bboxClp4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        console.log(`${this.name}, clipping to bboxClp4326 ...`);
        this.multiPolyline02 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline02, bboxClp4326);
        this.multiPolyline34 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline34, bboxClp4326);
        this.multiPolyline56 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline56, bboxClp4326);
        this.multiPolyline78 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline78, bboxClp4326);

        // highways - do not join with general streets
        if (this.multiPolyline02.coordinates.length > 0) {
            const linebuffer02 = turf.buffer(this.multiPolyline02, 6, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            this.polygons02.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer02.geometry));
        }

        // larger streets
        if (this.multiPolyline34.coordinates.length > 0) {
            const linebuffer34 = turf.buffer(this.multiPolyline34, 5, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            this.polygons34.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer34.geometry));
        }

        // smaller streets
        if (this.multiPolyline56.coordinates.length > 0) {
            const linebuffer56 = turf.buffer(this.multiPolyline56, 4, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            this.polygons56.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer56.geometry));
        }

        // smallest streets
        if (this.multiPolyline78.coordinates.length > 0) {
            const linebuffer78 = turf.buffer(this.multiPolyline78, 2, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            this.polygons78.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer78.geometry));
        }


        // rebuild multipolygon
        const union08 = VectorTileGeometryUtil.unionPolygons([...this.polygons02, ...this.polygons34, ...this.polygons56, ...this.polygons78]);
        const polygons08 = VectorTileGeometryUtil.destructureUnionPolygon(union08);
        this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygons08);

        console.log(`${this.name}, done`);

    }

    async processLine(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const multiPolygon02 = VectorTileGeometryUtil.restructureMultiPolygon(this.polygons02);
        const multiPolygon34 = VectorTileGeometryUtil.restructureMultiPolygon(this.polygons34);
        const multiPolygon56 = VectorTileGeometryUtil.restructureMultiPolygon(this.polygons56);

        const coordinates02: Position[][] = multiPolygon02.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        const multiOutline02: MultiLineString = {
            type: 'MultiLineString',
            coordinates: coordinates02
        };
        const coordinates34: Position[][] = multiPolygon34.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        let multiOutline34: MultiLineString = {
            type: 'MultiLineString',
            coordinates: coordinates34
        };
        const coordinates56: Position[][] = multiPolygon56.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        let multiOutline56: MultiLineString = {
            type: 'MultiLineString',
            coordinates: coordinates56
        };

        // clip smaller streets away from bigger streets
        multiOutline34 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline34, turf.feature(multiPolygon56));

        // clip bigger streets away from smaller streets
        multiOutline56 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline56, turf.feature(multiPolygon34));

        // clip bigger and smaller streets away from smallest streets
        const union36 = VectorTileGeometryUtil.unionPolygons([...this.polygons34, ...this.polygons56]);
        this.multiPolyline78 = VectorTileGeometryUtil.clipMultiPolyline(this.multiPolyline78, turf.feature(union36));

        // clip away highways from all streets
        multiOutline34 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline34, turf.feature(multiPolygon02));
        multiOutline56 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline56, turf.feature(multiPolygon02));
        this.multiPolyline78 = VectorTileGeometryUtil.clipMultiPolyline(this.multiPolyline78, turf.feature(multiPolygon02));

        this.multiPolyline010.coordinates.push(...multiOutline34.coordinates);
        this.multiPolyline010.coordinates.push(...multiOutline56.coordinates);
        this.multiPolyline030.coordinates.push(...this.multiPolyline78.coordinates);
        this.multiPolyline030.coordinates.push(...multiOutline02.coordinates);

        console.log(`${this.name}, clipping to bboxMap4326 ...`);
        this.bboxClip(bboxMap4326);

        console.log(`${this.name}, done`);

    }


    async postProcess(): Promise<void> {
        console.log(`${this.name}, connecting polylines ...`);
        this.connectPolylines(5);
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