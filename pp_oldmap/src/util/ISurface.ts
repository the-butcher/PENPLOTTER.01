import { Position } from "geojson";

export interface ISurface {
    originProj: Position;
    width: number;
    height: number;
    cellsize: number;
    /**
     * heights, row after row
     */
    data: number[];
}