import { PPGeometry } from 'pp-geom';
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { Map } from '../Map';
import { Pen } from '../Pen';
import { IWorkerPlotInput } from '../plot/IWorkerPlotInput';

self.onmessage = (e) => {

    const workerInput: IWorkerPlotInput = e.data;

    const polygonCount018 = 4;
    const polygonCount035 = 50;
    const polygonDelta018 = Pen.getPenWidthMeters(0.18, Map.SCALE) * -0.60;
    const polygonDelta035 = Pen.getPenWidthMeters(0.35, Map.SCALE) * -0.60;

    // thinner rings for better edge precision
    const distances018: number[] = [];
    for (let i = 0; i < polygonCount018; i++) {
        distances018.push(polygonDelta018);
    }
    console.log(`${workerInput.name}, buffer collect 018 ...`, distances018);
    const features018 = PPGeometry.bufferCollect2(workerInput.polyData, true, ...distances018);

    const distances035: number[] = [(polygonCount018 + 1) * polygonDelta018]; // let the first ring be well inside the finer rings
    for (let i = 0; i < polygonCount035; i++) {
        distances035.push(polygonDelta035);
    }
    console.log(`${workerInput.name}, buffer collect 035 ...`, distances035);
    const features035 = PPGeometry.bufferCollect2(workerInput.polyData, false, ...distances035);

    const connected018 = PPGeometry.connectBufferFeatures(features018);
    const multiPolyline018 = PPGeometry.restructurePolylines(connected018);

    const connected035 = PPGeometry.connectBufferFeatures(features035);
    const multiPolyline035 = PPGeometry.restructurePolylines(connected035);

    PPGeometry.cleanAndSimplify(multiPolyline018);
    PPGeometry.cleanAndSimplify(multiPolyline035);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline018,
        multiPolyline035
    };
    self.postMessage(workerOutput);

}