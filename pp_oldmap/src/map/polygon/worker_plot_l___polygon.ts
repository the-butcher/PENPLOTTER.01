import { Feature, MultiPoint, MultiPolygon, Polygon, Position } from "geojson";
import { UnionPolygon, VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { ISymbolDefPointFill, IWorkerLineInputPolygon } from "./IWorkerLineInputPolygon";
import * as turf from '@turf/turf';
import { SymbolUtil } from "../../util/SymbolUtil";
import { ISymbolProperties } from "../common/ISymbolProperties";

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputPolygon = e.data;

    let multiPolyline013 = VectorTileGeometryUtil.emptyMultiPolyline();

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

        const getHexPoints = (multiPolygon: UnionPolygon, symbolDefinition: ISymbolDefPointFill): Position[] => {

            const hexCoordinatesA: Position[] = [];

            const hexagonGrid = turf.hexGrid(turf.bbox(multiPolygon), symbolDefinition.gridSize, {
                units: 'meters'
            });
            if (symbolDefinition.gridType === 'hexagon') {
                hexagonGrid.features.forEach(feature => {
                    hexCoordinatesA.push(feature.geometry.coordinates[0][0]);
                    hexCoordinatesA.push(feature.geometry.coordinates[0][1]);
                });
            } else {
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
            const symbolDefinition: ISymbolDefPointFill = workerInput.symbolDefinitions[symbolKeys[symbolKeyIndex]];

            const centerPolygons02 = VectorTileGeometryUtil.bufferOutAndIn(symbolizablePolygons, 2, -4);
            const centerMultipolygon02 = VectorTileGeometryUtil.restructureMultiPolygon(centerPolygons02);

            const centerPolygons75 = VectorTileGeometryUtil.bufferOutAndIn(symbolizablePolygons, 2, -77);
            const centerMultipolygon75 = VectorTileGeometryUtil.restructureMultiPolygon(centerPolygons75);

            // let outerPolygon: UnionPolygon = symbolizablePolygons;

            const hexCoordinatesB: Position[] = [];

            if (centerMultipolygon75.coordinates.length > 0) {

                const featureO = turf.feature(centerMultipolygon02);
                const featureI = turf.feature(centerMultipolygon75);
                const featureC = turf.featureCollection([featureO, featureI]);

                const outerPolygonFeature = turf.difference(featureC);
                if (outerPolygonFeature) {
                    hexCoordinatesB.push(...getHexPoints(outerPolygonFeature.geometry, symbolDefinition));
                    hexCoordinatesB.push(...getHexPoints(centerMultipolygon75, {
                        ...symbolDefinition,
                        gridSize: symbolDefinition.gridSize * 2
                    }));
                } else {
                    hexCoordinatesB.push(...getHexPoints(symbolizablePolygons, symbolDefinition));
                }

            } else {
                hexCoordinatesB.push(...getHexPoints(symbolizablePolygons, symbolDefinition));
            }


            // const hexCoordinatesA: Position[] = [];

            // const hexagonGrid = turf.hexGrid(turf.bbox(symbolizablePolygons), symbolDefinition.gridSize, {
            //     units: 'meters'
            // });
            // if (symbolDefinition.gridType === 'hexagon') {
            //     hexagonGrid.features.forEach(feature => {
            //         hexCoordinatesA.push(feature.geometry.coordinates[0][0]);
            //         hexCoordinatesA.push(feature.geometry.coordinates[0][1]);
            //     });
            // } else {
            //     hexagonGrid.features.forEach(feature => {
            //         let x = 0;
            //         let y = 0;
            //         for (let i = 0; i < 6; i++) {
            //             x += feature.geometry.coordinates[0][i][0];
            //             y += feature.geometry.coordinates[0][i][1];
            //         }
            //         hexCoordinatesA.push([
            //             x / 6,
            //             y / 6
            //         ]);
            //     });
            // }

            // // add some random offsets to all points
            // if (symbolDefinition.randSize > 0) {
            //     hexCoordinatesA.forEach(coordinate => {
            //         coordinate[0] += (Math.random() - 0.5) * symbolDefinition.randSize;
            //         coordinate[1] += (Math.random() - 0.5) * symbolDefinition.randSize;
            //     });
            // }

            // // filter coordinates to be within the wood polygons
            // const hexpoints: MultiPoint = {
            //     type: 'MultiPoint',
            //     coordinates: hexCoordinatesA
            // };

            // // const pointsWithinMultiPolygon = turf.pointsWithinPolygon(turf.feature(hexpoints), outerMultipolygon);
            // const pointsWithinMultiPolygon = turf.pointsWithinPolygon(turf.pointsWithinPolygon(turf.feature(hexpoints), workerInput.polyData), outerPolygon);
            // const hexCoordinatesB: Position[] = [];
            // pointsWithinMultiPolygon.features.forEach(feature => {
            //     if (feature.geometry.type === 'MultiPoint') {
            //         hexCoordinatesB.push(...feature.geometry.coordinates);
            //     } else if (feature.geometry.type === 'Point') {
            //         hexCoordinatesB.push(feature.geometry.coordinates);
            //     }
            // });



            // @ts-expect-error text type
            const symbolFactory: (coordinate: Position) => Position[][] = SymbolUtil[symbolDefinition.symbolFactory];

            hexCoordinatesB.forEach(hexCoordinateB => {
                const symbolCoordinates = symbolFactory(hexCoordinateB);
                if (symbolCoordinates.length > 0) {
                    multiPolyline013.coordinates.push(...symbolCoordinates);
                }
            });

        }

        multiPolyline013 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline013, workerInput.bboxMap4326);

    }

    const workerOutput: IWorkerLineOutput = {
        multiPolyline013
    };
    self.postMessage(workerOutput);

}