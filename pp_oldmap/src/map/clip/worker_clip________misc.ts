import * as turf from '@turf/turf';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerClipInput } from './IWorkerClipInput';
import { IWorkerClipOutput } from './IWorkerClipOutput';
import { PPGeometry, TUnionPolygon } from 'pp-geom';

self.onmessage = (e) => {

    const workerInput: IWorkerClipInput = e.data;

    const polyDataClip = PPGeometry.emptyMultiPolygon();
    workerInput.polyDataClip.coordinates.forEach(polygon => {
        if (polygon.length > 0 && polygon[0].length > 0) { // is there an outer ring having coordinates?
            polyDataClip.coordinates.push(polygon);
        }
    });
    if (polyDataClip.coordinates.length > 0) {

        const bufferResult = turf.buffer(polyDataClip, workerInput.distance, {
            units: 'meters'
        });
        const bufferResultGeometry = bufferResult!.geometry;
        VectorTileGeometryUtil.cleanAndSimplify(bufferResultGeometry);
        bufferResult!.geometry = bufferResultGeometry;

        if (!workerInput.options?.skip018) {
            workerInput.multiPolyline018Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline018Dest, bufferResult!);
        }
        if (!workerInput.options?.skip025) {
            workerInput.multiPolyline025Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline025Dest, bufferResult!);
        }
        if (!workerInput.options?.skip035) {
            workerInput.multiPolyline035Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline035Dest, bufferResult!);
        }
        if (!workerInput.options?.skip050) {
            workerInput.multiPolyline050Dest = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline050Dest, bufferResult!);
        }
        if (!workerInput.options?.skipMlt) {

            const polyDataDest = PPGeometry.emptyMultiPolygon();
            workerInput.polyDataDest.coordinates.forEach(polygon => {
                if (polygon.length > 0 && polygon[0].length > 0) { // is there an outer ring having coordinates?
                    polyDataDest.coordinates.push(polygon);
                }
            });
            if (polyDataDest.coordinates.length > 0) {
                const featureC = turf.featureCollection([turf.feature(polyDataDest), bufferResult!]);
                const difference = turf.difference(featureC);
                if (difference) {
                    const differenceGeometry: TUnionPolygon = difference!.geometry; // subtract inner polygons from outer
                    const polygonsD = PPGeometry.destructurePolygons(differenceGeometry);
                    workerInput.polyDataDest = PPGeometry.restructurePolygons(polygonsD);
                }
            }

        }

    }

    const workerOutput: IWorkerClipOutput = {
        multiPolyline018Dest: workerInput.multiPolyline018Dest,
        multiPolyline025Dest: workerInput.multiPolyline025Dest,
        multiPolyline035Dest: workerInput.multiPolyline035Dest,
        multiPolyline050Dest: workerInput.multiPolyline050Dest,
        polyDataDest: workerInput.polyDataDest
    };
    self.postMessage(workerOutput);

}