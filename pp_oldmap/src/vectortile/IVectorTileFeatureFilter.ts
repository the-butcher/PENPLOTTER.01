import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileKey } from "./IVectorTileKey";

/**
 * definition for a type that checks for layer name and symbol id
 * @author h.fleischer
 * @since 20.02.2025
 */
export interface IVectorTileFeatureFilter {
    accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => boolean;
}