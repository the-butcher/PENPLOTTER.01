import { Position } from "geojson";
import { PPGeometry } from "pp-geom";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerLineInputLineLabel } from './IWorkerLineInputLineLabel';

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputLineLabel = e.data;

    const multiPolyline018 = PPGeometry.emptyMultiPolyline();

    const coordinates018: Position[][] = workerInput.polyText.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    multiPolyline018.coordinates.push(...coordinates018);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline018
    };
    self.postMessage(workerOutput);

}