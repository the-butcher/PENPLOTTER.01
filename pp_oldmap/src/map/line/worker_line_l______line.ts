import { MultiLineString } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerLineInputLine } from "./IWorkerLineInputLine";

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputLine = e.data;

    let multiPolylineDef: MultiLineString = {
        type: 'MultiLineString',
        coordinates: []
    };

    const polylines = workerInput.tileData.map(f => f.geometry);
    const tileDataMult = VectorTileGeometryUtil.restructureMultiPolyline(polylines);
    multiPolylineDef.coordinates.push(...tileDataMult.coordinates);

    if (workerInput.dashArray[1] > 0) {
        const dashedPolyline = VectorTileGeometryUtil.dashMultiPolyline(multiPolylineDef, workerInput.dashArray);
        multiPolylineDef.coordinates = dashedPolyline.coordinates;
    }

    multiPolylineDef = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolylineDef, workerInput.bboxMap4326);

    const workerOutput: IWorkerLineOutput = {
        multiPolylineDef
    };
    self.postMessage(workerOutput);

}