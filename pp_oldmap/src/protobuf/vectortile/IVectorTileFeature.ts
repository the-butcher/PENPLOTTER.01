import { IVectorTileCoordinate } from "./geometry/IVectorTileCoordinate";
import { IGeomType } from "./IGeomType";
import { IValueLookup } from "./IValueLookup";
import { IVectorTileValue, VECTOR_TILE_VALUE_TYPES } from "./IVectorTileValue";

/**
 * definition for types that hold information about features loaded from vector tiles
 * @author h.fleischer
 * @since 20.02.2025
 */
export interface IVectorTileFeature {
    layerName: string;
    geomType: IGeomType;
    coordinates: IVectorTileCoordinate[];
    valueLookup: IValueLookup;
    hasValue: (key: string, ...value: (string | number)[]) => boolean;
    getValue: (key: string) => IVectorTileValue<VECTOR_TILE_VALUE_TYPES> | undefined;
}