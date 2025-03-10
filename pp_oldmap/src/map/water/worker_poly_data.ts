import * as turf from '@turf/turf';
import { BBox, Polygon } from 'geojson';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';

self.onmessage = (e) => {

    const name: string = e.data.name;
    const tileData: Polygon[] = e.data.tileData;
    const bboxClp4326: BBox = e.data.bboxClp4326;

    const outin: [number, number] = [3, -3];
    console.log(`${name}, buffer in-out [${outin[0]}, ${outin[1]}] ...`);
    const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(VectorTileGeometryUtil.restructureMultiPolygon(tileData), ...outin);
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
    console.log(`${name}, union ...`);
    const unionPolygon = VectorTileGeometryUtil.unionPolygons(polygonsA);
    const polygonsM: Polygon[] = VectorTileGeometryUtil.destructureUnionPolygon(unionPolygon);
    polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsM);

    console.log(`${name}, clipping to bboxClp4326 (1) ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, bboxClp4326); // outer ring only, for potential future clipping operations

    self.postMessage({
        polyData
    });

}