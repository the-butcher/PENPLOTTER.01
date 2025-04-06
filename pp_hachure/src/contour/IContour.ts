import { LineString } from "geojson";
import { IHachure } from "./IHachure";

/**
 * definition for types describing a single contour line at a given height
 *
 * @author h.fleischer
 * @since 06.04.2025
 */
export interface IContour {

    getId(): string;

    /**
     * get the height of this contour in meters
     */
    getHeight(): number;

    /**
     * parses the given hachures, possibly terminating some of the given lines
     * return any additional hachures that may be needed to fill empty spaces
     * @param hachures
     */
    handleHachures(hachuresProgress: IHachure[], hachuresComplete: IHachure[]): IHachure[];


    /**
     * return hachures that intersect
     * @param hachures
     */
    intersectHachures(hachures: IHachure[]): IHachure[];

    /**
     * get a scaled length at a given actual length
     * the scaled length is used to calculate the amount of hachure lines that can be fitted and
     * grows faster on the shadow side of a contour
     * @param length
     * @returns
     */
    lengthToScaledLength: (length: number) => number;

    scaledLengthToLength: (length: number) => number;

    /**
     * get this contour ready to populate the "d" attribute of a {@link SVGPathElement}
     * @returns
     */
    getSvgData: () => string;

    /**
     * get this contour as a geojson {@link LineString} holding WGS84 (epsg:4326) coordinates
     * @returns
     */
    toLineString: () => LineString;

}