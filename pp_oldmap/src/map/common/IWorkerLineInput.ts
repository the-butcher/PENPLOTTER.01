import { BBox, Feature, GeoJsonProperties, Geometry, MultiPolygon } from "geojson";

export interface IWorkerLineInput<F extends Geometry, P extends GeoJsonProperties> {
    name: string;
    tileData: Feature<F, P>[];
    polyData: MultiPolygon;
    bboxClp4326: BBox;
    bboxMap4326: BBox;
}