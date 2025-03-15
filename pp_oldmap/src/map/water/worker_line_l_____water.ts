import { Polygon, Position } from 'geojson';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerLineInput } from '../common/IWorkerLineInput';
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';

self.onmessage = (e) => {

    const workerInput: IWorkerLineInput<Polygon> = e.data;

    let multiPolyline005 = VectorTileGeometryUtil.emptyMultiPolyline();
    let multiPolyline010 = VectorTileGeometryUtil.emptyMultiPolyline();

    /**
     * create the buffered set of polygons that determine the appearance of the water layer
     * the result of this operation is the basis for the layer's polylines
     */
    let distance = -5;
    const distances: number[] = [];
    for (let i = 0; i < 20; i++) {
        distances.push(distance);
        distance *= 1.25;
    }
    const polygonsB: Polygon[] = VectorTileGeometryUtil.bufferCollect(workerInput.polyData, false, ...distances);
    let multiPolygonB = VectorTileGeometryUtil.restructureMultiPolygon(polygonsB);

    console.log(`${workerInput.name}, clipping to bboxClp4326 (2) ...`);
    multiPolygonB = VectorTileGeometryUtil.bboxClipMultiPolygon(multiPolygonB, workerInput.bboxClp4326); // with buffered rings

    const coordinates005: Position[][] = multiPolygonB.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    multiPolyline005.coordinates.push(...coordinates005);

    // first ring is 0.3 for a more distinct water line
    const coordinates010: Position[][] = workerInput.polyData.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    multiPolyline010.coordinates.push(...coordinates010);

    console.log(`${workerInput.name}, clipping to bboxMap4326 ...`);
    multiPolyline005 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline005, workerInput.bboxMap4326);
    multiPolyline010 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline010, workerInput.bboxMap4326);

    VectorTileGeometryUtil.cleanAndSimplify(multiPolyline005);
    VectorTileGeometryUtil.cleanAndSimplify(multiPolyline010);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline005,
        multiPolyline010
    };
    self.postMessage(workerOutput);

}