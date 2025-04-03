import { Position } from "geojson";

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