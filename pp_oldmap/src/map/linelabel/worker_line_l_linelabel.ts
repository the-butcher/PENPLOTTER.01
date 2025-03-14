import { Position } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerLineInputLineLabel } from './IWorkerLineInputLineLabel';

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputLineLabel = e.data;

    const multiPolyline005 = VectorTileGeometryUtil.emptyMultiPolyline();

    const coordinates005: Position[][] = workerInput.polyText.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    multiPolyline005.coordinates.push(...coordinates005);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline005
    };
    self.postMessage(workerOutput);

}