import { Position } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerLineInputPolygon } from "./IWorkerLineInputPolygon";

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputPolygon = e.data;

    let multiPolyline013 = VectorTileGeometryUtil.emptyMultiPolyline();

    const coordinates013: Position[][] = workerInput.polyData.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    multiPolyline013.coordinates.push(...coordinates013);

    console.log(`${workerInput.name}, clipping to bboxMap4326 ...`);
    multiPolyline013 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline013, workerInput.bboxMap4326);

    VectorTileGeometryUtil.cleanAndSimplify(multiPolyline013);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline013
    };
    self.postMessage(workerOutput);

}