import { IPositionProperties } from "./IPositionProperties";

/**
 * description of a vertex along a hachure line
 *
 * @author h.fleischer
 * @since 02.04.2025
 */
export interface IHachureVertex extends IPositionProperties {
    /**
     * the height at the position of this vertex
     */
    height: number;
    /**
     * the aspect (upward direction) at the position of this vertex in degrees
     */
    aspect: number;
    /**
     * the calculated slope at the vertex position in degrees
     */
    slope: number;
}
