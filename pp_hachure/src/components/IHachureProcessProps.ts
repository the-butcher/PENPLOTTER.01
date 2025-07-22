import { IRange } from "../util/IRange";

/**
 * properties for the HachureProcessComponent
 *
 * @author h.fleischer
 * @since 18.04.2025
 */
export interface IHachureProcessProps {
    value: number;
    valueRange: IRange;
    handleHachureExport: (minZ: number, maxZ: number) => void;
    handleContourExport: (minZ: number, maxZ: number) => void;
    handleSurfaceExport: () => void;
}