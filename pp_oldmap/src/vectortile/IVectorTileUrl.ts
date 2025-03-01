import { IVectorTileKey } from "./IVectorTileKey";

export interface IVectorTileUrl {
    toUrl: (tileKey: IVectorTileKey) => string;
}


