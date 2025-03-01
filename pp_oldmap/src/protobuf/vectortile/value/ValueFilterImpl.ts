import { IVectorTileValue, VECTOR_TILE_VALUE_TYPES } from "../IVectorTileValue";
import { IValueFilter } from "./IValueFilter";

export class ValueFilterImpl implements IValueFilter {

    readonly sourceLayer: string;
    readonly filterKey: string | undefined;
    readonly filterValue: IVectorTileValue<VECTOR_TILE_VALUE_TYPES> | undefined;

    constructor(sourceLayer: string, filterKey?: string, filterValue?: IVectorTileValue<VECTOR_TILE_VALUE_TYPES>) {
        this.sourceLayer = sourceLayer;
        this.filterKey = filterKey;
        this.filterValue = filterValue;
    }

    getSourceLayer(): string {
        return this.sourceLayer;
    }

    getKey(): string | undefined {
        return this.filterKey;
    }

    getValue(): VECTOR_TILE_VALUE_TYPES {
        return this.filterValue?.getValue();
    }

}