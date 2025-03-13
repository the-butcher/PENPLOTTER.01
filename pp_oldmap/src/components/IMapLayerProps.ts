import { MultiLineString, Position } from "geojson";
import { IMapProcessing } from "./IMapProcessing";

export interface IMapLayerProps {
    id: string;
    visible: boolean;
    polylines005: MultiLineString;
    polylines010: MultiLineString;
    polylines030: MultiLineString;
    polylines050: MultiLineString;
    status: IMapProcessing;
    coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position;
    handleVisibilityChange: (id: string, visible: boolean) => void;
    handleGeoJsonExport: (id: string) => void;
}