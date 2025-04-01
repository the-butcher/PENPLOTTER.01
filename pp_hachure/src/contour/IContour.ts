import { IHachure } from "./IHachure";

export interface IContour {

    getId(): string;

    getHeight(): number;

    /**
     * parses the given hachures, possibly terminating some of the given lines
     * return any additional hachures that may be needed to fill empty spaces
     * @param hachures
     */
    handleHachures(hachures: IHachure[]): IHachure[];


    /**
     * return hachures that intersect
     * @param hachures
     */
    intersectHachures(hachures: IHachure[]): IHachure[];

    // getLength: () => number;

    /**
     * get a weighed length at a given actual length
     * the weighed length is used to calculate the amount of hachure lines that can be fitted and
     * grows faster on the shadow side of a contour
     * @param length
     * @returns
     */
    lengthToWeighedLength: (length: number) => number;

    weighedLengthToLength: (length: number) => number;

    getSvgData: () => string;

}