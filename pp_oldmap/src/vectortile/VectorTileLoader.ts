
import { ProtocolTypes } from "../protobuf/base/decode/ProtocolTypes";
import { CodedInputStream } from "../protobuf/base/source/CodedInputStream";
import { ISubSource } from "../protobuf/base/source/ISubSource";
import { SubSource } from "../protobuf/base/source/SubSource";
import { ProtocolTypesVectortile } from "../protobuf/vectortile/ProtocolTypesVectortile";
import { Vectortile } from "../protobuf/vectortile/Vectortile";
import { ByteLoader } from "./ByteLoader";
import { IVectorTileKey } from "./IVectorTileKey";
import { IVectorTileUrl } from "./IVectorTileUrl";

/**
 * helper for loading VectorTiles, decoding it from the bytes provided by a ByteLoader
 *
 * @author h.fleischer
 * @since 12.10.2019
 *
 */
export class VectorTileLoader {

    private readonly vectorTileUrl: IVectorTileUrl;

    constructor(vectorTileUrl: IVectorTileUrl) {
        this.vectorTileUrl = vectorTileUrl;
    }

    load(tileKey: IVectorTileKey): Promise<Vectortile> {
        const tileUrl = this.vectorTileUrl.toUrl(tileKey);
        return new Promise((resolve, reject) => {
            new ByteLoader().load(tileUrl).then(
                function (byteArray: Uint8Array) {
                    const input = new CodedInputStream(byteArray);
                    const subSource: ISubSource = SubSource.wrapped(input);
                    const vectorTile: Vectortile = <Vectortile>ProtocolTypes.fromTypeUid(ProtocolTypesVectortile.TYPE_UID____VECTORTILE).decode(subSource, {
                        key: ProtocolTypesVectortile.EXT_KEY_______TILE_KEY,
                        val: tileKey
                    });
                    console.debug('vectorTile', vectorTile);
                    resolve(vectorTile);
                },
                function (failure: unknown) {
                    reject(failure);
                }
            );
        });
    }

}