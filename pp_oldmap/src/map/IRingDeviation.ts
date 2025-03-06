import { Position } from "geojson";

/**
 * helper type to describe the connection between buffered rings
 * @author h.fleischer
 * @since 05.03.2025
 */
export interface IRingDeviation {
    // outerId?: string;
    // innerId?: string;
    smPolygonIndex: number;
    lgPolygonIndex: number;
    deviationProps: {
        index: number; // the index after which the deviation occurs
        location: number;
        point: Position; // the actual coordinate where the larger ring connects to the smaller ring
    }
}

