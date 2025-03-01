import { IValueLookup } from "../IValueLookup";
import { IVectorTileValue, VECTOR_TILE_VALUE_TYPES } from "../IVectorTileValue";

/**
 * helper type that holds a layer's keys and values
 *
 * @author h.fleischer
 * @since 23.09.2019
 */
export class ValueLookupImpl implements IValueLookup {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly keyPointersByName: { [K in string]: any };

    readonly values: IVectorTileValue<VECTOR_TILE_VALUE_TYPES>[];

    constructor(keys: string[], values: IVectorTileValue<VECTOR_TILE_VALUE_TYPES>[]) {

        //console.log('keys, values', keys, values);
        //collect key indices by value (so later a key can be used to lookup an index)
        this.keyPointersByName = {};
        for (let i = 0; i < keys.length; i++) {
            this.keyPointersByName[keys[i]] = i;
        }
        this.values = values;

    }

    /**
     * check if there is a key-index for the given key<br>
     * @param key
     */
    hasKey(key: string): boolean {
        return this.getKeyPointer(key) >= 0;
    }

    /**
     * check if the given key (i.e. '_symbol') resolves to an index in this lookup
     * @param key
     */
    getKeyPointer(key: string): number {
        if (this.keyPointersByName[key] != null) {
            return this.keyPointersByName[key];
        } else {
            return -1;
        }
    }

    getValue(index: number): IVectorTileValue<VECTOR_TILE_VALUE_TYPES> | undefined {
        if (index >= 0 && index < this.values.length) {
            return this.values[index];
        }
    }

}