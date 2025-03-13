import { MultiPolygon } from "geojson";

export interface IWorkerPlotInput {
    name: string;
    polyData: MultiPolygon;
    polyText: MultiPolygon;
}