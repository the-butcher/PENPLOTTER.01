
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
    contourOff: number; // vertical difference of contours
    contourDiv: number; // subdivisions along contour
    hachureDeg: number; // min angle to start a hachure
    contourDsp: number; // display interval of contours
    propsCheck: boolean;
    handleHachureConfig: (hachureConfigUpdates: Omit<IHachureConfigProps, 'handleHachureConfig'>) => void;
}