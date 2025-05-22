import { Position } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerLineInputPolygon } from "./IWorkerLineInputPolygon";
import { PPGeometry } from "pp-geom";

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputPolygon = e.data;

    let multiPolyline018 = PPGeometry.emptyMultiPolyline();

    const coordinates018: Position[][] = workerInput.polyData.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    multiPolyline018.coordinates.push(...coordinates018);

    console.log(`${workerInput.name}, clipping to bboxMap4326 ...`);
    multiPolyline018 = PPGeometry.bboxClipMultiPolyline(multiPolyline018, workerInput.bboxMap4326);

    VectorTileGeometryUtil.cleanAndSimplify(multiPolyline018);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline018
    };
    self.postMessage(workerOutput);

}