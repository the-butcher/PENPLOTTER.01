import { MultiLineString, MultiPolygon } from "geojson";
import { ISkipOptions } from "../ISkipOptions";

export interface IWorkerClipInput {
    multiPolyline005Dest: MultiLineString;
    multiPolyline010Dest: MultiLineString;
    multiPolyline030Dest: MultiLineString;
    multiPolyline050Dest: MultiLineString;
    polyDataDest: MultiPolygon;
    polyDataClip: MultiPolygon;
    distance: number;
    options?: ISkipOptions;
}