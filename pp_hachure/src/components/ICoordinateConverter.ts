import { Position } from "geojson";
import { TUnitAbbr, TUnitName } from "./TUnit";

/**
 * definition for types that can convert between the raster spatial reference and WGS84/EPSG:4326
 *
 * @author h.fleischer
 * @since 21.04.2025
 */
export interface ICoordinateConverter {
    /**
     * convert a coordinate in WGS84/EPSG:4326 space to raster space
     * @param coordinates
     */
    convert4326ToProj(coordinates: Position): Position; // forward
    /**
     * convert a coordinate in raster space to WGS84/EPSG:4326 space
     * @param coordinates
     */
    convertProjTo4326(coordinates: Position): Position; // inverse
    /**
     * name of the raster spatial reference units (meteres, feet, ...)
     */
    projUnitName: TUnitName;
    /**
     * abbrevation of the raster spatial reference units
     */
    projUnitAbbr: TUnitAbbr;
    /**
     * meters per linear unit
     */
    metersPerUnit: number;
}