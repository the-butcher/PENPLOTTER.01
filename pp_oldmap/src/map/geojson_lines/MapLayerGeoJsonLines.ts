import { BBox, GeoJsonProperties, LineString, MultiLineString } from "geojson";
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { hachures_hallstatt } from "./hachures_hallstatt";

export class MapLayerGeoJsonLines extends AMapLayer<LineString, GeoJsonProperties> {

    private getDefaultPolylineContainer: (mapLayerLines: MapLayerGeoJsonLines) => MultiLineString;

    constructor(name: string, getDefaultPolylineContainer: (mapLayerLines: MapLayerGeoJsonLines) => MultiLineString) {
        super(name, {
            accepts: () => false,
        });
        this.getDefaultPolylineContainer = getDefaultPolylineContainer;
    }

    async accept(): Promise<void> {
        // nothing
    }

    async processPoly(): Promise<void> { // bboxMap4326: BBox
        //nothing
    }

    async processLine(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const linestrings = hachures_hallstatt.features.map(f => f.geometry);
        const multiLineString = VectorTileGeometryUtil.restructureMultiPolyline(linestrings);
        this.getDefaultPolylineContainer(this).coordinates.push(...multiLineString.coordinates);

        this.bboxClipLayer(bboxMap4326);

    }

    async processPlot(): Promise<void> {
        // nothing
    }

}