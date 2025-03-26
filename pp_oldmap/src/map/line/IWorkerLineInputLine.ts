import { GeoJsonProperties, LineString } from "geojson";
import { IWorkerLineInput } from "../common/IWorkerLineInput";

export interface IWorkerLineInputLine extends IWorkerLineInput<LineString, GeoJsonProperties> {
    dashArray: [number, number];
    offset: number;
}
