import { VECTOR_TILE_VALUE_TYPES } from "../IVectorTileValue";

export interface IValueFilter {

    getSourceLayer(): string;

    getKey(): string | undefined;

    getValue(): VECTOR_TILE_VALUE_TYPES;

}