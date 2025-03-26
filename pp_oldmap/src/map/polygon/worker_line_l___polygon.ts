import { Position } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerLineInputPolygon } from "./IWorkerLineInputPolygon";

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputPolygon = e.data;

    let multiPolyline025 = VectorTileGeometryUtil.emptyMultiPolyline();

    const coordinates025: Position[][] = workerInput.polyData.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    multiPolyline025.coordinates.push(...coordinates025);

    console.log(`${workerInput.name}, clipping to bboxMap4326 ...`);
    multiPolyline025 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline025, workerInput.bboxMap4326);

    VectorTileGeometryUtil.cleanAndSimplify(multiPolyline025);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline025
    };
    self.postMessage(workerOutput);

}