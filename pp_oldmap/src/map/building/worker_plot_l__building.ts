import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerPlotInput } from '../common/IWorkerPlotInput';
import { Map } from '../Map';
import { Pen } from '../Pen';

self.onmessage = (e) => {

    const workerInput: IWorkerPlotInput = e.data;

    const polygonCount025 = 4;
    const polygonCount050 = 50;
    const polygonDelta025 = Pen.getPenWidthMeters(0.25, Map.SCALE) * -0.40;
    const polygonDelta050 = Pen.getPenWidthMeters(0.50, Map.SCALE) * -0.40;

    // thinner rings for better edge precision
    const distances025: number[] = [];
    for (let i = 0; i < polygonCount025; i++) {
        distances025.push(polygonDelta025);
    }
    console.log(`${workerInput.name}, buffer collect 025 ...`, distances025);
    const features025 = VectorTileGeometryUtil.bufferCollect2(workerInput.polyData, true, ...distances025);

    const distances050: number[] = [polygonDelta050 * 2.00]; // let the first ring be well inside the finer rings
    for (let i = 0; i < polygonCount050; i++) {
        distances050.push(polygonDelta050);
    }
    console.log(`${workerInput.name}, buffer collect 050 ...`, distances050);
    const features050 = VectorTileGeometryUtil.bufferCollect2(workerInput.polyData, false, ...distances050);

    const connected025 = VectorTileGeometryUtil.connectBufferFeatures(features025);
    const multiPolyline025 = VectorTileGeometryUtil.restructurePolylines(connected025);

    const connected050 = VectorTileGeometryUtil.connectBufferFeatures(features050);
    const multiPolyline050 = VectorTileGeometryUtil.restructurePolylines(connected050);

    VectorTileGeometryUtil.cleanAndSimplify(multiPolyline025);
    VectorTileGeometryUtil.cleanAndSimplify(multiPolyline050);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline025,
        multiPolyline050
    };
    self.postMessage(workerOutput);

}