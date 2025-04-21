
/**
 * properties for the HachureConfigComponent
 *
 * @author h.fleischer
 * @since 18.04.2025
 */
export interface IHachureConfigProps {
    minSpacing: number;
    maxSpacing: number;
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
     * display interval of contours
     */
    contourDsp: number;
    /**
     * illumination azimuth, zero points north
     */
    azimuthDeg: number;
    propsCheck: boolean;
    handleHachureConfig: (hachureConfigUpdates: Omit<IHachureConfigProps, 'handleHachureConfig'>) => void;
}

export const HACHURE_CONFIG_DEFAULT_METERS: Omit<IHachureConfigProps, 'handleHachureConfig'> = {
    minSpacing: 6,
    maxSpacing: 8,
    blurFactor: 0.10,
    contourOff: 1,
    contourDiv: 5,
    hachureDeg: 2.5,
    contourDsp: 50,
    azimuthDeg: 280,
    propsCheck: false
};