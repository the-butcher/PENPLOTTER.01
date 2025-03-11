import { BBox, LineString } from "geojson";
import { IWorkerPolyInput } from "../common/IWorkerPolyInput";

export interface IWorkerPolyInputLineLabel extends IWorkerPolyInput<LineString> {
    labelDefs: ILabelDefLineLabel[];
    bboxMap4326: BBox;
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