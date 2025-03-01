import { IVectorTileValue } from "../IVectorTileValue";

/**
 * single numeric value as defined in the mapbox vectortile specification
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class VectorTileValueNumber implements IVectorTileValue<number> {

    readonly byteCount: number;
    readonly value: number;

    constructor(byteCount: number, value: number) {
        this.byteCount = byteCount;
        this.value = value;
    }

    isEmpty(): boolean {
        return false;
    }

    getByteCount(): number {
        return this.byteCount;
    }

    getValue(): number {
        return this.value;
    }

}