import { MultiLineString, MultiPolygon } from "geojson";
import { IWorkerPolyOutput } from "../common/IWorkerPolyoutput";

export interface IWorkerPolyOutputPoint extends IWorkerPolyOutput {
    polyText: MultiPolygon;
    multiPolyline025: MultiLineString;
}