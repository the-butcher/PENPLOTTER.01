import { IVectorTileKey } from "../../vectortile/IVectorTileKey";
import { VectorTileLayer } from "./VectorTileLayer";

/**
 * Layer type deserialized from an encoded vectortile<br>
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class Vectortile {

    readonly byteCount: number;
    readonly tileKey: IVectorTileKey;
    readonly layers: VectorTileLayer[];

    constructor(byteCount: number, tileKey: IVectorTileKey, layers: VectorTileLayer[]) {
        this.byteCount = byteCount;
        this.tileKey = tileKey;
        this.layers = layers;
    }

}