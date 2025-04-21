import { Position } from "geojson";
import { IRange } from "../util/IRange";
import { ICoordinateConverter } from "./ICoordinateConverter";

/**
 * properties for the RasterConfigComponent
 *
 * @author h.fleischer
 * @since 18.04.2025
 */
export interface IRasterConfigProps {
    cellsize: number;
    wkt: string;
    valueRange: IRange;
    /**
     * raster origin (center of upper left pixel) in raster spatial reference coordinates
     */
    originProj: Position;
    /**
     * a helper for converting between raster spatial reference and WGS84/EPSG:4326
     */
    converter: ICoordinateConverter;
    handleRasterConfig: (rasterConfigUpdates: Omit<IRasterConfigProps, 'handleRasterConfig'>) => void;
}