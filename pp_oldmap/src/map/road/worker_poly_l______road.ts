import * as turf from '@turf/turf';
import { Feature, LineString, MultiLineString, MultiPolygon, Polygon } from 'geojson';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { Map } from '../Map';
import { IWorkerPolyOutputRoad } from './IWorkerPolyOutputRoad';
import { IRoadProperties } from './IRoadProperties';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<LineString, IRoadProperties> = e.data;

    const filterBySymbolValue = (features: Feature<LineString, IRoadProperties>[], ...symbols: number[]): MultiLineString => {
        const result = VectorTileGeometryUtil.emptyMultiPolyline();
        features.forEach(feature => {
            const symbol = feature.properties.symbol;
            if (symbols.some(s => symbol === s)) {
                result.coordinates.push(feature.geometry.coordinates);
            }
        });
        return result;
    }

    let multiPolyline02 = filterBySymbolValue(workerInput.tileData, Map.SYMBOL_INDEX___HIGHWAY, Map.SYMBOL_INDEX______RAMP, Map.SYMBOL_INDEX__SPEEDWAY);
    let multiPolyline34 = filterBySymbolValue(workerInput.tileData, Map.SYMBOL_INDEX_____MAJOR, Map.SYMBOL_INDEX_COMMUNITY);
    let multiPolyline56 = filterBySymbolValue(workerInput.tileData, Map.SYMBOL_INDEX_____OTHER);
    let multiPolyline78 = filterBySymbolValue(workerInput.tileData, Map.SYMBOL_INDEX_____MINOR, Map.SYMBOL_INDEX__PEDEST_A, Map.SYMBOL_INDEX__PEDEST_B);

    console.log(`${workerInput.name}, clipping to bboxClp4326 ...`);
    multiPolyline02 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline02, workerInput.bboxClp4326);
    multiPolyline34 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline34, workerInput.bboxClp4326);
    multiPolyline56 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline56, workerInput.bboxClp4326);
    multiPolyline78 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline78, workerInput.bboxClp4326);

    const polygons02: Polygon[] = [];
    const polygons34: Polygon[] = [];
    const polygons56: Polygon[] = [];
    const polygons78: Polygon[] = [];

    // highways - do not join with general streets
    if (multiPolyline02.coordinates.length > 0) {
        const linebuffer02 = turf.buffer(multiPolyline02, 6, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        polygons02.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer02.geometry));
    }

    // larger streets
    if (multiPolyline34.coordinates.length > 0) {
        const linebuffer34 = turf.buffer(multiPolyline34, 5, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        polygons34.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer34.geometry));
    }

    // smaller streets
    if (multiPolyline56.coordinates.length > 0) {
        const linebuffer56 = turf.buffer(multiPolyline56, 4, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        polygons56.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer56.geometry));
    }

    // smallest streets
    if (multiPolyline78.coordinates.length > 0) {
        const linebuffer78 = turf.buffer(multiPolyline78, 2, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        polygons78.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer78.geometry));
    }

    // rebuild multipolygon for clipping operations agains other layers
    const union08 = VectorTileGeometryUtil.unionPolygons([...polygons02, ...polygons34, ...polygons56, ...polygons78]); // ...polygons02, ...polygons34, ...polygons56, ...polygons78
    const polygons08 = VectorTileGeometryUtil.destructureUnionPolygon(union08);
    let polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygons08);

    console.log(`${workerInput.name}, buffer in-out [${workerInput.outin![0]}, ${workerInput.outin![1]}] ...`);
    const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(polyData, ...workerInput.outin!);
    polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA);

    VectorTileGeometryUtil.cleanAndSimplify(polyData);

    const workerOutput: IWorkerPolyOutputRoad = {
        polyData,
        multiPolyline02,
        multiPolyline34,
        multiPolyline56,
        multiPolyline78,
        polygons02,
        polygons34,
        polygons56,
        polygons78
    };
    self.postMessage(workerOutput);

}