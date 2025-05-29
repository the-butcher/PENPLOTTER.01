import { GeoJsonProperties, Polygon, Position } from 'geojson';
import { PPGeometry } from 'pp-geom';
import { IWorkerLineInput } from '../common/IWorkerLineInput';
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';

self.onmessage = (e) => {

    const workerInput: IWorkerLineInput<Polygon, GeoJsonProperties> = e.data;

    let multiPolyline018 = PPGeometry.emptyMultiPolyline();
    let multiPolyline035 = PPGeometry.emptyMultiPolyline();

    /**
     * create the buffered set of polygons that determine the appearance of the water layer
     * the result of this operation is the basis for the layer's polylines
     */
    let distance = -12;
    const distances: number[] = [];
    for (let i = 0; i < 20; i++) {
        distances.push(distance);
        distance *= 1.05;
    }
    // console.log('distances', distances);

    const polygonsB: Polygon[] = PPGeometry.bufferCollect1(workerInput.polyData, false, ...distances);
    let multiPolygonB = PPGeometry.restructurePolygons(polygonsB);

    console.log(`${workerInput.name}, clipping to bboxClp4326 (2) ...`);
    multiPolygonB = PPGeometry.bboxClipMultiPolygon(multiPolygonB, workerInput.bboxClp4326); // with buffered rings

    const coordinates018: Position[][] = multiPolygonB.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    multiPolyline018.coordinates.push(...coordinates018);

    // first ring is 0.3 for a more distinct water line
    const coordinates035: Position[][] = workerInput.polyData.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    multiPolyline035.coordinates.push(...coordinates035);

    console.log(`${workerInput.name}, clipping to bboxMap4326 ...`);
    multiPolyline018 = PPGeometry.bboxClipMultiPolyline(multiPolyline018, workerInput.bboxMap4326);
    multiPolyline035 = PPGeometry.bboxClipMultiPolyline(multiPolyline035, workerInput.bboxMap4326);

    PPGeometry.cleanAndSimplify(multiPolyline018);
    PPGeometry.cleanAndSimplify(multiPolyline035);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline018,
        multiPolyline035
    };
    self.postMessage(workerOutput);

}