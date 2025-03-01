import { VectorTileFeature } from "./VectorTileFeature";
import { IGeomType } from "./IGeomType";
import { ITypeBuilder } from "../base/decode/ITypeBuilder";
import { IVectorTileCoordinate } from "./geometry/IVectorTileCoordinate";
import { IVectorTileFeature } from "./IVectorTileFeature";

/**
 * implementation of ITypeBuilder for deserializing a Feature from an encoded vectortile<br>
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class VectorTileFeatureBuilder implements ITypeBuilder<IVectorTileFeature, VectorTileFeatureBuilder> {

    private byteCount: number | undefined;
    private readonly tags: number[];
    private geomType: IGeomType | undefined;
    private coordinates: IVectorTileCoordinate[];

    constructor() {
        this.tags = []; //be sure to at least have an empty array
        this.coordinates = [];
    }

    setByteCount(byteCount: number): VectorTileFeatureBuilder {
        this.byteCount = byteCount;
        return this;
    }

    setTags(tags: number[]): VectorTileFeatureBuilder {
        this.tags.push(...tags);
        return this;
    }

    setGeomType(geomType: IGeomType): VectorTileFeatureBuilder {
        this.geomType = geomType;
        return this;
    }

    setCoordinates(coordinates: IVectorTileCoordinate[]): VectorTileFeatureBuilder {
        this.coordinates.push(...coordinates);
        return this;
    }

    build(): VectorTileFeature | undefined {
        if (this.byteCount && this.geomType) {
            return new VectorTileFeature(this.byteCount, this.tags, this.geomType, this.coordinates);
        }
    }

}