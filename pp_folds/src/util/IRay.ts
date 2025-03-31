import { Position } from "geojson";

export interface IRay {
    pixelCoordinate: Position;
    aspect: number;
    incrmt: number;
    cIndex: number;
}