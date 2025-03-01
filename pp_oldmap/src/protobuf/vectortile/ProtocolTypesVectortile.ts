import { IProtocolTypeDefined } from "../base/decode/IProtocolTypeDefined";
import { ProtocolTypesPrimitives } from "../base/decode/ProtocolTypesPrimitives";
import { Vectortile } from "./Vectortile";
import { VectortileBuilder } from "./VectortileBuilder";
import { VectorTileLayer } from "./VectorTileLayer";
import { VectorTileLayerBuilder } from "./VectorTileLayerBuilder";
import { VectorTileFeature } from "./VectorTileFeature";
import { VectorTileFeatureBuilder } from "./VectorTileFeatureBuilder";
import { ProtocolTypeGeomType } from "./ProtocolTypeGeomType";
import { ProtocolTypeCoordinates } from "./ProtocolTypeCoordinates";
import { ProtocolTypes } from "../base/decode/ProtocolTypes";
import { VectorTileValueBuilder } from "./value/VectorTileValueBuilder";
import { IVectorTileValue, VECTOR_TILE_VALUE_TYPES } from "./IVectorTileValue";
import { IGeomType } from "./IGeomType";
import { IVectorTileCoordinate } from "./geometry/IVectorTileCoordinate";
import { IVectorTileKey } from "../../vectortile/IVectorTileKey";

/**
 * type-definitions derived from the mapbox vectortile .proto definition v2.1<br>
 * <a href="https://github.com/mapbox/vector-tile-spec/blob/master/2.1/vector_tile.proto">https://github.com/mapbox/vector-tile-spec/blob/master/2.1/vector_tile.proto</a><br>
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class ProtocolTypesVectortile {

    static TYPE_UID____VECTORTILE: string = '3f90b28b-47f2-4fb2-bc9a-4fc2dc215391';
    static TYPE_UID_________LAYER: string = '9b929e51-4ff0-40d2-a2cf-0ac24c32a9be';
    static TYPE_UID_______FEATURE: string = '97214e89-2b50-4fd6-a00b-64d16157e256';
    static TYPE_UID______GEOMTYPE: string = 'd2fce946-fa43-4061-a2b2-2b4d83e99daf';
    static TYPE_UID___COORDINATES: string = '8beff4cc-64ad-4d21-be1e-0de0b0ec7964';
    static TYPE_UID_________VALUE: string = 'c9ddfb0f-ca02-4e0b-b1ed-6437e49b87f8';

    static EXT_KEY_______TILE_KEY: number = 0XE0;

    static init() {

        //vectortile
        const protocolTypeVectortile: IProtocolTypeDefined<Vectortile, VectortileBuilder> = ProtocolTypes.define('vectortile', () => new VectortileBuilder());
        protocolTypeVectortile.defineKey('key_layer', 0x3, ProtocolTypesVectortile.TYPE_UID_________LAYER, (builder: VectortileBuilder, layer: VectorTileLayer) => builder.addLayer(layer));
        protocolTypeVectortile.defineKey('key___key', ProtocolTypesVectortile.EXT_KEY_______TILE_KEY, '', (builder: VectortileBuilder, tileKey: IVectorTileKey) => builder.setTileKey(tileKey));
        ProtocolTypes.ALL[ProtocolTypesVectortile.TYPE_UID____VECTORTILE] = protocolTypeVectortile;

        //layer
        const protocolTypeLayer: IProtocolTypeDefined<VectorTileLayer, VectorTileLayerBuilder> = ProtocolTypes.define('layer', () => new VectorTileLayerBuilder());
        protocolTypeLayer.defineKey('key____name', 0x1, ProtocolTypesPrimitives.TYPE_UID________STRING, (builder: VectorTileLayerBuilder, name: string) => builder.setName(name));
        protocolTypeLayer.defineKey('key_feature', 0x2, ProtocolTypesVectortile.TYPE_UID_______FEATURE, (builder: VectorTileLayerBuilder, feature: VectorTileFeature) => builder.addFeature(feature));
        protocolTypeLayer.defineKey('key_____key', 0x3, ProtocolTypesPrimitives.TYPE_UID________STRING, (builder: VectorTileLayerBuilder, key: string) => builder.addKey(key));
        protocolTypeLayer.defineKey('key___value', 0x4, ProtocolTypesVectortile.TYPE_UID_________VALUE, (builder: VectorTileLayerBuilder, value: IVectorTileValue<VECTOR_TILE_VALUE_TYPES>) => builder.addValue(value));
        protocolTypeLayer.defineKey('key__extent', 0x5, ProtocolTypesPrimitives.TYPE_UID______VARINT32, (builder: VectorTileLayerBuilder, extent: number) => builder.setExtent(extent));
        protocolTypeLayer.defineKey('key_version', 0xF, ProtocolTypesPrimitives.TYPE_UID______VARINT32, (builder: VectorTileLayerBuilder, version: number) => builder.setVersion(version));
        ProtocolTypes.ALL[ProtocolTypesVectortile.TYPE_UID_________LAYER] = protocolTypeLayer;

        //feature
        const protocolTypeFeature: IProtocolTypeDefined<VectorTileFeature, VectorTileFeatureBuilder> = ProtocolTypes.define('feature', () => new VectorTileFeatureBuilder());
        protocolTypeFeature.defineKey('key_______tags', 0x2, ProtocolTypesPrimitives.TYPE_UID_VARINT_PACKED, (builder: VectorTileFeatureBuilder, tags: number[]) => builder.setTags(tags));
        protocolTypeFeature.defineKey('key___geomType', 0x3, ProtocolTypesVectortile.TYPE_UID______GEOMTYPE, (builder: VectorTileFeatureBuilder, geomType: IGeomType) => builder.setGeomType(geomType));
        protocolTypeFeature.defineKey('key_coordCount', 0x4, ProtocolTypesVectortile.TYPE_UID___COORDINATES, (builder: VectorTileFeatureBuilder, coordinates: IVectorTileCoordinate[]) => builder.setCoordinates(coordinates));
        ProtocolTypes.ALL[ProtocolTypesVectortile.TYPE_UID_______FEATURE] = protocolTypeFeature;

        //value
        const protocolTypeValue: IProtocolTypeDefined<IVectorTileValue<VECTOR_TILE_VALUE_TYPES>, VectorTileValueBuilder> = ProtocolTypes.define('value', () => new VectorTileValueBuilder());
        protocolTypeValue.defineKey('key_string_value', 0x1, ProtocolTypesPrimitives.TYPE_UID________STRING, (builder: VectorTileValueBuilder, value: string) => builder.setStringValue(value));
        protocolTypeValue.defineKey('key_double_value', 0x3, ProtocolTypesPrimitives.TYPE_UID________DOUBLE, (builder: VectorTileValueBuilder, value: number) => builder.setNumberValue(value));
        protocolTypeValue.defineKey('key___long_value', 0x6, ProtocolTypesPrimitives.TYPE_UID________SINT64, (builder: VectorTileValueBuilder, value: number) => builder.setNumberValue(value));
        ProtocolTypes.ALL[ProtocolTypesVectortile.TYPE_UID_________VALUE] = protocolTypeValue;

        //geometry-type (simple type, instantiate)
        ProtocolTypes.ALL[ProtocolTypesVectortile.TYPE_UID______GEOMTYPE] = new ProtocolTypeGeomType();

        //coordinates (simple type, instantiate)
        ProtocolTypes.ALL[ProtocolTypesVectortile.TYPE_UID___COORDINATES] = new ProtocolTypeCoordinates();

    }


}