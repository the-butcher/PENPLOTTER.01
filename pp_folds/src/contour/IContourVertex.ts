import { Position } from "geojson";

export interface IContourVertex {
    position4326: Position;
    positionPixl: Position;
    aspect: number;
    length: number; // length along original contour
    weighedLength: number;
}