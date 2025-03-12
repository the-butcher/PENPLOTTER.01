import { Point } from "geojson";
import { IWorkerPolyInput } from "../common/IWorkerPolyInput";

export interface IWorkerPolyInputPoint extends IWorkerPolyInput<Point> {
    symbolFactory: string;
}
