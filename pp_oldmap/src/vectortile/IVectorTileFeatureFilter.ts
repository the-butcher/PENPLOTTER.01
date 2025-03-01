import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";

/**
 * definition for a type that checks for layer name and symbol id
 * @author h.fleischer
 * @since 20.02.2025
 */
export interface IVectorTileFeatureFilter {
    accepts: (vectorTileFeature: IVectorTileFeature) => boolean;
}