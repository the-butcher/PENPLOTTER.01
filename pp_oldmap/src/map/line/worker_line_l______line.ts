import * as turf from '@turf/turf';
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerLineInputLine } from "./IWorkerLineInputLine";

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputLine = e.data;

    let multiPolyline010 = VectorTileGeometryUtil.emptyMultiPolyline();
    let multiPolylineDef = VectorTileGeometryUtil.emptyMultiPolyline();

    // const tileData1: Feature<LineString, GeoJsonProperties>[] = [...workerInput.tileData];
    // const findAndHandleOverlap = (): Feature<LineString, GeoJsonProperties>[] => {

    //     const featureA = tileData1[0];
    //     let geometryB = VectorTileGeometryUtil.restructureMultiPolyline(tileData1.slice(1).map(f => f.geometry));
    //     VectorTileGeometryUtil.cleanAndSimplify(geometryB);
    //     const featureB = turf.feature(geometryB);O

    //     turf.cleanCoords(featureA, {
    //         mutate: true
    //     });
    //     // turf.cleanCoords(featureB, {
    //     //     mutate: true
    //     // });

    //     console.log(featureA, turf.length(featureA, {
    //         units: 'meters'
    //     }), featureB);

    //     const tolerance = 2;
    //     const overlaps = turf.lineOverlap(featureA, featureB, {
    //         tolerance: tolerance / 1000 // kilometers
    //     });

    //     const result: Feature<LineString, GeoJsonProperties>[] = [];

    //     if (overlaps.features.length > 0) {

    //         console.log('overlaps', overlaps.features.map(f => f.geometry));

    //         const indxIntersects: Feature<Point, GeoJsonProperties>[] = [];
    //         const featureLength = turf.length(featureA, {
    //             units: 'meters'
    //         })

    //         for (let j = 0; j < overlaps.features.length; j++) {

    //             const overlapCoordinates = overlaps.features[j].geometry.coordinates;

    //             // console.log('overlapCoordinates', overlapCoordinates);
    //             indxIntersects.push(turf.nearestPointOnLine(featureA, overlapCoordinates[0], {
    //                 units: 'meters'
    //             }));
    //             indxIntersects.push(turf.nearestPointOnLine(featureA, overlapCoordinates[overlapCoordinates.length - 1], {
    //                 units: 'meters'
    //             }));


    //         }
    //         indxIntersects.sort((a, b) => a.properties!.location - b.properties!.location);

    //         const locations = indxIntersects.map(x => x.properties!.location);
    //         console.log('locations', locations);

    //         if (locations[0] > 0) {
    //             result.push(turf.lineSliceAlong(featureA, 0, locations[0], {
    //                 units: 'meters'
    //             }));
    //         }
    //         for (let j = 1; j < locations.length - 1; j += 2) {
    //             console.log(locations[j], locations[j + 1]);
    //             if (locations[j] < (locations[j + 1] - tolerance)) {
    //                 result.push(turf.lineSliceAlong(featureA, locations[j], locations[j + 1], {
    //                     units: 'meters'
    //                 }));
    //             }

    //         }
    //         if (locations[locations.length - 1] < featureLength) {
    //             result.push(turf.lineSliceAlong(featureA, locations[locations.length - 1], featureLength, {
    //                 units: 'meters'
    //             }));
    //         }


    //         // // remove feature having overlaps
    //         // tileData.splice(i, 1);


    //     } else {
    //         result.push(featureA);
    //     }

    //     return result;

    // }

    // const tileData2: Feature<LineString, GeoJsonProperties>[] = [];
    // while (tileData1.length > 0) {
    //     tileData2.push(...findAndHandleOverlap());
    //     tileData1.shift();
    // }

    const polylines = workerInput.tileData.map(f => f.geometry);
    const tileDataMult = VectorTileGeometryUtil.restructureMultiPolyline(polylines);
    // tileDataMult = VectorTileGeometryUtil.connectMultiPolyline(tileDataMult, 10);

    multiPolylineDef.coordinates.push(...tileDataMult.coordinates);

    if (workerInput.dashArray[1] > 0) {
        const dashedPolyline = VectorTileGeometryUtil.dashMultiPolyline(multiPolylineDef, workerInput.dashArray);
        multiPolylineDef.coordinates = dashedPolyline.coordinates;
    }

    if (workerInput.offset !== 0) {
        const offsetPolyline = turf.lineOffset(multiPolylineDef, workerInput.offset, {
            units: 'meters'
        });
        multiPolyline010.coordinates = offsetPolyline.geometry.coordinates;
    }

    multiPolylineDef = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolylineDef, workerInput.bboxMap4326);
    multiPolyline010 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline010, workerInput.bboxMap4326);

    // VectorTileGeometryUtil.cleanAndSimplify(multiPolylineDef);
    // VectorTileGeometryUtil.cleanAndSimplify(multiPolyline010);

    const workerOutput: IWorkerLineOutput = {
        multiPolylineDef,
        multiPolyline010
    };
    self.postMessage(workerOutput);

}