import { IPositionProperties } from "./IPositionProperties";

/**
 * definition for a vertex along a contour line
 * @since 03.04.2025
 * @author h.fleischer
 */
export interface IContourVertex extends IPositionProperties {
    /**
     * length along the contour
     */
    length: number;
    /**
     * aspect of the contour at the vertex position in degrees
     */
    aspect: number;
    /**
     * slope at this vertex position in degrees
     */
    slope: number;
    /**
     * weighed length (for density calculation) of this vertex along its contour
     */
    weighedLength: number;
}