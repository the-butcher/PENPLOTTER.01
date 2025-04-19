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
    handleRasterData: (rasterDataUpdates: Omit<IRasterDataProps, 'handleRasterData'>) => void;
}