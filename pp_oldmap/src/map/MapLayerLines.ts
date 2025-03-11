import { BBox, Feature, LineString, MultiLineString, MultiPolygon, Polygon } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import * as turf from '@turf/turf';

export class MapLayerLines extends AMapLayer<LineString> {

    private getDefaultPolylineContainer: (mapLayerLines: MapLayerLines) => MultiLineString;
    private dashArray: [number, number];

    constructor(name: string, filter: IVectorTileFeatureFilter, getDefaultPolylineContainer: (mapLayerLines: MapLayerLines) => MultiLineString, dashArray: [number, number] = [0, 0]) {
        super(name, filter);
        this.getDefaultPolylineContainer = getDefaultPolylineContainer;
        this.dashArray = dashArray;
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {
        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        this.tileData.push(...polylines);
    }

    async closeTile(): Promise<void> { }

    async processPoly(bboxClp4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        if (this.tileData.length > 0) {
            const tileDataMult = VectorTileGeometryUtil.restructureMultiPolyline(this.tileData);
            const tileDataBuff = turf.buffer(tileDataMult, 5, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            const polygons = VectorTileGeometryUtil.destructureUnionPolygon(tileDataBuff.geometry);
            this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygons);
        }

        console.log(`${this.name}, clipping to bboxMap4326 ...`);
        this.polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(this.polyData, bboxClp4326);

    }

    async processLine(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const tileDataMult = VectorTileGeometryUtil.restructureMultiPolyline(this.tileData);
        this.getDefaultPolylineContainer(this).coordinates.push(...tileDataMult.coordinates);

        if (this.dashArray[1] > 0) {
            const dashedPolyline = VectorTileGeometryUtil.dashMultiPolyline(this.getDefaultPolylineContainer(this), this.dashArray);
            this.getDefaultPolylineContainer(this).coordinates = dashedPolyline.coordinates;
        }

        this.bboxClip(bboxMap4326);

    }


    async postProcess(): Promise<void> {

        console.log(`${this.name}, connecting polylines ...`);
        this.connectPolylines(2);

    }

}