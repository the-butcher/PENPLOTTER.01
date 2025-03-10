import { Position } from "geojson";

export interface ILabelledPoint {
    name: string;
    position4326: Position;
}