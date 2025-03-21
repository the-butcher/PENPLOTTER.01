import * as turf from '@turf/turf';
import { GeoJsonProperties, Polygon } from 'geojson';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';


self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<Polygon, GeoJsonProperties> = e.data;
    let polygonsT: Polygon[] = workerInput.tileData.map(f => f.geometry);

    const removeHolesSmallerThan = (polygon: Polygon, minArea: number): Polygon => {
        const result: Polygon = {
            type: 'Polygon',
            coordinates: [polygon.coordinates[0]]
        };
        polygon.coordinates.slice(1).forEach(coordinates => {
            const area = turf.area({
                type: 'Polygon',
                coordinates: [coordinates]
            });
            if (area > minArea) {
                result.coordinates.push(coordinates);
            }
        });
        return result;
    }

    polygonsT = polygonsT.map(t => removeHolesSmallerThan(t, 500));

    console.log(`${workerInput.name}, buffer in-out [${workerInput.outin![0]}, ${workerInput.outin![1]}] ...`);
    polygonsT = VectorTileGeometryUtil.bufferOutAndIn(VectorTileGeometryUtil.restructureMultiPolygon(polygonsT), ...workerInput.outin!);

    // there may be new holes after buffering
    polygonsT = polygonsT.map(t => removeHolesSmallerThan(t, 500));

    let polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsT);

    console.log(`${workerInput.name}, clipping ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326);

    // another very small in-out removes artifacts at the bounding box edges
    const inoutA: number[] = [-0.11, 0.11];
    console.log(`${workerInput.name}, buffer in-out [${inoutA[0]}, ${inoutA[1]}] ...`);
    const polygonsA1 = VectorTileGeometryUtil.bufferOutAndIn(polyData, ...inoutA);
    polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA1);

    VectorTileGeometryUtil.cleanAndSimplify(polyData);

    const workerOutput: IWorkerPolyOutput = {
        polyData
    };
    self.postMessage(workerOutput);

}