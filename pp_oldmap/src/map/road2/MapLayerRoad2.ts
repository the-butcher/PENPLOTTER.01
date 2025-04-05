import * as turf from '@turf/turf';
import { BBox, Feature, LineString, MultiLineString, MultiPolygon, Point, Polygon } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { UnionPolygon, VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { ISymbolProperties } from '../common/ISymbolProperties';


export class MapLayerRoad2 extends AMapLayer<LineString, ISymbolProperties> {

    bridgePolygons: MultiPolygon[];
    roadPolygons: MultiPolygon[];
    roadPolylines: MultiLineString[];
    bridgePolylines: MultiLineString[];
    bufferDistances: number[] = [
        6, // heighway
        6, // ramp
        6, // speedway
        5, // major roads
        4, // community
        3, // other roads
        2, // minor roads,
        2, // pedestrian a
        2, // pedestrian b
    ];

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.bridgePolygons = [];
        this.roadPolygons = [];
        this.roadPolylines = [];
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

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        // line only [6, 7, 8] Map.SYMBOL_INDEX_____MINOR, Map.SYMBOL_INDEX__PEDEST_A, Map.SYMBOL_INDEX__PEDEST_B

        // 5 - other
        // 4 - community
        // 3 - major
        // 2 - speedway
        // 1 - ramp
        // 0 - highway

        const filterByLayerAndSymbol = (layers: string[], symbols: number[]): MultiLineString => {
            const result = VectorTileGeometryUtil.emptyMultiPolyline();
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

        for (let i = 0; i < this.bufferDistances.length; i++) {

            let _bridgeMultiPolyline = filterByLayerAndSymbol(['GIP_BAUWERK_L_BRÜCKE'], [i]);
            const _bridgeMultiPolylines = VectorTileGeometryUtil.destructureMultiPolyline(_bridgeMultiPolyline).filter(p => turf.length(turf.feature(p), {
                units: 'meters'
            }) > 20);
            _bridgeMultiPolyline = VectorTileGeometryUtil.restructureMultiPolyline(_bridgeMultiPolylines);

            const _roadMultiPolyline = filterByLayerAndSymbol(['GIP_BAUWERK_L_BRÜCKE', 'GIP_L_GIP_144'], [i]);

            if (_bridgeMultiPolyline.coordinates.length > 0) {
                const bridgeBuffer = turf.buffer(_bridgeMultiPolyline, this.bufferDistances[i] + bridgeBufferExtraMeters, {
                    units: 'meters'
                }) as Feature<Polygon | MultiPolygon>;
                this.bridgePolygons.push(VectorTileGeometryUtil.restructureMultiPolygon(VectorTileGeometryUtil.destructureUnionPolygon(bridgeBuffer.geometry)));
            } else {
                this.bridgePolygons.push(VectorTileGeometryUtil.emptyMultiPolygon());
            }

            this.bridgePolylines.push(_bridgeMultiPolyline); // the actual original bridge polylines

            if (_roadMultiPolyline.coordinates.length > 0) {

                // if (this.bufferDistances[i] > 0) {
                const roadBuffer = turf.buffer(_roadMultiPolyline, this.bufferDistances[i], {
                    units: 'meters'
                }) as Feature<Polygon | MultiPolygon>;
                this.roadPolygons.push(VectorTileGeometryUtil.restructureMultiPolygon(VectorTileGeometryUtil.destructureUnionPolygon(roadBuffer.geometry)));
                if (this.bufferDistances[i] > 2) {
                    this.roadPolylines.push({
                        type: 'MultiLineString',
                        coordinates: this.roadPolygons[i].coordinates.reduce((prev, curr) => [...prev, ...curr], [])
                    });
                } else {
                    this.roadPolylines.push(_roadMultiPolyline);
                }

                // } else {
                //     console.log('zero dim polyline', i, _roadMultiPolyline);
                //     this.roadPolygons.push(VectorTileGeometryUtil.emptyMultiPolygon());
                //     this.roadPolylines.push(_roadMultiPolyline);
                // }

            } else {
                this.roadPolygons.push(VectorTileGeometryUtil.emptyMultiPolygon());
                this.roadPolylines.push(VectorTileGeometryUtil.emptyMultiPolyline());
            }



        }

        // let _bridgeMultiPolyline6 = filterByLayerAndSymbol(['GIP_BAUWERK_L_BRÜCKE'], [i]);

        // for (let bridgeCategoryIndex = 0; bridgeCategoryIndex < this.bufferDistances.length; bridgeCategoryIndex++) {
        //     this.bridgePolylines[bridgeCategoryIndex] = VectorTileGeometryUtil.connectMultiPolyline(this.bridgePolylines[bridgeCategoryIndex], 5);
        // }

        // clip bridges away from roads
        for (let bridgeCategoryIndex = 0; bridgeCategoryIndex < this.bufferDistances.length; bridgeCategoryIndex++) {

            for (let roadCategoryIndex = 0; roadCategoryIndex < this.bufferDistances.length; roadCategoryIndex++) {

                const _bridgePolylines = VectorTileGeometryUtil.destructureMultiPolyline(this.bridgePolylines[bridgeCategoryIndex]);
                const bridgeBufferPolygons: Polygon[] = [];

                for (let bridgeIndex = 0; bridgeIndex < _bridgePolylines.length; bridgeIndex++) {

                    const _bridgePolyline = _bridgePolylines[bridgeIndex];

                    if (bridgeCategoryIndex != roadCategoryIndex) {

                        // if the bridge intersects another bridge on the other category, ignore that bridge, roads may be intersecting on a bridge
                        const bridgeIntersects = turf.lineIntersect(_bridgePolyline, this.bridgePolygons[roadCategoryIndex]);
                        if (bridgeIntersects.features.length === 0) {

                            // check how many intersects there are between the bridge polyline and the road polygon
                            const roadIntersects = turf.lineIntersect(_bridgePolyline, this.roadPolygons[roadCategoryIndex]);

                            if (roadIntersects.features.length % 2 === 0) { // specific bridge is passing in AND out of road feature => assume it actually crosses over

                                const bridgeBuffer: Feature<Polygon | MultiPolygon> = turf.buffer(_bridgePolyline, this.bufferDistances[bridgeCategoryIndex] + bridgeBufferExtraMeters, {
                                    units: 'meters'
                                }) as Feature<Polygon | MultiPolygon>;
                                bridgeBufferPolygons.push(...VectorTileGeometryUtil.destructureUnionPolygon(bridgeBuffer.geometry));

                            } else if (roadIntersects.features.length > 2) {

                                console.log('roadIntersects', bridgeCategoryIndex, roadCategoryIndex, roadIntersects);

                                // we need to find out if the first point on the bridge is within or not within the road polygon to know which segments are actually crossing the road
                                const firstPointOfBridge: Point = {
                                    type: 'Point',
                                    coordinates: _bridgePolyline.coordinates[0]
                                }
                                const firstPointWithin = turf.booleanWithin(firstPointOfBridge, this.roadPolygons[roadCategoryIndex]);
                                const startIndex = firstPointWithin ? 1 : 0;
                                console.log('startIndex', startIndex);

                                for (let intersectIndex = startIndex; intersectIndex < roadIntersects.features.length - 1; intersectIndex += 2) {



                                    const intersectA = roadIntersects.features[intersectIndex].geometry.coordinates;
                                    const intersectB = roadIntersects.features[intersectIndex + 1].geometry.coordinates;
                                    const nearestA = turf.nearestPointOnLine(_bridgePolyline, intersectA, {
                                        units: 'meters'
                                    });
                                    const nearestB = turf.nearestPointOnLine(_bridgePolyline, intersectB, {
                                        units: 'meters'
                                    });
                                    const locations: number[] = [
                                        nearestA.properties.location,
                                        nearestB.properties.location
                                    ];
                                    locations.sort();

                                    const _subbridgePolyline = turf.lineSliceAlong(_bridgePolyline, locations[0], locations[1], {
                                        units: 'meters'
                                    });

                                    const bridgeBuffer: Feature<Polygon | MultiPolygon> = turf.buffer(_subbridgePolyline, this.bufferDistances[bridgeCategoryIndex] + bridgeBufferExtraMeters, {
                                        units: 'meters'
                                    }) as Feature<Polygon | MultiPolygon>;
                                    bridgeBufferPolygons.push(...VectorTileGeometryUtil.destructureUnionPolygon(bridgeBuffer.geometry));

                                }

                            }

                        }

                    }

                }

                const bridgeBufferMultiPolygon = turf.feature(VectorTileGeometryUtil.restructureMultiPolygon(bridgeBufferPolygons));

                this.roadPolylines[roadCategoryIndex] = VectorTileGeometryUtil.clipMultiPolyline(this.roadPolylines[roadCategoryIndex], bridgeBufferMultiPolygon);

                const featureCollection = turf.featureCollection([turf.feature(this.roadPolygons[roadCategoryIndex]), bridgeBufferMultiPolygon]);
                const difference = turf.difference(featureCollection);
                if (difference) {
                    const differenceGeometry: UnionPolygon = difference!.geometry; // subtract inner polygons from outer
                    const polygonsD = VectorTileGeometryUtil.destructureUnionPolygon(differenceGeometry);
                    this.roadPolygons[roadCategoryIndex] = VectorTileGeometryUtil.restructureMultiPolygon(polygonsD);
                }

            }

        }

    }

    async processLine(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        for (let roadIndexA = this.bufferDistances.length - 1; roadIndexA >= 1; roadIndexA--) {
            const roadAFeature = turf.feature(this.roadPolygons[roadIndexA]);
            for (let roadIndexB = roadIndexA - 1; roadIndexB >= 0; roadIndexB--) {

                this.roadPolylines[roadIndexB] = VectorTileGeometryUtil.clipMultiPolyline(this.roadPolylines[roadIndexB], roadAFeature);

            }
        }

        for (let roadIndexA = 0; roadIndexA < this.bufferDistances.length - 1; roadIndexA++) {
            const roadAFeature = turf.feature(this.roadPolygons[roadIndexA]);
            for (let roadIndexB = roadIndexA + 1; roadIndexB < this.bufferDistances.length; roadIndexB++) {

                this.roadPolylines[roadIndexB] = VectorTileGeometryUtil.clipMultiPolyline(this.roadPolylines[roadIndexB], roadAFeature);

            }
        }

        const polgons: Polygon[] = [
            ...VectorTileGeometryUtil.destructureMultiPolygon(this.roadPolygons[0]),
            ...VectorTileGeometryUtil.destructureMultiPolygon(this.roadPolygons[1]),
            ...VectorTileGeometryUtil.destructureMultiPolygon(this.roadPolygons[2]),
            ...VectorTileGeometryUtil.destructureMultiPolygon(this.roadPolygons[3]),
            ...VectorTileGeometryUtil.destructureMultiPolygon(this.roadPolygons[4]),
            ...VectorTileGeometryUtil.destructureMultiPolygon(this.roadPolygons[5]),
            ...VectorTileGeometryUtil.destructureMultiPolygon(this.roadPolygons[6]),
            ...VectorTileGeometryUtil.destructureMultiPolygon(this.roadPolygons[7]),
            ...VectorTileGeometryUtil.destructureMultiPolygon(this.roadPolygons[8]),
        ];
        this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polgons);

        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[0].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[1].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[2].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[3].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[4].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[5].coordinates);

        this.multiPolyline035.coordinates.push(...this.roadPolylines[0].coordinates);
        this.multiPolyline035.coordinates.push(...this.roadPolylines[1].coordinates);
        this.multiPolyline035.coordinates.push(...this.roadPolylines[2].coordinates);
        this.multiPolyline035.coordinates.push(...this.roadPolylines[3].coordinates);
        this.multiPolyline035.coordinates.push(...this.roadPolylines[4].coordinates);
        this.multiPolyline035.coordinates.push(...this.roadPolylines[5].coordinates);

        this.multiPolyline050.coordinates.push(...this.roadPolylines[6].coordinates);
        this.multiPolyline035.coordinates.push(...this.roadPolylines[7].coordinates);
        this.multiPolyline035.coordinates.push(...VectorTileGeometryUtil.dashMultiPolyline(this.roadPolylines[8], [6, 4]).coordinates);

        this.multiPolyline050 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline050, bboxMap4326);
        this.multiPolyline035 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline035, bboxMap4326);
        // this.multiPolyline025 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline025, bboxMap4326);

    }

    async processPlot(): Promise<void> {

        console.log(`${this.name}, connecting polylines ...`);


    }

}