import { MultiLineString } from "geojson";
import { IWorkerPolyOutput } from "../common/IWorkerPolyoutput";

export interface IWorkerPolyOutputTunnel extends IWorkerPolyOutput {
    multiPolyline04: MultiLineString;
}