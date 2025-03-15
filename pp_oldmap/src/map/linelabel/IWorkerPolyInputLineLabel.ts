import { GeoJsonProperties, LineString } from "geojson";
import { IWorkerPolyInput } from "../common/IWorkerPolyInput";
import { ILabelDefLineLabel } from "./ILabelDefLineLabel";

export interface IWorkerPolyInputLineLabel extends IWorkerPolyInput<LineString, GeoJsonProperties> {
    labelDefs: ILabelDefLineLabel[];
}

