import { GeoJsonProperties, Polygon } from 'geojson';
import { PPGeometry } from 'pp-geom';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyOutput';
import { danube___all } from '../Rivers';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<Polygon, GeoJsonProperties> = e.data;

    const polygonsT: Polygon[] = workerInput.tileData.map(f => f.geometry);

    console.log(`${workerInput.name}, stat polygons, danube___old ...`);
    polygonsT.push(...PPGeometry.destructurePolygons(danube___all));

    console.log(`${workerInput.name}, buffer in-out [${workerInput.outin![0]}, ${workerInput.outin![1]}] ...`);
    const polygonsA: Polygon[] = PPGeometry.bufferOutAndIn(PPGeometry.restructurePolygons(polygonsT), ...workerInput.outin!);
    let polyData = PPGeometry.restructurePolygons(polygonsA);

    console.log(`${workerInput.name}, clipping to bboxClp4326 (1) ...`);
    polyData = PPGeometry.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326); // outer ring only, for potential future clipping operations

    // another very small in-out removes artifacts at the bounding box edges
    const inoutA: number[] = [-0.11, 0.11];
    console.log(`${workerInput.name}, buffer in-out [${inoutA[0]}, ${inoutA[1]}] ...`);
    const polygonsA1 = PPGeometry.bufferOutAndIn(polyData, ...inoutA);
    polyData = PPGeometry.restructurePolygons(polygonsA1);

    // must simplify before smoothing, or densified coordinates may be in the way
    PPGeometry.cleanAndSimplify(polyData);
    polyData = PPGeometry.smoothPolygons(polyData, 5);



    const workerOutput: IWorkerPolyOutput = {
        polyData
    };
    self.postMessage(workerOutput);

}