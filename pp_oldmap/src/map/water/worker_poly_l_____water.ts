import { GeoJsonProperties, Polygon } from 'geojson';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';
import { danube___all } from '../Rivers';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<Polygon, GeoJsonProperties> = e.data;

    const polygonsT: Polygon[] = workerInput.tileData.map(f => f.geometry);

    console.log(`${workerInput.name}, stat polygons, danube___old ...`);
    polygonsT.push(...VectorTileGeometryUtil.destructureMultiPolygon(danube___all));

    console.log(`${workerInput.name}, buffer in-out [${workerInput.outin![0]}, ${workerInput.outin![1]}] ...`);
    const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(VectorTileGeometryUtil.restructureMultiPolygon(polygonsT), ...workerInput.outin!);
    let polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA);

    console.log(`${workerInput.name}, clipping to bboxClp4326 (1) ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326); // outer ring only, for potential future clipping operations

    // another very small in-out removes artifacts at the bounding box edges
    const inoutA: number[] = [-0.11, 0.11];
    console.log(`${workerInput.name}, buffer in-out [${inoutA[0]}, ${inoutA[1]}] ...`);
    const polygonsA1 = VectorTileGeometryUtil.bufferOutAndIn(polyData, ...inoutA);
    polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA1);

    VectorTileGeometryUtil.cleanAndSimplify(polyData);

    const workerOutput: IWorkerPolyOutput = {
        polyData
    };
    self.postMessage(workerOutput);

}