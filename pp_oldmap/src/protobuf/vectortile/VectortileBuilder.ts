import { IVectorTileKey } from "../../vectortile/IVectorTileKey";
import { ITypeBuilder } from "../base/decode/ITypeBuilder";
import { Vectortile } from "./Vectortile";
import { VectorTileLayer } from "./VectorTileLayer";

/**
 * implementation of ITypeBuilder usable while deserializing an Vectortile from an encoded vectortile<br>
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class VectortileBuilder implements ITypeBuilder<Vectortile, VectortileBuilder> {

    private byteCount: number | undefined;
    private readonly layers: VectorTileLayer[];
    private tileKey: IVectorTileKey | undefined;

    constructor() {
        this.layers = [];
    }

    setByteCount(byteCount: number): VectortileBuilder {
        this.byteCount = byteCount;
        return this;
    }

    setTileKey(tileKey: IVectorTileKey): VectortileBuilder {
        this.tileKey = tileKey;
        return this;
    }

    addLayer(layer: VectorTileLayer): VectortileBuilder {
        this.layers.push(layer);
        return this;
    }

    build(): Vectortile | undefined {
        if (this.byteCount && this.tileKey) {
            return new Vectortile(this.byteCount, this.tileKey, this.layers);
        }
    }


}