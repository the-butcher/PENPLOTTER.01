import { LineString, MultiLineString, Polygon } from "geojson";
import { IWorkerLineInput } from "../common/IWorkerLineInput";

export interface IWorkerLineInputRoad extends IWorkerLineInput<LineString> {
    polygons02: Polygon[];
    polygons34: Polygon[];
    polygons56: Polygon[];
    polygons78: Polygon[];
    multiPolyline78: MultiLineString;
}
