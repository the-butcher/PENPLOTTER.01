import { VectorTileKey } from "../vectortile/VectorTileKey";

export class Pen {

    static getPenWidthMeters(penDiameterMM: number, scale: number): number {
        return scale * penDiameterMM / 1000;
    }

    static getPenWidthPixels(penDiameterMM: number, scale: number, lod: number): number {
        return this.getPenWidthMeters(penDiameterMM, scale) / VectorTileKey.lods[lod].resolution;
    }

}