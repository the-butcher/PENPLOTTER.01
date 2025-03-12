import * as turf from '@turf/turf';
import { UnionPolygon, VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerClipInput } from './IWorkerClipInput';
import { IWorkerClipOutput } from './IWorkerClipOutput';

self.onmessage = (e) => {

    const workerInput: IWorkerClipInput = e.data;

    // add some buffer margin for better readability
    const bufferResult = turf.buffer(workerInput.polyDataClip, workerInput.distance, {
        units: 'meters'
    });
    turf.simplify(bufferResult!, {
        mutate: true,
        tolerance: 0.00001,
        highQuality: true
    });
    turf.cleanCoords(bufferResult, {
        mutate: true
    });

    if (!workerInput.options?.skip005) {
        workerInput.multiPolyline005Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline005Dest, bufferResult!, workerInput.distance);
    }
    if (!workerInput.options?.skip010) {
        workerInput.multiPolyline010Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline010Dest, bufferResult!, workerInput.distance);
    }
    if (!workerInput.options?.skip030) {
        workerInput.multiPolyline030Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline030Dest, bufferResult!, workerInput.distance);
    }
    if (!workerInput.options?.skip050) {
        workerInput.multiPolyline050Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline050Dest, bufferResult!, workerInput.distance);
    }
    if (!workerInput.options?.skipMlt) {
        const featureC = turf.featureCollection([turf.feature(workerInput.polyDataDest), bufferResult!]);
        const difference: UnionPolygon = turf.difference(featureC)!.geometry; // subtract inner polygons from outer
        const polygonsD = VectorTileGeometryUtil.destructureUnionPolygon(difference);
        workerInput.polyDataDest = VectorTileGeometryUtil.restructureMultiPolygon(polygonsD);
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