import * as turf from '@turf/turf';
import { Feature, GeoJsonProperties, LineString, MultiPolygon, Polygon } from 'geojson';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutputTunnel } from './IWorkerPolyOutputTunnel';
import { PPGeometry } from 'pp-geom';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<LineString, GeoJsonProperties> = e.data;

    let multiPolyline04 = PPGeometry.restructurePolylines(workerInput.tileData.map(f => f.geometry));
    let polyData = PPGeometry.emptyMultiPolygon();

    if (multiPolyline04.coordinates.length > 0) {
        const linebuffer04 = turf.buffer(multiPolyline04, 2, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        const polygons04 = PPGeometry.destructurePolygons(linebuffer04.geometry);
        polyData = PPGeometry.restructurePolygons(polygons04);
    }

    console.log(`${workerInput.name}, clipping to bboxClp4326 ...`);
    multiPolyline04 = PPGeometry.bboxClipMultiPolyline(multiPolyline04, workerInput.bboxClp4326);

    VectorTileGeometryUtil.cleanAndSimplify(multiPolyline04);

    const workerOutput: IWorkerPolyOutputTunnel = {
        polyData,
        multiPolyline04,
    };
    self.postMessage(workerOutput);

}