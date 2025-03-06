import { Position } from "geojson";
import { IVectorTileKey } from "./IVectorTileKey";
import { IVectorTileLod } from "./IVectorTileLod";

/**
 * helper class for vector-tile-caches in the slippy tilign scheme
 * @author h.fleischer
 * @since 05.03.2025
 */
export class VectorTileKey {

    static readonly lods: IVectorTileLod[] = [
        {
            level: 0,
            resolution: 78271.516964,
            scale: 295828763.795778
        },
        {
            level: 1,
            resolution: 39135.758482,
            scale: 147914381.897889
        },
        {
            level: 2,
            resolution: 19567.8792410001,
            scale: 73957190.9489445
        },
        {
            level: 3,
            resolution: 9783.93962049995,
            scale: 36978595.474472
        },
        {
            level: 4,
            resolution: 4891.96981024998,
            scale: 18489297.737236
        },
        {
            level: 5,
            resolution: 2445.98490512499,
            scale: 9244648.868618
        },
        {
            level: 6,
            resolution: 1222.9924525625,
            scale: 4622324.434309
        },
        {
            level: 7,
            resolution: 611.496226281245,
            scale: 2311162.2171545
        },
        {
            level: 8,
            resolution: 305.74811314069,
            scale: 1155581.1085775
        },
        {
            level: 9,
            resolution: 152.874056570279,
            scale: 577790.5542885
        },
        {
            level: 10,
            resolution: 76.4370282852055,
            scale: 288895.2771445
        },
        {
            level: 11,
            resolution: 38.2185141425366,
            scale: 144447.638572
        },
        {
            level: 12,
            resolution: 19.1092570712683,
            scale: 72223.819286
        },
        {
            level: 13,
            resolution: 9.55462853563415,
            scale: 36111.909643
        },
        {
            level: 14,
            resolution: 4.77731426781708,
            scale: 18055.9548215
        },
        {
            level: 15,
            resolution: 2.38865713397469,
            scale: 9027.977411
        },
        {
            level: 16,
            resolution: 1.19432856698734,
            scale: 4513.9887055
        },
        {
            level: 17,
            resolution: 0.597164283427525,
            scale: 2256.9943525
        },
        {
            level: 18,
            resolution: 0.298582141779909,
            scale: 1128.4971765
        },
        {
            level: 19,
            resolution: 0.149291070823809,
            scale: 564.248588
        }
    ];

    static readonly DIM = 512;
    static readonly ORI = 20037508.342789244;

    static toTileKey = (point3857: Position, lod: number): IVectorTileKey => {
        const tileMeters = VectorTileKey.DIM * VectorTileKey.lods[lod].resolution;
        return {
            lod,
            col: Math.floor((VectorTileKey.ORI + point3857[0]) / tileMeters),
            row: Math.floor((VectorTileKey.ORI - point3857[1]) / tileMeters)
        }
    };

}