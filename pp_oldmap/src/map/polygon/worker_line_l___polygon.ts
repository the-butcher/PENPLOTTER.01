import { MultiLineString, Polygon, Position } from "geojson";
import { IWorkerLineInput } from "../common/IWorkerLineInput";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";

self.onmessage = (e) => {

    const workerInput: IWorkerLineInput<Polygon> = e.data;

    let multiPolyline010: MultiLineString = {
        type: 'MultiLineString',
        coordinates: []
    };

    const coordinates01: Position[][] = workerInput.polyData.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    multiPolyline010.coordinates.push(...coordinates01);

    console.log(`${workerInput.name}, clipping to bboxMap4326 ...`);
    multiPolyline010 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline010, workerInput.bboxMap4326);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline010
    };
    self.postMessage(workerOutput);

}