import { MultiPolygon } from "geojson";
import { IWorkerPolyOutput } from "../common/IWorkerPolyoutput";

export interface IWorkerPolyOutputLineLabel extends IWorkerPolyOutput {
    polyText: MultiPolygon;
}