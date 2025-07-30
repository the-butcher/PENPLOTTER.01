import { ObjectUtil } from "../util/ObjectUtil";

/**
 * properties for the HachureConfigComponent
 *
 * @author h.fleischer
 * @since 18.04.2025
 */
export interface IHachureConfigProps {
    /**
     * average spacing of hachure lines
     */
    avgSpacing: number;
    /**
     * blur factor to be applied to raster before calculating
     */
    blurFactor: number;
    /**
     * vertical difference of contours during processing
     */
    contourOff: number;
    /**
     * subdivisions along contour
     */
    contourDiv: number; //
    /**
     * min slope to start a hachure
     */
    hachureDeg: number;
    /**
     * maximum dimension of a hachure line, length-wise and height-wise
     */
    hachureDim: number;
    /**
     * draw an arrow shape in geojson output (true) or a single line (false)
     */
    hachureArr: boolean;
    /**
     * display interval of contours
     */
    contourDsp: number;
    /**
     * random string, to force updates, i.e. in case an invalid input was made
     */
    hachureUid: string;
    propsCheck: boolean;
    handleHachureConfig: (hachureConfigUpdates: Omit<IHachureConfigProps, 'handleHachureConfig'>) => void;
}

/**
 * possible intervals at which contours are added to the output
 */
export const CONTOUR_DSP_OPTIONS: number[] = [
    5,
    10,
    20,
    25,
    50,
    100,
    200,
    250,
    500,
    1000,
    2000,
    3650,
];

export const toContourDspOption = (contourDsp: number): number => {
    return CONTOUR_DSP_OPTIONS.reduce((prev, curr) =>
        Math.abs(curr - contourDsp) < Math.abs(prev - contourDsp) ? curr : prev
    );
};

export const toContourOffOptions = (contourDsp: number): number[] => {
    contourDsp = toContourDspOption(contourDsp);
    return [
        contourDsp / 200,
        contourDsp / 100,
        contourDsp / 50,
        contourDsp / 20,
        contourDsp / 10,
        contourDsp / 5
    ];
};

export const toContourOffOption = (contourDsp: number, contourOff: number): number => {
    const contourOffOptions = toContourOffOptions(contourDsp);
    return contourOffOptions.reduce((prev, curr) =>
        Math.abs(curr - contourOff) < Math.abs(prev - contourOff) ? curr : prev
    );
};

export const HACHURE_CONFIG_DEFAULT_METERS: Omit<IHachureConfigProps, 'handleHachureConfig'> = {
    avgSpacing: 7,
    blurFactor: 0.10,
    contourOff: 1,
    contourDiv: 5,
    hachureDeg: 2.5,
    hachureDim: 100,
    hachureArr: true,
    contourDsp: 50,
    propsCheck: false,
    hachureUid: ObjectUtil.createId()
};