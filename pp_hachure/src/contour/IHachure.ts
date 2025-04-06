import { LineString } from "geojson";
import { IHachureVertex } from "./IHachureVertex";

/**
 * definition for a single hachure line that can grow upwards across {@link IContour} lines
 *
 * @since 06.04.2025
 * @author h.fleischer
 */
export interface IHachure {

    getId(): string;

    /**
     * get the current count of vertices in this hachure line
     */
    getVertexCount(): number;

    /**
     * removes the last vertex from this hachure line
     * @returns
     */
    popLastVertex: () => void;

    /**
     * get the last vertex in this hachure line
     * when the curve is initialized, there may be a single vertex initially
     * @returns
     */
    getLastVertex: () => IHachureVertex;
    addVertex: (vertex: IHachureVertex) => void;

    /**
     * mark this hachure as completed
     * @returns
     */
    setComplete: () => void;

    /**
     * check if this hachure is complete
     * @returns
     */
    isComplete: () => boolean;

    /**
     * get this hachure ready to populate the "d" attribute of a {@link SVGPathElement}
     * @returns
     */
    getSvgData: () => string;

    /**
     * get this hachure as a geojson {@link LineString} holding WGS84 (epsg:4326) coordinates
     * @returns
     */
    toLineString: () => LineString;

}