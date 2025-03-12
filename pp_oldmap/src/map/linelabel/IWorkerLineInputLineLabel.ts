import { LineString, MultiPolygon } from "geojson";
import { IWorkerLineInput } from "../common/IWorkerLineInput";

export interface IWorkerLineInputLineLabel extends IWorkerLineInput<LineString> {
    polyText: MultiPolygon;
}
