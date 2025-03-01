import { ITypeBuilder } from "../base/decode/ITypeBuilder";
import { IVectorTileValue, VECTOR_TILE_VALUE_TYPES } from "./IVectorTileValue";
import { ValueLookupImpl } from "./value/ValueLookupImpl";
import { VectorTileFeature } from "./VectorTileFeature";
import { VectorTileLayer } from "./VectorTileLayer";

/**
 * implementation of ITypeBuilder usable while deserializing a VectorTileLayer from an encoded vectortile<br>
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class VectorTileLayerBuilder implements ITypeBuilder<VectorTileLayer, VectorTileLayerBuilder> {

    private byteCount: number | undefined;
    private name: string | undefined;
    private readonly features: VectorTileFeature[];
    private readonly keys: string[];
    private readonly values: IVectorTileValue<VECTOR_TILE_VALUE_TYPES>[];
    private extent: number | undefined;
    private version: number | undefined;

    constructor() {
        this.features = [];
        this.keys = [];
        this.values = [];
    }

    setByteCount(byteCount: number): VectorTileLayerBuilder {
        this.byteCount = byteCount;
        return this;
    }

    setName(name: string): VectorTileLayerBuilder {
        this.name = name;
        return this;
    }

    addFeature(feature: VectorTileFeature): VectorTileLayerBuilder {
        this.features.push(feature);
        return this;
    }

    addKey(key: string): VectorTileLayerBuilder {
        this.keys.push(key);
        return this;
    }

    addValue(value: IVectorTileValue<VECTOR_TILE_VALUE_TYPES>): VectorTileLayerBuilder {
        this.values.push(value);
        return this;
    }

    setExtent(extent: number) {
        this.extent = extent;
        return this;
    }

    setVersion(version: number) {
        this.version = version;
        return this;
    }

    build(): VectorTileLayer | undefined {
        const valueLookup = new ValueLookupImpl(this.keys, this.values);
        this.features.forEach(feature => {
            feature.valueLookup = valueLookup;
        });
        if (this.byteCount && this.name && this.extent && this.version) {
            return new VectorTileLayer(this.byteCount, this.name, this.features, this.keys, this.values, this.extent, this.version, valueLookup);
        }
    }

}