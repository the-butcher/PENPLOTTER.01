import { Position } from "geojson";

export interface ILayout {
    cropLROffY: number;
    /**
     * the offset of the map name
     */
    mapNameOff: Position;
    /**
     * the offset of the map credits
     */
    creditsOff: Position;
    /**
     * maximum count of legend classes before proceeding in y-direction
     */
    legendOffX: number;
    legendOffY: number[];
    scalebarOff: Position;
    northArrOff: Position;
}