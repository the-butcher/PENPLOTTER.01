import { GeoJsonProperties, Point } from "geojson";
import { IWorkerPolyInput } from "../common/IWorkerPolyInput";
import { ILabelDefPointLabel } from "./ILabelDefPointLabel";

export interface IWorkerPolyInputPoint extends IWorkerPolyInput<Point, GeoJsonProperties> {
    symbolFactory: string;
    labelDefs: ILabelDefPointLabel[];
}
