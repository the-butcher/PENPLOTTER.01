import { MultiLineString, MultiPolygon } from "geojson";
import { IWorkerPolyOutput } from "../common/IWorkerPolyOutput";

export interface IWorkerPolyOutputPoint extends IWorkerPolyOutput {
    polyText: MultiPolygon;
    multiPolyline005: MultiLineString;
}