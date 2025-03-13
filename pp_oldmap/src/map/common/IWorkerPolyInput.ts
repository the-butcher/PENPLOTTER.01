import { BBox, Feature, GeoJsonProperties, Geometry } from "geojson";

export interface IWorkerPolyInput<F extends Geometry, P extends GeoJsonProperties> {
    name: string;
    tileData: Feature<F, P>[];
    outin?: [number, number],
    bboxClp4326: BBox;
    bboxMap4326: BBox;
}