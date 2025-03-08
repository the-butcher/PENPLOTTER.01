import * as turf from '@turf/turf';
import { BBox, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";

export class MapLayerMisc extends AMapLayer<Polygon> {

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
        this.tileData.push(...polygons);
    }

    async closeTile(): Promise<void> { }

    async processData(bboxClp4326: BBox): Promise<void> {

        console.log(`${this.name}, processing data ...`);

        // turf.simplify(this.polyData!, {
        //     mutate: true,
        //     tolerance: 0.00001,
        //     highQuality: true
        // });
        // turf.cleanCoords(this.polyData, {
        //     mutate: true
        // });

        console.log(`${this.name}, buffer in-out [${this.outin[0]}, ${this.outin[1]}] ...`);
        const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(VectorTileGeometryUtil.restructureMultiPolygon(this.tileData), ...this.outin);
        this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA);

        console.log(`${this.name}, clipping ...`);
        this.polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(this.polyData, bboxClp4326);

        console.log(`${this.name}, done`);

    }

    async processLine(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const coordinates01: Position[][] = this.polyData.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline010.coordinates.push(...coordinates01);

        console.log(`${this.name}, clipping to bboxMap4326 ...`);
        this.bboxClip(bboxMap4326);

        console.log(`${this.name}, done`);

    }

    async postProcess(): Promise<void> {

        console.log(`${this.name}, connecting polylines ...`);
        this.connectPolylines(2);

        const polylines010 = VectorTileGeometryUtil.destructureMultiPolyline(this.multiPolyline010).filter(p => turf.length(turf.feature(p), {
            units: 'meters'
        }) > 20);
        this.multiPolyline010 = VectorTileGeometryUtil.restructureMultiPolyline(polylines010);

    }

}