import { GeoJsonProperties, Point } from "geojson";
import { IWorkerPolyInput } from "../common/IWorkerPolyInput";

export interface IWorkerPolyInputPoint extends IWorkerPolyInput<Point, GeoJsonProperties> {
    symbolFactory: string;
}
