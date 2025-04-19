import { Position } from "geojson";
import { IRange } from "../util/IRange";

/**
 * properties for the RasterConfigComponent
 *
 * @author h.fleischer
 * @since 18.04.2025
 */
export interface IRasterConfigProps {
    cellsize: number;
    valueRange: IRange;
    origin3857: Position;
    handleRasterConfig: (rasterConfigUpdates: Omit<IRasterConfigProps, 'handleRasterConfig'>) => void;
}