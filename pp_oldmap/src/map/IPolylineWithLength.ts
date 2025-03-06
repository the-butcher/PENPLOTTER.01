import { LineString } from "geojson";

/**
 * helper type to speed up sorting a list of polylines by their length
 * @author h.fleischer
 * @since 05.03.2025
 * @deprecated
 */
export interface IPolylineWithLength extends LineString {
    length: number;
}