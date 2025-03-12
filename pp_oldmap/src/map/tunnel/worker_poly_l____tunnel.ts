import * as turf from '@turf/turf';
import { Feature, LineString, MultiPolygon, Polygon } from 'geojson';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutputTunnel } from './IWorkerPolyOutputTunnel';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<LineString> = e.data;

    let multiPolyline04 = VectorTileGeometryUtil.restructureMultiPolyline(workerInput.tileData.map(f => f.geometry));
    let polyData: MultiPolygon = {
        type: 'MultiPolygon',
        coordinates: []
    };

    if (multiPolyline04.coordinates.length > 0) {
        const linebuffer04 = turf.buffer(multiPolyline04, 2, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        const polygons04 = VectorTileGeometryUtil.destructureUnionPolygon(linebuffer04.geometry);
        polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygons04);
    }

    console.log(`${workerInput.name}, clipping to bboxClp4326 ...`);
    multiPolyline04 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline04, workerInput.bboxClp4326);

    const workerOutput: IWorkerPolyOutputTunnel = {
        polyData,
        multiPolyline04,
    };
    self.postMessage(workerOutput);

}