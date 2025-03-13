import * as turf from '@turf/turf';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerPlotInput } from '../common/IWorkerPlotInput';
import { Map } from '../Map';
import { Pen } from '../Pen';

self.onmessage = (e) => {

    const workerInput: IWorkerPlotInput = e.data;

    const polygonCount010 = 3;
    const polygonCount030 = 50;
    const polygonDelta010 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.60;
    const polygonDelta030 = Pen.getPenWidthMeters(0.20, Map.SCALE) * -0.60;

    // thinner rings for better edge precision
    const distances010: number[] = [];
    for (let i = 0; i < polygonCount010; i++) {
        distances010.push(polygonDelta010);
    }
    console.log(`${workerInput.name}, buffer collect 010 ...`, distances010);
    const features010 = VectorTileGeometryUtil.bufferCollect2(workerInput.polyData, true, ...distances010);

    const distances030: number[] = [polygonDelta030 * 2.00]; // let the first ring be well inside the finer rings
    for (let i = 0; i < polygonCount030; i++) {
        distances030.push(polygonDelta030);
    }
    console.log(`${workerInput.name}, buffer collect 030 ...`, distances030);
    const features030 = VectorTileGeometryUtil.bufferCollect2(workerInput.polyData, false, ...distances030);

    const connected010 = VectorTileGeometryUtil.connectBufferFeatures(features010);
    const multiPolyline010 = VectorTileGeometryUtil.restructureMultiPolyline(connected010);

    const connected030 = VectorTileGeometryUtil.connectBufferFeatures(features030);
    const multiPolyline030 = VectorTileGeometryUtil.restructureMultiPolyline(connected030);

    turf.cleanCoords(multiPolyline010, {
        mutate: true
    });
    turf.cleanCoords(multiPolyline030, {
        mutate: true
    });

    const workerOutput: IWorkerLineOutput = {
        multiPolyline010,
        multiPolyline030
    };
    self.postMessage(workerOutput);

}