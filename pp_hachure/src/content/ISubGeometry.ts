import { BBox, LineString } from "geojson";

/**
 * definition of a type that can be used to split a larger geometry into smaller subparts that together form the original geometry
 *
 * @since 06.04.2025
 * @author h.fleischer
 */
export interface ISubGeometry {
    /**
     * geojson subgeometry of a larger geometry
     */
    geometry: LineString;
    /**
     * min length along the primary geometry, zero on this geometry
     */
    lengthMin: number;
    /**
     * max length along the primary geometry, subgeom length on this geometry
     */
    lengthMax: number;
    /**
     * bounding box of this subgeometry
     */
    bbox: BBox;
}