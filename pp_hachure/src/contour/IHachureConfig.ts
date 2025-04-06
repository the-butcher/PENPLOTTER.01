/**
 * definition of a basic configuration for the hachure calculatation
 * TODO :: find the aspects still requiring to be configurable and move them here or to another central place
 *
 * @since 06.04.2025
 * @author h.fleischer
 */
export interface IHachureConfig {
    minSpacing: number;
    maxSpacing: number;
    blurFactor: number;
    contourOff: number; // vertical difference of contours
    contourDiv: number;
    hachureRay: number;
    contourDsp: number; // display interval of contours
}