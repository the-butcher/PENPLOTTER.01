import { GeoJsonProperties, LineString } from "geojson";
import { IWorkerPolyInput } from "../common/IWorkerPolyInput";

export interface IWorkerPolyInputLineLabel extends IWorkerPolyInput<LineString, GeoJsonProperties> {
    labelDefs: ILabelDefLineLabel[];
}

export interface ILabelDefLineLabel {
    tileName: string;
    plotName: string;
    distance: number; // distance along the label line
    vertical: number; // vertical offset from the line
    charsign: number;
    txtscale: number;
    idxvalid: string;
}