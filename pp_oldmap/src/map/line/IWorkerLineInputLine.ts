import { LineString } from "geojson";
import { IWorkerLineInput } from "../common/IWorkerLineInput";

export interface IWorkerLineInputLine extends IWorkerLineInput<LineString> {
    dashArray: [number, number];
    offset: number;
}
