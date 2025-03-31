import { Position } from "geojson";

export interface IHachureVertex {
    position4326: Position;
    positionPixl: Position;
    height: number;
    aspect: number;
    // maybe slope here
}