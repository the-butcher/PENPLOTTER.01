import * as turf from '@turf/turf';
import { Feature, GeoJsonProperties, LineString, MultiPolygon, Polygon } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<LineString, GeoJsonProperties> = e.data;

    let polyData = VectorTileGeometryUtil.emptyMultiPolygon();

    const polylines = workerInput.tileData.map(f => f.geometry);
    if (polylines.length > 0) {
        const tileDataMult = VectorTileGeometryUtil.restructureMultiPolyline(polylines);
        const tileDataBuff = turf.buffer(tileDataMult, 5, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        const polygons = VectorTileGeometryUtil.destructureUnionPolygon(tileDataBuff.geometry);
        polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygons);
    }

    console.log(`${workerInput.name}, clipping to bboxMap4326 ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326);

    const workerOutput: IWorkerPolyOutput = {
        polyData
    };
    self.postMessage(workerOutput);

}