import { Position } from "geojson";
import { IRange } from "../util/IRange";

export interface IRasterConfig {
    rasterName: string;
    cellsize: number;
    valueRangeSample: IRange;
    valueRangeRaster: IRange;
    rasterOrigin3857: Position;
}