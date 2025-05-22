import * as turf from '@turf/turf';
import { BBox, Feature, LineString, MultiLineString, MultiPolygon, Point, Polygon, Position } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { ISymbolProperties } from '../common/ISymbolProperties';
import { PPGeometry, TUnionPolygon } from 'pp-geom';

interface IOpenEnd {
    categoryIndex: number;
    polylineIndex: number;
    coordinateEnd: '0' | 'L';
}

export class MapLayerRoad2 extends AMapLayer<LineString, ISymbolProperties> {

    bridgePolygons: MultiPolygon[];
    roadPolygons: MultiPolygon[];

    roadOutlines: MultiLineString[];
    roadPolylines: MultiLineString[];
    bridgePolylines: MultiLineString[];

    static bufferDistanceMin = 0.1;
    static bufferDistances: number[] = [
        6, // heighway
        6, // ramp
        6, // speedway
        5, // major roads
        4, // community
        3, // other roads
        MapLayerRoad2.bufferDistanceMin, // minor roads,
        MapLayerRoad2.bufferDistanceMin, // pedestrian a
        MapLayerRoad2.bufferDistanceMin, // pedestrian b
    ];

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.bridgePolygons = [];
        this.roadPolygons = [];
        this.roadOutlines = [];
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

            const _roadMultiPolyline = filterByLayerAndSymbol(['GIP_BAUWERK_L_BRÜCKE', 'GIP_L_GIP_144'], [i]);

            if (_bridgeMultiPolyline.coordinates.length > 0) {
                const bridgeBuffer = turf.buffer(_bridgeMultiPolyline, MapLayerRoad2.bufferDistances[i] + bridgeBufferExtraMeters, {
                    units: 'meters'
                }) as Feature<Polygon | MultiPolygon>;
                this.bridgePolygons.push(PPGeometry.restructurePolygons(PPGeometry.destructurePolygons(bridgeBuffer.geometry)));
            } else {
                this.bridgePolygons.push(PPGeometry.emptyMultiPolygon());
            }

            this.bridgePolylines.push(_bridgeMultiPolyline); // the actual original bridge polylines

            if (_roadMultiPolyline.coordinates.length > 0) {

                // if (this.bufferDistances[i] > 0) {
                const roadBuffer = turf.buffer(_roadMultiPolyline, MapLayerRoad2.bufferDistances[i], {
                    units: 'meters'
                }) as Feature<Polygon | MultiPolygon>;
                this.roadPolygons.push(PPGeometry.restructurePolygons(PPGeometry.destructurePolygons(roadBuffer.geometry)));
                this.roadOutlines.push({
                    type: 'MultiLineString',
                    coordinates: this.roadPolygons[i].coordinates.reduce((prev, curr) => [...prev, ...curr], [])
                });
                this.roadPolylines.push(_roadMultiPolyline);

            } else {
                this.roadPolygons.push(PPGeometry.emptyMultiPolygon());
                this.roadOutlines.push(PPGeometry.emptyMultiPolyline());
                this.roadPolylines.push(PPGeometry.emptyMultiPolyline());
            }



        }

        // clip bridges away from roads
        for (let bridgeCategoryIndex = 0; bridgeCategoryIndex < MapLayerRoad2.bufferDistances.length; bridgeCategoryIndex++) {

            const _bridgePolylines = PPGeometry.destructurePolylines(this.bridgePolylines[bridgeCategoryIndex]);

            for (let roadCategoryIndex = 0; roadCategoryIndex < MapLayerRoad2.bufferDistances.length; roadCategoryIndex++) {

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

                                const bridgeBuffer: Feature<Polygon | MultiPolygon> = turf.buffer(_bridgePolyline, MapLayerRoad2.bufferDistances[bridgeCategoryIndex] + bridgeBufferExtraMeters, {
                                    units: 'meters'
                                }) as Feature<Polygon | MultiPolygon>;
                                bridgeBufferPolygons.push(...PPGeometry.destructurePolygons(bridgeBuffer.geometry));

                            } else if (roadIntersects.features.length > MapLayerRoad2.bufferDistanceMin) {

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
                                    let locations: number[] = [
                                        nearestA.properties.location,
                                        nearestB.properties.location
                                    ];
                                    locations = locations.sort((a, b) => a - b);

                                    console.log('locations', locations);

                                    const _subbridgePolyline = turf.lineSliceAlong(_bridgePolyline, locations[0], locations[1], {
                                        units: 'meters'
                                    });

                                    const bridgeBuffer: Feature<Polygon | MultiPolygon> = turf.buffer(_subbridgePolyline, MapLayerRoad2.bufferDistances[bridgeCategoryIndex] + bridgeBufferExtraMeters, {
                                        units: 'meters'
                                    }) as Feature<Polygon | MultiPolygon>;
                                    bridgeBufferPolygons.push(...PPGeometry.destructurePolygons(bridgeBuffer.geometry));

                                }

                            }

                        }

                    }

                }

                const bridgeBufferMultiPolygon = turf.feature(PPGeometry.restructurePolygons(bridgeBufferPolygons));

                this.roadOutlines[roadCategoryIndex] = PPGeometry.clipMultiPolyline(this.roadOutlines[roadCategoryIndex], bridgeBufferMultiPolygon);

                const featureCollection = turf.featureCollection([turf.feature(this.roadPolygons[roadCategoryIndex]), bridgeBufferMultiPolygon]);
                const difference = turf.difference(featureCollection);
                if (difference) {
                    const differenceGeometry: TUnionPolygon = difference!.geometry; // subtract inner polygons from outer
                    const polygonsD = PPGeometry.destructurePolygons(differenceGeometry);
                    this.roadPolygons[roadCategoryIndex] = PPGeometry.restructurePolygons(polygonsD);
                }

            }

        }

        const _highwayPolylines = PPGeometry.destructurePolylines(this.roadPolylines[0]);
        for (let roadCategoryIndex = 3; roadCategoryIndex < MapLayerRoad2.bufferDistances.length; roadCategoryIndex++) {

            const highwayBufferPolygons: Polygon[] = [];

            for (let highwayIndex = 0; highwayIndex < _highwayPolylines.length; highwayIndex++) {

                const _highwayPolyline = _highwayPolylines[highwayIndex];

                const bridgeBuffer: Feature<Polygon | MultiPolygon> = turf.buffer(_highwayPolyline, MapLayerRoad2.bufferDistances[0] + bridgeBufferExtraMeters, {
                    units: 'meters'
                }) as Feature<Polygon | MultiPolygon>;
                highwayBufferPolygons.push(...PPGeometry.destructurePolygons(bridgeBuffer.geometry));

            }

            const highwayBufferMultiPolygon = turf.feature(PPGeometry.restructurePolygons(highwayBufferPolygons));

            this.roadOutlines[roadCategoryIndex] = PPGeometry.clipMultiPolyline(this.roadOutlines[roadCategoryIndex], highwayBufferMultiPolygon);

            const featureCollection = turf.featureCollection([turf.feature(this.roadPolygons[roadCategoryIndex]), highwayBufferMultiPolygon]);
            const difference = turf.difference(featureCollection);
            if (difference) {
                const differenceGeometry: TUnionPolygon = difference!.geometry; // subtract inner polygons from outer
                const polygonsD = PPGeometry.destructurePolygons(differenceGeometry);
                this.roadPolygons[roadCategoryIndex] = PPGeometry.restructurePolygons(polygonsD);
            }

        }

    }

    findOpenEnds(roadCategoryIndexA: number, roadPolylineIndexA: number, bboxMap4326: BBox): IOpenEnd[] {

        const results: IOpenEnd[] = [];

        const polylineCoordinateA0 = this.roadPolylines[roadCategoryIndexA].coordinates[roadPolylineIndexA][0];
        const polylineCoordinateAL = this.roadPolylines[roadCategoryIndexA].coordinates[roadPolylineIndexA][this.roadPolylines[roadCategoryIndexA].coordinates[roadPolylineIndexA].length - 1];

        let openEnd0 = PPGeometry.booleanWithin(bboxMap4326, polylineCoordinateA0);
        let openEndL = PPGeometry.booleanWithin(bboxMap4326, polylineCoordinateAL);

        const maxDistance = 3.5;

        // road forming a loop (like in a roundabout)
        if (turf.distance(polylineCoordinateA0, polylineCoordinateAL, {
            units: 'meters'
        }) < maxDistance) {
            openEnd0 = false;
            openEndL = false;
        };

        let polylineA: LineString = {
            type: 'LineString',
            coordinates: this.roadPolylines[roadCategoryIndexA].coordinates[roadPolylineIndexA]
        };
        turf.cleanCoords(polylineA, {
            mutate: true
        });
        const lengthA = turf.length(turf.feature(polylineA), {
            units: 'meters'
        });

        if (lengthA >= maxDistance * 4) {

            polylineA = turf.lineSliceAlong(polylineA, maxDistance * 1.5, lengthA - maxDistance * 1.5, {
                units: 'meters'
            }).geometry;

            for (let coordinateIndex = 0; coordinateIndex < polylineA.coordinates.length; coordinateIndex++) {

                const polylineCoordinateAI = polylineA.coordinates[coordinateIndex];
                if (openEnd0) {
                    if (turf.distance(polylineCoordinateA0, polylineCoordinateAI, {
                        units: 'meters'
                    }) < maxDistance) {
                        openEnd0 = false;
                    }
                }
                if (openEndL) {
                    if (turf.distance(polylineCoordinateAL, polylineCoordinateAI, {
                        units: 'meters'
                    }) < maxDistance) {
                        openEndL = false;
                    }
                }

            }

        }

        if (openEnd0 || openEndL) {

            // first, faster, search
            for (let roadCategoryIndexB = 2; roadCategoryIndexB < MapLayerRoad2.bufferDistances.length - 3; roadCategoryIndexB++) {

                for (let roadPolylineIndexB = 0; roadPolylineIndexB < this.roadPolylines[roadCategoryIndexB].coordinates.length; roadPolylineIndexB++) {

                    // dont check against own polyline, would always find a hit
                    if (roadCategoryIndexA === roadCategoryIndexB && roadPolylineIndexA === roadPolylineIndexB) {
                        continue;
                    }

                    for (let coordinateIndex = 0; coordinateIndex < this.roadPolylines[roadCategoryIndexB].coordinates[roadPolylineIndexB].length; coordinateIndex++) {

                        const polylineCoordinateBI = this.roadPolylines[roadCategoryIndexB].coordinates[roadPolylineIndexB][coordinateIndex];
                        if (openEnd0) {
                            if (turf.distance(polylineCoordinateA0, polylineCoordinateBI, {
                                units: 'meters'
                            }) < maxDistance) {
                                openEnd0 = false;
                            }
                        }
                        if (openEndL) {
                            if (turf.distance(polylineCoordinateAL, polylineCoordinateBI, {
                                units: 'meters'
                            }) < maxDistance) {
                                openEndL = false;
                            }
                        }

                    }

                }

            }

        }

        // is still open, second, slower, search
        if (openEnd0 || openEndL) {

            for (let roadCategoryIndexB = 2; roadCategoryIndexB < MapLayerRoad2.bufferDistances.length - 3; roadCategoryIndexB++) {

                for (let roadPolylineIndexB = 0; roadPolylineIndexB < this.roadPolylines[roadCategoryIndexB].coordinates.length; roadPolylineIndexB++) {

                    // dont check agains to own polyline, would always find a hit
                    if (roadCategoryIndexA === roadCategoryIndexB && roadPolylineIndexA === roadPolylineIndexB) {
                        continue;
                    }

                    const polylineB: LineString = {
                        type: 'LineString',
                        coordinates: this.roadPolylines[roadCategoryIndexB].coordinates[roadPolylineIndexB]
                    };
                    turf.cleanCoords(polylineB, {
                        mutate: true
                    });

                    if (turf.length(turf.feature(polylineB), {
                        units: 'meters'
                    }) < 5) {
                        continue;
                    }

                    const bboxB = turf.bbox(polylineB);

                    if (openEnd0 && PPGeometry.booleanWithin(bboxB, polylineCoordinateA0)) {
                        // console.log(polylineB)
                        const nearest0 = turf.nearestPointOnLine(polylineB, polylineCoordinateA0, {
                            units: 'meters'
                        });
                        if (nearest0.properties.dist < maxDistance) {
                            openEnd0 = false;
                        }
                    }
                    if (openEndL && PPGeometry.booleanWithin(bboxB, polylineCoordinateAL)) {
                        // console.log(polylineB)
                        const nearestL = turf.nearestPointOnLine(polylineB, polylineCoordinateAL, {
                            units: 'meters'
                        });
                        if (nearestL.properties.dist < maxDistance) {
                            openEndL = false;
                        }
                    }


                }

            }

        }

        if (openEnd0) {
            results.push({
                categoryIndex: roadCategoryIndexA,
                polylineIndex: roadPolylineIndexA,
                coordinateEnd: '0'
            });
        }
        if (openEndL) {
            results.push({
                categoryIndex: roadCategoryIndexA,
                polylineIndex: roadPolylineIndexA,
                coordinateEnd: 'L'
            });
        }

        return results;

    }


    async processLine(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const openEnds: IOpenEnd[] = [];
        // start with index 2 to skip highways and ramps and also end early because we do not need to handle line only ends
        for (let roadCategoryIndexA = 2; roadCategoryIndexA < MapLayerRoad2.bufferDistances.length - 3; roadCategoryIndexA++) {
            for (let roadPolylineIndexA = 0; roadPolylineIndexA < this.roadPolylines[roadCategoryIndexA].coordinates.length; roadPolylineIndexA++) {
                openEnds.push(...this.findOpenEnds(roadCategoryIndexA, roadPolylineIndexA, bboxMap4326));
            }
        }
        console.log('openEnds', openEnds);

        const openPoly: MultiPolygon = PPGeometry.emptyMultiPolygon();
        openEnds.forEach(openEnd => {

            let polylineCoordinateE4326: Position;
            let polylineCoordinateD4326: Position;

            if (openEnd.coordinateEnd === '0') {

                polylineCoordinateE4326 = this.roadPolylines[openEnd.categoryIndex].coordinates[openEnd.polylineIndex][0];
                polylineCoordinateD4326 = this.roadPolylines[openEnd.categoryIndex].coordinates[openEnd.polylineIndex][1];

            } else {

                polylineCoordinateE4326 = this.roadPolylines[openEnd.categoryIndex].coordinates[openEnd.polylineIndex][this.roadPolylines[openEnd.categoryIndex].coordinates[openEnd.polylineIndex].length - 1];
                polylineCoordinateD4326 = this.roadPolylines[openEnd.categoryIndex].coordinates[openEnd.polylineIndex][this.roadPolylines[openEnd.categoryIndex].coordinates[openEnd.polylineIndex].length - 2];

            }

            const polylineCoordinateE3857 = turf.toMercator(polylineCoordinateE4326);
            const polylineCoordinateD3857 = turf.toMercator(polylineCoordinateD4326);

            const diffX = polylineCoordinateE3857[0] - polylineCoordinateD3857[0];
            const diffY = polylineCoordinateE3857[1] - polylineCoordinateD3857[1];

            const radius = MapLayerRoad2.bufferDistances[openEnd.categoryIndex] * 2;
            const angleS = Math.atan2(diffY, diffX);
            const angleA = angleS - Math.PI / 2;
            const angleB = angleS + Math.PI / 2 + Math.PI / 16;
            const capCoordinates3857: Position[] = [];
            capCoordinates3857.push(polylineCoordinateE3857);
            for (let angle = angleA; angle <= angleB; angle += Math.PI / 8) {
                capCoordinates3857.push([
                    polylineCoordinateE3857[0] + Math.cos(angle) * radius,
                    polylineCoordinateE3857[1] + Math.sin(angle) * radius
                ]);
            }
            capCoordinates3857.push(polylineCoordinateE3857);
            const capCoordinates4326 = capCoordinates3857.map(c => turf.toWgs84(c));

            // this.multiPolyline018.coordinates.push(capCoordinates4326);

            openPoly.coordinates.push([capCoordinates4326]);

        });

        // TODO :: could be faster if openPoly were split by category
        this.roadOutlines[3] = PPGeometry.clipMultiPolyline(this.roadOutlines[3], turf.feature(openPoly));
        this.roadOutlines[4] = PPGeometry.clipMultiPolyline(this.roadOutlines[4], turf.feature(openPoly));
        this.roadOutlines[5] = PPGeometry.clipMultiPolyline(this.roadOutlines[5], turf.feature(openPoly));

        for (let roadIndexA = MapLayerRoad2.bufferDistances.length - 1; roadIndexA >= 1; roadIndexA--) {
            if (MapLayerRoad2.bufferDistances[roadIndexA] <= MapLayerRoad2.bufferDistanceMin) {
                continue;
            }
            const roadAFeature = turf.feature(this.roadPolygons[roadIndexA]);
            for (let roadIndexB = roadIndexA - 1; roadIndexB >= 0; roadIndexB--) {
                if (MapLayerRoad2.bufferDistances[roadIndexB] <= MapLayerRoad2.bufferDistanceMin) {
                    this.roadPolylines[roadIndexB] = PPGeometry.clipMultiPolyline(this.roadPolylines[roadIndexB], roadAFeature);
                } else {
                    this.roadOutlines[roadIndexB] = PPGeometry.clipMultiPolyline(this.roadOutlines[roadIndexB], roadAFeature);
                }
            }
        }

        for (let roadIndexA = 0; roadIndexA < MapLayerRoad2.bufferDistances.length - 1; roadIndexA++) {
            const roadAFeature = turf.feature(this.roadPolygons[roadIndexA]);
            for (let roadIndexB = roadIndexA + 1; roadIndexB < MapLayerRoad2.bufferDistances.length; roadIndexB++) {
                if (MapLayerRoad2.bufferDistances[roadIndexB] <= MapLayerRoad2.bufferDistanceMin) {
                    this.roadPolylines[roadIndexB] = PPGeometry.clipMultiPolyline(this.roadPolylines[roadIndexB], roadAFeature);
                } else {
                    this.roadOutlines[roadIndexB] = PPGeometry.clipMultiPolyline(this.roadOutlines[roadIndexB], roadAFeature);
                }
            }
        }

        const polgons: Polygon[] = [
            ...PPGeometry.destructurePolygons(this.roadPolygons[0]),
            ...PPGeometry.destructurePolygons(this.roadPolygons[1]),
            ...PPGeometry.destructurePolygons(this.roadPolygons[2]),
            ...PPGeometry.destructurePolygons(this.roadPolygons[3]),
            ...PPGeometry.destructurePolygons(this.roadPolygons[4]),
            ...PPGeometry.destructurePolygons(this.roadPolygons[5]),
            ...PPGeometry.destructurePolygons(this.roadPolygons[6]),
            ...PPGeometry.destructurePolygons(this.roadPolygons[7]),
            ...PPGeometry.destructurePolygons(this.roadPolygons[8]),
        ];
        this.polyData = PPGeometry.restructurePolygons(polgons);

        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[0].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[1].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[2].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[3].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[4].coordinates);
        // this.multiPolyline018.coordinates.push(...this.bridgePolylines[5].coordinates);

        // this.multiPolyline035.coordinates.push(...this.roadPolylines[0].coordinates);
        // this.multiPolyline035.coordinates.push(...this.roadPolylines[1].coordinates);
        // this.multiPolyline035.coordinates.push(...this.roadPolylines[2].coordinates);
        // this.multiPolyline035.coordinates.push(...this.roadPolylines[3].coordinates);
        // this.multiPolyline018.coordinates.push(...this.roadPolylines[4].coordinates);
        // this.multiPolyline035.coordinates.push(...this.roadPolylines[5].coordinates);
        // this.multiPolyline035.coordinates.push(...this.roadPolylines[6].coordinates);
        // this.multiPolyline035.coordinates.push(...this.roadPolylines[7].coordinates);
        // this.multiPolyline035.coordinates.push(...this.roadPolylines[8].coordinates);

        this.multiPolyline050.coordinates.push(...this.roadOutlines[0].coordinates);
        this.multiPolyline050.coordinates.push(...this.roadOutlines[1].coordinates);
        this.multiPolyline035.coordinates.push(...this.roadOutlines[2].coordinates);

        this.multiPolyline035.coordinates.push(...this.roadOutlines[3].coordinates);
        this.multiPolyline035.coordinates.push(...this.roadOutlines[4].coordinates);
        this.multiPolyline025.coordinates.push(...this.roadOutlines[5].coordinates);

        this.multiPolyline025.coordinates.push(...this.roadPolylines[6].coordinates);
        this.multiPolyline025.coordinates.push(...PPGeometry.dashMultiPolyline(this.roadPolylines[7], [8, 4]).coordinates);
        this.multiPolyline025.coordinates.push(...PPGeometry.dashMultiPolyline(this.roadPolylines[8], [6, 6]).coordinates);

        this.multiPolyline050 = PPGeometry.bboxClipMultiPolyline(this.multiPolyline050, bboxMap4326);
        this.multiPolyline035 = PPGeometry.bboxClipMultiPolyline(this.multiPolyline035, bboxMap4326);
        this.multiPolyline025 = PPGeometry.bboxClipMultiPolyline(this.multiPolyline025, bboxMap4326);

    }

    async processPlot(): Promise<void> {

        console.log(`${this.name}, connecting polylines ...`);
        this.connectPolylines(5);

    }

}