import { Position } from "geojson";

/**
 * definition of a type that hold the same coordinate, once in pixel space and once in WGS84 (epsg:4326) space
 *
 * @since 06.04.2025
 * @author h.fleischer
 */
export interface IPositionProperties {
    /**
     * the WGS84 position of this vertext
     */
    position4326: Position;
    /**
     * the pixel position (with repect to the DEM raster) of this vertex
     */
    positionPixl: Position;
}