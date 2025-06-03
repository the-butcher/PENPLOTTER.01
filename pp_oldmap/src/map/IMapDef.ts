import { BBox } from "geojson";
import { ILabelDef } from "./ILabelDef";


export interface IMapDef {
    bbox3857: BBox;
    hachures: string;
    contours: string;
    surface: string;
    clippoly: string;
    locatons: string;
    /**
     * path to geojson lines to be used for matching against label-defs
     */
    bordertx: string;
    /**
     * path to geojson lines to be used for matching against label-defs
     */
    water_tx: string;
    padding: number;
    shadeMin: number;
    magnNord: number;
    labelDefs: ILabelDef[];
}