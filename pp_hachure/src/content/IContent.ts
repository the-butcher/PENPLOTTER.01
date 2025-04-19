import { LineString } from "geojson";

export interface IContent {

    id: string;

    svgData: string;

    complete: boolean;

    // /**
    //  * get this contour ready to populate the "d" attribute of a {@link SVGPathElement}
    //  * @returns
    //  */
    // getSvgData: () => string;

    /**
     * get this contour as a geojson {@link LineString} holding WGS84 (epsg:4326) coordinates
     * @returns
     */
    toLineString: () => LineString;
}