import * as turf from '@turf/turf';
import { Polygon } from 'geojson';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<Polygon> = e.data;
    const polygonsT: Polygon[] = workerInput.tileData.map(f => f.geometry);

    console.log(`${workerInput.name}, buffer in-out [${workerInput.outin![0]}, ${workerInput.outin![1]}] ...`);
    const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(VectorTileGeometryUtil.restructureMultiPolygon(polygonsT), ...workerInput.outin!);
    let polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA);
    turf.cleanCoords(polyData);

    // console.log(`${this.name}, fill polygons, danube_canal ...`);
    // polygonsA.push(...this.findFillPolygons(danube_canal));
    // console.log(`${this.name}, fill polygons, danube_inlet ...`);
    // polygonsA.push(...this.findFillPolygons(danube_inlet));
    // console.log(`${this.name}, fill polygons, danube__main ...`);
    // polygonsA.push(...this.findFillPolygons(danube__main));
    // console.log(`${name}, fill polygons, wien____main ...`);
    // polygonsA.push(...this.findFillPolygons(wien____main));

    // console.log(`${this.name}, stat polygons, danube___old ...`);
    // polygonsA.push(danube___old);
    // console.log(`${this.name}, stat polygons, danube___new ...`);
    // polygonsA.push(danube___new);

    /**
     * union of original data, fill-polygons and additional polygons
     */
    console.log(`${workerInput.name}, union ...`);
    const unionPolygon = VectorTileGeometryUtil.unionPolygons(polygonsA);
    const polygonsM: Polygon[] = VectorTileGeometryUtil.destructureUnionPolygon(unionPolygon);
    polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsM);

    console.log(`${workerInput.name}, clipping to bboxClp4326 (1) ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326); // outer ring only, for potential future clipping operations

    const workerOutput: IWorkerPolyOutput = {
        polyData
    };
    self.postMessage(workerOutput);

}