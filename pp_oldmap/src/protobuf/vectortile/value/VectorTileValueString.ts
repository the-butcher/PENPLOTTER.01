import { IVectorTileValue } from "../IVectorTileValue";

/**
 * single string value as defined in the mapbox vectortile specification
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class VectorTileValueString implements IVectorTileValue<string> {

    readonly byteCount: number;
    readonly value: string;

    constructor(byteCount: number, value: string) {
        this.byteCount = byteCount;
        this.value = value;
    }

    isEmpty(): boolean {
        return false;
    }

    getByteCount(): number {
        return this.byteCount;
    }

    getValue(): string {
        return this.value;
    }

}