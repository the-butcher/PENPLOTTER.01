import { BBox } from "geojson";
import { ILabelDef } from "./ILabelDef";


export interface IMapDef {
    bbox3857: BBox;
    padding: number;
    labelDefs: ILabelDef[];
}