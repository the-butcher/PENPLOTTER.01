import { MultiLineString, Polygon } from "geojson";
import { IWorkerPolyOutput } from "../common/IWorkerPolyoutput";

export interface IWorkerPolyOutputRoad extends IWorkerPolyOutput {
    multiPolyline02: MultiLineString;
    multiPolyline34: MultiLineString;
    multiPolyline56: MultiLineString;
    multiPolyline78: MultiLineString;
    polygons02: Polygon[];
    polygons34: Polygon[];
    polygons56: Polygon[];
    polygons78: Polygon[];
}