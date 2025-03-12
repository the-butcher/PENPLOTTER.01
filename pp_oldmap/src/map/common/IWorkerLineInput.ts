import { BBox, Feature, Geometry, MultiPolygon } from "geojson";

export interface IWorkerLineInput<F extends Geometry> {
    name: string;
    tileData: Feature<F>[];
    polyData: MultiPolygon;
    bboxClp4326: BBox;
    bboxMap4326: BBox;
}