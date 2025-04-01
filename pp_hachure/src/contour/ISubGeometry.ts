import { BBox, LineString } from "geojson";

export interface ISubGeometry {
    geometry: LineString;
    lengthMin: number; // start length
    lengthMax: number;
    bbox: BBox;
}