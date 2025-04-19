import { IRange } from "../util/IRange";

/**
 * properties for the RasterDataComponent
 *
 * @author h.fleischer
 * @since 18.04.2025
 */
export interface IRasterDataProps {
    name: string;
    data: Float32Array;
    width: number;
    height: number;
    valueRange: IRange;
    /**
     * the amount of blur having been applied to this instance
     */
    blurFactor: number;
    handleRasterData: (rasterDataUpdates: Omit<IRasterDataProps, 'handleRasterData'>) => void;
}