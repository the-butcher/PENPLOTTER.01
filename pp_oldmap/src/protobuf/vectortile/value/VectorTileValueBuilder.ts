import { VectorTileValueString } from "./VectorTileValueString";
import { VectorTileValueNumber } from "./VectorTileValueNumber";
import { IVectorTileValue, VECTOR_TILE_VALUE_TYPES } from "../IVectorTileValue";
import { ITypeBuilder } from "../../base/decode/ITypeBuilder";

/**
 * implementation of ITypeBuilder usable while deserializing an IVectorTileValue from an encoded vectortile<br>
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class VectorTileValueBuilder implements ITypeBuilder<IVectorTileValue<VECTOR_TILE_VALUE_TYPES>, VectorTileValueBuilder> {

    private byteCount: number | undefined;
    private value: IVectorTileValue<VECTOR_TILE_VALUE_TYPES> | undefined;

    setByteCount(byteCount: number): VectorTileValueBuilder {
        this.byteCount = byteCount;
        return this;
    }

    setStringValue(value: string): VectorTileValueBuilder {
        if (this.byteCount) {
            this.value = new VectorTileValueString(this.byteCount, value);
        }
        return this;
    }

    setNumberValue(value: number): VectorTileValueBuilder {
        if (this.byteCount) {
            this.value = new VectorTileValueNumber(this.byteCount, value);
        }
        return this;
    }

    build(): IVectorTileValue<VECTOR_TILE_VALUE_TYPES> | undefined {
        return this.value;
    }

}