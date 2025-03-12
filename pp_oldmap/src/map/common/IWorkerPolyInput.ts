import { BBox, Feature, Geometry } from "geojson";

export interface IWorkerPolyInput<F extends Geometry> {
    name: string;
    tileData: Feature<F>[];
    outin?: [number, number],
    bboxClp4326: BBox;
    bboxMap4326: BBox;
}