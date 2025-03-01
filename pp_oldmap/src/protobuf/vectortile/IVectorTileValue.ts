export type VECTOR_TILE_VALUE_TYPES = string | number | undefined;

/**
 * definition for types that hold a feature value<br>
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export interface IVectorTileValue<T> {

    /**
     * check if this instance containes a valid value
     */
    isEmpty(): boolean;

    /**
     * get the number of bytes that this value consumes in encoded form
     */
    getByteCount(): number;

    getValue(): T;

}