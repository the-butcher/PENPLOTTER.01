import { MultiLineString, Position } from "geojson";
import { IMapProcessing } from "./IMapProcessing";

export interface IMapLayerProps {
    id: string;
    visible: boolean;
    polylines013: MultiLineString;
    polylines018: MultiLineString;
    polylines025: MultiLineString;
    polylines035: MultiLineString;
    polylines050: MultiLineString;
    status: IMapProcessing;
    coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position;
    handleVisibilityChange: (id: string, visible: boolean) => void;
    handleGeoJsonExport: (id: string) => void;
}