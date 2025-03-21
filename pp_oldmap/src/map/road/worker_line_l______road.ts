import * as turf from '@turf/turf';
import { MultiLineString, Position } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerLineInputRoad } from "./IWorkerLineInputRoad";

self.onmessage = (e) => {

    const workerInput: IWorkerLineInputRoad = e.data;

    let multiPolyline010 = VectorTileGeometryUtil.emptyMultiPolyline();
    let multiPolyline030 = VectorTileGeometryUtil.emptyMultiPolyline();

    const multiPolygon02 = VectorTileGeometryUtil.restructureMultiPolygon(workerInput.polygons02); // highways
    const multiPolygon34 = VectorTileGeometryUtil.restructureMultiPolygon(workerInput.polygons34); // bigger roads
    const multiPolygon56 = VectorTileGeometryUtil.restructureMultiPolygon(workerInput.polygons56); // smaller roads

    const coordinates02: Position[][] = multiPolygon02.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    const multiOutline02: MultiLineString = {
        type: 'MultiLineString',
        coordinates: coordinates02
    };

    const coordinates34: Position[][] = multiPolygon34.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    let multiOutline34: MultiLineString = {
        type: 'MultiLineString',
        coordinates: coordinates34
    };

    const coordinates56: Position[][] = multiPolygon56.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
    let multiOutline56: MultiLineString = {
        type: 'MultiLineString',
        coordinates: coordinates56
    };

    // clip smaller streets away from bigger streets
    multiOutline34 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline34, turf.feature(multiPolygon56));

    // clip bigger streets away from smaller streets
    multiOutline56 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline56, turf.feature(multiPolygon34));

    // clip bigger and smaller streets away from smallest streets
    const union36 = VectorTileGeometryUtil.unionPolygons([...workerInput.polygons34, ...workerInput.polygons56]);
    workerInput.multiPolyline78 = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline78, turf.feature(union36));

    // clip away highways from all streets
    multiOutline34 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline34, turf.feature(multiPolygon02));
    multiOutline56 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline56, turf.feature(multiPolygon02));
    workerInput.multiPolyline78 = VectorTileGeometryUtil.clipMultiPolyline(workerInput.multiPolyline78, turf.feature(multiPolygon02));

    multiPolyline010.coordinates.push(...multiOutline34.coordinates);
    multiPolyline010.coordinates.push(...multiOutline56.coordinates);
    multiPolyline030.coordinates.push(...workerInput.multiPolyline78.coordinates);
    multiPolyline030.coordinates.push(...multiOutline02.coordinates);

    console.log(`${workerInput.name}, clipping to bboxMap4326 ...`);
    multiPolyline010 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline010, workerInput.bboxMap4326);
    multiPolyline030 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline030, workerInput.bboxMap4326);

    VectorTileGeometryUtil.cleanAndSimplify(multiPolyline010);
    VectorTileGeometryUtil.cleanAndSimplify(multiPolyline030);

    const workerOutput: IWorkerLineOutput = {
        multiPolyline010,
        multiPolyline030
    };
    self.postMessage(workerOutput);

}