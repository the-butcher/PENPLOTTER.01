import { Feature, MultiLineString, MultiPolygon } from "geojson";
import { IWorkerPolyOutput } from "../common/IWorkerPolyoutput";
import { TFillProps } from "pp-geom";

export interface IWorkerPolyOutputPoint extends IWorkerPolyOutput {
    polyText: Feature<MultiPolygon, TFillProps>[];
    multiPolyline025: MultiLineString;
}