import { Position } from "geojson";

/**
 * properties for the CropComponent
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
export interface ICropProps {
    minPositionProj: Position;
    maxPositionProj: Position;
}