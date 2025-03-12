import { MultiLineString, MultiPolygon } from "geojson";

export interface IWorkerClipOutput {
    multiPolyline005Dest: MultiLineString;
    multiPolyline010Dest: MultiLineString;
    multiPolyline030Dest: MultiLineString;
    multiPolyline050Dest: MultiLineString;
    polyDataDest: MultiPolygon;
}