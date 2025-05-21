import { BBox, Feature, MultiPoint, MultiPolygon, Polygon, Position } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { ISymbolDefPointFill, IWorkerLineInputPolygon } from "./IWorkerLineInputPolygon";
import * as turf from '@turf/turf';
import { SymbolUtil } from "../../util/SymbolUtil";
import { ISymbolProperties } from "../common/ISymbolProperties";
import { TUnionPolygon } from "pp-geom";

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputPolygon = e.data;

    let multiPolyline025 = VectorTileGeometryUtil.emptyMultiPolyline();

    const symbolKeys = Object.keys(workerInput.symbolDefinitions);
    if (symbolKeys.length > 0) {

        const filterBySymbolValue = (features: Feature<Polygon, ISymbolProperties>[], ...symbols: number[]): MultiPolygon => {
            const result = VectorTileGeometryUtil.emptyMultiPolygon();
            features.forEach(feature => {
                const symbol = feature.properties.symbol;
                if (symbols.some(s => symbol === s)) {
                    result.coordinates.push(feature.geometry.coordinates);
                }
            });
            return result;
        }

        const getHexPoints = (multiPolygon: TUnionPolygon, bbox: BBox, symbolDefinition: ISymbolDefPointFill): Position[] => {

            const hexCoordinatesA: Position[] = [];


            if (symbolDefinition.gridType === 'hexagon') {
                const hexagonGrid = turf.hexGrid(bbox, symbolDefinition.gridSize, {
                    units: 'meters'
                });
                hexagonGrid.features.forEach(feature => {
                    hexCoordinatesA.push(feature.geometry.coordinates[0][0]);
                    hexCoordinatesA.push(feature.geometry.coordinates[0][1]);
                });
            } else if (symbolDefinition.gridType === 'triangle') {
                const hexagonGrid = turf.hexGrid(turf.bbox(multiPolygon), symbolDefinition.gridSize, {
                    units: 'meters'
                });
                hexagonGrid.features.forEach(feature => {
                    let x = 0;
                    let y = 0;
                    for (let i = 0; i < 6; i++) {
                        x += feature.geometry.coordinates[0][i][0];
                        y += feature.geometry.coordinates[0][i][1];
                    }
                    hexCoordinatesA.push([
                        x / 6,
                        y / 6
                    ]);
                });
            } else {
                const squareGrid = turf.rectangleGrid(turf.bbox(multiPolygon), symbolDefinition.gridSize * 1.4, symbolDefinition.gridSize, {
                    units: 'meters'
                });
                squareGrid.features.forEach(feature => {
                    let x = 0;
                    let y = 0;
                    for (let i = 0; i < 4; i++) {
                        x += feature.geometry.coordinates[0][i][0];
                        y += feature.geometry.coordinates[0][i][1];
                    }
                    hexCoordinatesA.push([
                        x / 4,
                        y / 4
                    ]);
                });
            }

            // add some random offsets to all points
            if (symbolDefinition.randSize > 0) {
                hexCoordinatesA.forEach(coordinate => {
                    coordinate[0] += (Math.random() - 0.5) * symbolDefinition.randSize;
                    coordinate[1] += (Math.random() - 0.5) * symbolDefinition.randSize;
                });
            }

            // filter coordinates to be within the wood polygons
            const hexpoints: MultiPoint = {
                type: 'MultiPoint',
                coordinates: hexCoordinatesA
            };

            // const pointsWithinMultiPolygon = turf.pointsWithinPolygon(turf.feature(hexpoints), outerMultipolygon);
            const pointsWithinMultiPolygon = turf.pointsWithinPolygon(turf.pointsWithinPolygon(turf.feature(hexpoints), workerInput.polyData), multiPolygon);
            const hexCoordinatesB: Position[] = [];
            pointsWithinMultiPolygon.features.forEach(feature => {
                if (feature.geometry.type === 'MultiPoint') {
                    hexCoordinatesB.push(...feature.geometry.coordinates);
                } else if (feature.geometry.type === 'Point') {
                    hexCoordinatesB.push(feature.geometry.coordinates);
                }
            });

            return hexCoordinatesB;

        }

        for (let symbolKeyIndex = 0; symbolKeyIndex < symbolKeys.length; symbolKeyIndex++) {

            const symbolizablePolygons = filterBySymbolValue(workerInput.tileData, parseInt(symbolKeys[symbolKeyIndex]));
            if (symbolizablePolygons.coordinates.length > 0) {

                const symbolDefinition: ISymbolDefPointFill = workerInput.symbolDefinitions[symbolKeys[symbolKeyIndex]];

                const centerPolygons02 = VectorTileGeometryUtil.bufferOutAndIn(symbolizablePolygons, 10, -15);
                const centerMultipolygon02 = VectorTileGeometryUtil.restructurePolygons(centerPolygons02);

                const hexCoordinatesB: Position[] = [];
                const bbox = turf.bbox(symbolizablePolygons);
                if (symbolDefinition.outerDim > 0) {

                    const centerPolygonsOd = VectorTileGeometryUtil.bufferOutAndIn(symbolizablePolygons, 10, -(symbolDefinition.outerDim + 10));
                    const centerMultipolygonOd = VectorTileGeometryUtil.restructurePolygons(centerPolygonsOd);

                    if (centerMultipolygonOd.coordinates.length > 0) {

                        const featureO = turf.feature(centerMultipolygon02);
                        const featureI = turf.feature(centerMultipolygonOd);
                        const featureC = turf.featureCollection([featureO, featureI]);

                        const outerPolygonFeature = turf.difference(featureC);
                        if (outerPolygonFeature) {

                            hexCoordinatesB.push(...getHexPoints(outerPolygonFeature.geometry, bbox, symbolDefinition));
                            hexCoordinatesB.push(...getHexPoints(centerMultipolygonOd, bbox, {
                                ...symbolDefinition,
                                gridSize: symbolDefinition.gridSize * 1.6
                            }));
                        } else { // no difference feature
                            hexCoordinatesB.push(...getHexPoints(symbolizablePolygons, bbox, symbolDefinition));
                        }

                    } else { // no outer ring created
                        hexCoordinatesB.push(...getHexPoints(symbolizablePolygons, bbox, symbolDefinition));
                    }

                } else { // no outer dim specified
                    hexCoordinatesB.push(...getHexPoints(symbolizablePolygons, bbox, symbolDefinition));
                }

                // @ts-expect-error text type
                const symbolFactory: (coordinate: Position) => Position[][] = SymbolUtil[symbolDefinition.symbolFactory];

                hexCoordinatesB.forEach(hexCoordinateB => {
                    const symbolCoordinates = symbolFactory(hexCoordinateB);
                    if (symbolCoordinates.length > 0) {
                        multiPolyline025.coordinates.push(...symbolCoordinates);
                    }
                });

            }

        }

        multiPolyline025 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline025, workerInput.bboxMap4326);

    }

    const workerOutput: IWorkerLineOutput = {
        multiPolyline025
    };
    self.postMessage(workerOutput);

}