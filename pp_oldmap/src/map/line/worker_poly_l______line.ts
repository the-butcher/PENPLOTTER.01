import * as turf from '@turf/turf';
import { Feature, GeoJsonProperties, LineString, MultiPolygon, Polygon } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { PPGeometry } from 'pp-geom';

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

    VectorTileGeometryUtil.cleanAndSimplify(polyData);

    const workerOutput: IWorkerPolyOutput = {
        polyData
    };
    self.postMessage(workerOutput);

}