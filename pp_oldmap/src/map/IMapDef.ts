import { BBox } from "geojson";
import { ILabelDef } from "./ILabelDef";


export interface IMapDef {
    bbox3857: BBox;
    hachures: string;
    contours: string;
    clippoly: string;
    bordertx: string;
    padding: number;
    labelDefs: ILabelDef[];
}