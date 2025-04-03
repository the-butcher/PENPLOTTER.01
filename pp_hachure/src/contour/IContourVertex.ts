import { IPositionProperties } from "./IPositionProperties";

export interface IContourVertex extends IPositionProperties {
    aspect: number;
    length: number; // length along original contour
    weighedLength: number;
}