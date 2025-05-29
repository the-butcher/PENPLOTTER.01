import { Feature, MultiPolygon } from "geojson";
import { TFillProps } from "pp-geom";

export interface IWorkerPlotInput {
    name: string;
    polyData: MultiPolygon;
    polyText: Feature<MultiPolygon, TFillProps>[];
}
