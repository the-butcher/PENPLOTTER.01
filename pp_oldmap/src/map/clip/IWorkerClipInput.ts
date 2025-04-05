import { MultiLineString, MultiPolygon } from "geojson";
import { ISkipOptions } from "../ISkipOptions";

export interface IWorkerClipInput {
    multiPolyline018Dest: MultiLineString;
    multiPolyline025Dest: MultiLineString;
    multiPolyline035Dest: MultiLineString;
    multiPolyline050Dest: MultiLineString;
    polyDataDest: MultiPolygon;
    polyDataClip: MultiPolygon;
    distance: number;
    options?: ISkipOptions;
}