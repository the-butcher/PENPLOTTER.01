import { LineString } from "geojson";

/**
 * base type for IContour and IHachure
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
export interface IContent {

    id: string;

    svgData: string;

    complete: boolean;

    closed: boolean;

    /**
     * get this contour as a geojson {@link LineString} holding WGS84 (epsg:4326) coordinates
     * @returns
     */
    toLineString: (minZ: number, maxZ: number) => LineString;
}