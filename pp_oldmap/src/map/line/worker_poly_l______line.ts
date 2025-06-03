import * as turf from '@turf/turf';
import { Feature, GeoJsonProperties, LineString, MultiPolygon, Polygon } from "geojson";
import { PPGeometry } from 'pp-geom';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyOutput';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<LineString, GeoJsonProperties> = e.data;

    let polyData = PPGeometry.emptyMultiPolygon();

    const polylines = workerInput.tileData.map(f => f.geometry);
    if (polylines.length > 0) {
        const tileDataMult = PPGeometry.restructurePolylines(polylines);
        const tileDataBuff = turf.buffer(tileDataMult, 5, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        const polygons = PPGeometry.destructurePolygons(tileDataBuff.geometry);
        polyData = PPGeometry.restructurePolygons(polygons);
    }

    console.log(`${workerInput.name}, clipping to bboxMap4326 ...`);
    polyData = PPGeometry.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326);

    PPGeometry.cleanAndSimplify(polyData);

    const workerOutput: IWorkerPolyOutput = {
        polyData
    };
    self.postMessage(workerOutput);

}