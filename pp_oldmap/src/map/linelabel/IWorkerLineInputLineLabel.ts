import { Feature, GeoJsonProperties, LineString, MultiPolygon } from "geojson";
import { IWorkerLineInput } from "../common/IWorkerLineInput";
import { TFillProps } from "pp-geom";

export interface IWorkerLineInputLineLabel extends IWorkerLineInput<LineString, GeoJsonProperties> {
    polyText: Feature<MultiPolygon, TFillProps>[];
}
