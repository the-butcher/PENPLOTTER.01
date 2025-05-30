import { Feature, MultiPolygon } from "geojson";
import { IWorkerPolyOutput } from "../common/IWorkerPolyoutput";
import { TFillProps } from "pp-geom";

export interface IWorkerPolyOutputLineLabel extends IWorkerPolyOutput {
    polyText: Feature<MultiPolygon, TFillProps>[];
}