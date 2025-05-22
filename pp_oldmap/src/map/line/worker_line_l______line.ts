import * as turf from '@turf/turf';
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { ISymbolDefPointDash, IWorkerLineInputLine } from "./IWorkerLineInputLine";
import { Feature, LineString, MultiLineString } from 'geojson';
import { ISymbolProperties } from '../common/ISymbolProperties';
import { SymbolUtil } from '../../util/SymbolUtil';
import { PPGeometry } from 'pp-geom';

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputLine = e.data;

    let multiPolyline025 = PPGeometry.emptyMultiPolyline();
    let multiPolylineDef = PPGeometry.emptyMultiPolyline();

    const polylines = workerInput.tileData.map(f => f.geometry);
    const tileDataMult = PPGeometry.restructurePolylines(polylines);

    multiPolylineDef.coordinates.push(...tileDataMult.coordinates);

    if (workerInput.dashArray[1] > 0) {
        const dashedPolyline = VectorTileGeometryUtil.dashMultiPolyline(multiPolylineDef, workerInput.dashArray);
        multiPolylineDef.coordinates = dashedPolyline.coordinates;
    }

    if (workerInput.offset !== 0) {
        const offsetPolyline = turf.lineOffset(multiPolylineDef, workerInput.offset, {
            units: 'meters'
        });
        multiPolyline025.coordinates = offsetPolyline.geometry.coordinates;
    }

    const symbolKeys = Object.keys(workerInput.symbolDefinitions);
    if (symbolKeys.length > 0) {

        const filterBySymbolValue = (features: Feature<LineString, ISymbolProperties>[], ...symbols: number[]): MultiLineString => {
            const result = PPGeometry.emptyMultiPolyline();
            features.forEach(feature => {
                const symbol = feature.properties.symbol;
                if (symbols.some(s => symbol === s)) {
                    result.coordinates.push(feature.geometry.coordinates);
                }
            });
            return result;
        }

        console.log('found line dash symbol definitions', symbolKeys);

        for (let symbolKeyIndex = 0; symbolKeyIndex < symbolKeys.length; symbolKeyIndex++) {

            const symbolizablePolylines = filterBySymbolValue(workerInput.tileData, parseInt(symbolKeys[symbolKeyIndex]));
            if (symbolizablePolylines.coordinates.length > 0) {

                const symbolDefinition: ISymbolDefPointDash = workerInput.symbolDefinitions[symbolKeys[symbolKeyIndex]];
                // @ts-expect-error text type
                const symbolFactory: (coordinate: Position) => Position[][] = SymbolUtil[symbolDefinition.symbolFactory];

                const polylines = PPGeometry.destructurePolylines(symbolizablePolylines);

                polylines.forEach(polyline => {

                    const length = turf.length(turf.feature(polyline), {
                        units: 'meters'
                    });
                    const segmentCount = Math.ceil(length / symbolDefinition.dashSize);
                    const segmentLength = length / segmentCount;

                    console.log('cl', segmentCount, segmentLength);

                    for (let i = 1; i <= segmentCount - 1; i++) {

                        console.log(length, i * segmentLength);

                        const symbolCenterCoordinate = turf.along(polyline, i * segmentLength, {
                            units: 'meters'
                        }).geometry.coordinates;
                        const symbolCoordinates = symbolFactory(symbolCenterCoordinate);
                        multiPolyline025.coordinates.push(...symbolCoordinates);

                    }

                });

            }

        }

        multiPolyline025 = PPGeometry.bboxClipMultiPolyline(multiPolyline025, workerInput.bboxMap4326);

    }

    multiPolylineDef = PPGeometry.bboxClipMultiPolyline(multiPolylineDef, workerInput.bboxMap4326);
    multiPolyline025 = PPGeometry.bboxClipMultiPolyline(multiPolyline025, workerInput.bboxMap4326);



    // VectorTileGeometryUtil.cleanAndSimplify(multiPolylineDef);
    // VectorTileGeometryUtil.cleanAndSimplify(multiPolyline025);

    const workerOutput: IWorkerLineOutput = {
        multiPolylineDef,
        multiPolyline025: multiPolyline025
    };
    self.postMessage(workerOutput);

}