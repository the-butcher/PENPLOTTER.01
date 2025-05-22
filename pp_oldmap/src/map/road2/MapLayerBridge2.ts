import * as turf from '@turf/turf';
import { Feature, LineString, MultiLineString, MultiPolygon, Polygon } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { ISymbolProperties } from '../common/ISymbolProperties';
import { MapLayerRoad2 } from './MapLayerRoad2';
import { PPGeometry } from 'pp-geom';


export class MapLayerBridge2 extends AMapLayer<LineString, ISymbolProperties> {

    bridgePolygons: MultiPolygon[];
    bridgePolylines: MultiLineString[];

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.bridgePolygons = [];
        this.bridgePolylines = [];
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        const symbolValue = feature.getValue('_symbol')?.getValue() as number;

        polylines.forEach(polyline => {
            this.tileData.push(turf.feature(polyline, {
                lod: vectorTileKey.lod,
                col: vectorTileKey.col,
                row: vectorTileKey.row,
                symbol: symbolValue,
                layer: feature.layerName
            }));
        });

    }

    async processPoly(): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        // line only [6, 7, 8] Map.SYMBOL_INDEX_____MINOR, Map.SYMBOL_INDEX__PEDEST_A, Map.SYMBOL_INDEX__PEDEST_B

        // 5 - other
        // 4 - community
        // 3 - major
        // 2 - speedway
        // 1 - ramp
        // 0 - highway

        const filterByLayerAndSymbol = (layers: string[], symbols: number[]): MultiLineString => {
            const result = PPGeometry.emptyMultiPolyline();
            this.tileData.forEach(feature => {
                const layer = feature.properties.layer;
                if (layers.some(s => layer === s)) {
                    const symbol = feature.properties.symbol;
                    if (symbols.some(s => symbol === s)) {
                        result.coordinates.push(feature.geometry.coordinates);
                    }
                }
            });
            return result;
        }

        // const bridgePolylines: MultiLineString[] = [];
        const bridgeBufferExtraMeters = 2; //0.90;

        for (let i = 0; i < MapLayerRoad2.bufferDistances.length; i++) {

            let _bridgeMultiPolyline = filterByLayerAndSymbol(['GIP_BAUWERK_L_BRÜCKE'], [i]);
            // TODO :: use dedicated function VectorTileGeometryUtil
            const _bridgeMultiPolylines = PPGeometry.destructurePolylines(_bridgeMultiPolyline).filter(p => turf.length(turf.feature(p), {
                units: 'meters'
            }) > 20);
            _bridgeMultiPolyline = PPGeometry.restructurePolylines(_bridgeMultiPolylines);

            if (_bridgeMultiPolyline.coordinates.length > 0) {
                const bridgeBuffer = turf.buffer(_bridgeMultiPolyline, MapLayerRoad2.bufferDistances[i] + bridgeBufferExtraMeters, {
                    units: 'meters'
                }) as Feature<Polygon | MultiPolygon>;
                this.bridgePolygons.push(PPGeometry.restructurePolygons(PPGeometry.destructurePolygons(bridgeBuffer.geometry)));
            } else {
                this.bridgePolygons.push(PPGeometry.emptyMultiPolygon());
            }

            this.bridgePolylines.push(_bridgeMultiPolyline); // the actual original bridge polylines

        }

    }

    async processLine(): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        // no lines, for clipping only
        const polgons: Polygon[] = [
            ...PPGeometry.destructurePolygons(this.bridgePolygons[0]),
            ...PPGeometry.destructurePolygons(this.bridgePolygons[1]),
            ...PPGeometry.destructurePolygons(this.bridgePolygons[2]),
            ...PPGeometry.destructurePolygons(this.bridgePolygons[3]),
            ...PPGeometry.destructurePolygons(this.bridgePolygons[4]),
            ...PPGeometry.destructurePolygons(this.bridgePolygons[5]),
            ...PPGeometry.destructurePolygons(this.bridgePolygons[6]),
            ...PPGeometry.destructurePolygons(this.bridgePolygons[7]),
            ...PPGeometry.destructurePolygons(this.bridgePolygons[8]),
        ];
        this.polyData = PPGeometry.restructurePolygons(polgons);

        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[0].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[1].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[2].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[3].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[4].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[5].coordinates);

    }

    async processPlot(): Promise<void> {
        // nothing
    }

}