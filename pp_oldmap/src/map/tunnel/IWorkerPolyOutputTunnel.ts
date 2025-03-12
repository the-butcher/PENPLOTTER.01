import { MultiLineString } from "geojson";
import { IWorkerPolyOutput } from "../common/IWorkerPolyOutput";

export interface IWorkerPolyOutputTunnel extends IWorkerPolyOutput {
    multiPolyline04: MultiLineString;
}