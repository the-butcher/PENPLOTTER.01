import * as turf from '@turf/turf';
import { UnionPolygon, VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerClipInput } from './IWorkerClipInput';
import { IWorkerClipOutput } from './IWorkerClipOutput';

self.onmessage = (e) => {

    const workerInput: IWorkerClipInput = e.data;

    const polyDataClip = VectorTileGeometryUtil.emptyMultiPolygon();
    workerInput.polyDataClip.coordinates.forEach(polygon => {
        if (polygon.length > 0 && polygon[0].length > 0) { // is there an outer ring having coordinates?
            polyDataClip.coordinates.push(polygon);
        }
    });
    if (polyDataClip.coordinates.length > 0) {

        // add some buffer margin for better readability
        const bufferResult = turf.buffer(polyDataClip, workerInput.distance, {
            units: 'meters'
        });
        const bufferResultGeometry = bufferResult!.geometry;
        VectorTileGeometryUtil.cleanAndSimplify(bufferResultGeometry);
        bufferResult!.geometry = bufferResultGeometry;

        if (!workerInput.options?.skip005) {
            workerInput.multiPolyline005Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline005Dest, bufferResult!);
        }
        if (!workerInput.options?.skip010) {
            workerInput.multiPolyline010Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline010Dest, bufferResult!);
        }
        if (!workerInput.options?.skip030) {
            workerInput.multiPolyline030Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline030Dest, bufferResult!);
        }
        if (!workerInput.options?.skip050) {
            workerInput.multiPolyline050Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline050Dest, bufferResult!);
        }
        if (!workerInput.options?.skipMlt) {

            const polyDataDest = VectorTileGeometryUtil.emptyMultiPolygon();
            workerInput.polyDataDest.coordinates.forEach(polygon => {
                if (polygon.length > 0 && polygon[0].length > 0) { // is there an outer ring having coordinates?
                    polyDataDest.coordinates.push(polygon);
                }
            });
            if (polyDataDest.coordinates.length > 0) {
                const featureC = turf.featureCollection([turf.feature(workerInput.polyDataDest), bufferResult!]);
                const difference: UnionPolygon = turf.difference(featureC)!.geometry; // subtract inner polygons from outer
                const polygonsD = VectorTileGeometryUtil.destructureUnionPolygon(difference);
                workerInput.polyDataDest = VectorTileGeometryUtil.restructureMultiPolygon(polygonsD);
            }

        }

    }

    const workerOutput: IWorkerClipOutput = {
        multiPolyline005Dest: workerInput.multiPolyline005Dest,
        multiPolyline010Dest: workerInput.multiPolyline010Dest,
        multiPolyline030Dest: workerInput.multiPolyline030Dest,
        multiPolyline050Dest: workerInput.multiPolyline050Dest,
        polyDataDest: workerInput.polyDataDest
    };
    self.postMessage(workerOutput);

}