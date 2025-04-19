import { Position } from "geojson";

export interface ICropProps {
    minPosition3857: Position;
    maxPosition3857: Position;
}