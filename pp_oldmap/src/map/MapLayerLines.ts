import { BBox, Feature, MultiLineString, MultiPolygon, Polygon } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import * as turf from '@turf/turf';

export class MapLayerLines extends AMapLayer {

    private getDefaultPolylineContainer: (mapLayerLines: MapLayerLines) => MultiLineString;

    constructor(name: string, filter: IVectorTileFeatureFilter, getDefaultPolylineContainer: (mapLayerLines: MapLayerLines) => MultiLineString) {
        super(name, filter);
        this.getDefaultPolylineContainer = getDefaultPolylineContainer;
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        this.getDefaultPolylineContainer(this).coordinates.push(...polylines.map(p => p.coordinates));

    }

    async closeTile(): Promise<void> { }

    async process(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing ...`);

        // buffer around tracks so tracks can be used to clip other features (like water where tracks cross)
        // TODO :: make this valid for all line widths
        if (this.multiPolyline010.coordinates.length > 0) {
            const linebuffer02 = turf.buffer(this.multiPolyline010, 5, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            const polygons = VectorTileGeometryUtil.destructureUnionPolygon(linebuffer02.geometry);
            this.multiPolygon = VectorTileGeometryUtil.restructureMultiPolygon(polygons);
        }

        // const cleanCoords = (multiPolyline: MultiLineString) => {
        //     if (multiPolyline.coordinates.length > 0) {
        //         turf.cleanCoords(multiPolyline, {
        //             mutate: true
        //         });
        //     }
        // }

        // cleanCoords(this.multiPolyline01);
        // cleanCoords(this.multiPolyline03);
        // cleanCoords(this.multiPolyline05);

        console.log(`${this.name}, clipping to bboxMap4326 ....`);
        this.bboxClip(bboxMap4326);

        console.log(`${this.name}, done`);

    }

    async postProcess(): Promise<void> {
        console.log(`${this.name}, connecting polylines ....`);
        this.connectPolylines(2);
    }

}