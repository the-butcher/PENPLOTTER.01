import * as turf from '@turf/turf';
import { Feature, MultiPolygon, Polygon } from 'geojson';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { VectorTileKey } from '../../vectortile/VectorTileKey';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyOutput';
import { MapLayerBuildings } from './MapLayerBuildings';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<Polygon> = e.data;

    const bucketsByTileId: { [K: string]: Feature<Polygon>[] } = {};
    workerInput.tileData.forEach(f => {
        const tileId = VectorTileKey.toTileId(f.properties! as IVectorTileKey);
        if (!bucketsByTileId[tileId]) {
            bucketsByTileId[tileId] = [];
        }
        bucketsByTileId[tileId].push(f);
    });
    console.log('bucketsByTileId', bucketsByTileId);

    const preUnion: Polygon[] = [];
    const tileIds = Object.keys(bucketsByTileId);
    tileIds.forEach(tileId => {
        console.log(`${workerInput.name}, preunion tileId: ${tileId}, count: ${bucketsByTileId[tileId].length}...`);
        const collA = turf.featureCollection(bucketsByTileId[tileId]);
        if (collA.features.length > 1) {
            const unionA = turf.union(collA)!;
            if (unionA.geometry.type === 'MultiPolygon') {
                unionA.geometry.coordinates.forEach(coordinates => {
                    preUnion.push({
                        type: 'Polygon',
                        coordinates
                    });
                });
            } else if (unionA.geometry.type === 'Polygon') {
                preUnion.push(unionA.geometry);
            }
        } else {
            collA.features.forEach(f => preUnion.push(f.geometry));
        }
    });

    let polyData: MultiPolygon = VectorTileGeometryUtil.restructureMultiPolygon(preUnion);

    turf.simplify(polyData, {
        mutate: true,
        tolerance: 0.000012,
        highQuality: true
    });
    turf.cleanCoords(polyData);

    console.log(`${workerInput.name}, clipping to bboxClp4326 ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326);

    // get outer rings, all holes removed
    let polygons010 = VectorTileGeometryUtil.destructureMultiPolygon(polyData);
    polygons010.forEach(polygonO => {
        polygonO.coordinates = polygonO.coordinates.slice(0, 1);
    });
    let multiPolygonO = VectorTileGeometryUtil.restructureMultiPolygon(polygons010);

    // get inner ring reversed, act like real polygons temporarily
    let polygonsI: Polygon[] = VectorTileGeometryUtil.destructureMultiPolygon(polyData);
    const polygonsIFlat: Polygon[] = [];
    polygonsI.forEach(polygonI => {
        polygonI.coordinates.slice(1).forEach(hole => {
            polygonsIFlat.push({
                type: 'Polygon',
                coordinates: [hole.reverse()]
            });
        })
    });
    polygonsIFlat.forEach(polygonI => {
        turf.rewind(polygonI, {
            mutate: true
        });
    });
    let multiPolygonI = VectorTileGeometryUtil.restructureMultiPolygon(polygonsIFlat);

    console.log(`${workerInput.name}, clipping to bboxClp4326 (1) ...`);
    multiPolygonO = VectorTileGeometryUtil.bboxClipMultiPolygon(multiPolygonO, workerInput.bboxClp4326);
    console.log(`${workerInput.name}, clipping to bboxClp4326 (2) ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326);

    // let the polygons be a litte smaller than original to account for pen width
    const inout0 = 0;
    const polygonInset = -2;

    // outer polygon inset (to account for pen width)
    const inoutO: number[] = [inout0, polygonInset - inout0];
    console.log(`${workerInput.name}, buffer in-out [${inoutO[0]}, ${inoutO[1]}] ...`);
    polygons010 = VectorTileGeometryUtil.bufferOutAndIn(multiPolygonO, ...inoutO);
    multiPolygonO = VectorTileGeometryUtil.restructureMultiPolygon(polygons010);

    const inoutI: number[] = [polygonInset - inout0, inout0];
    console.log(`${workerInput.name}, buffer in-out [${inoutI[0]}, ${inoutI[1]}] ...`);
    polygonsI = VectorTileGeometryUtil.bufferOutAndIn(multiPolygonI, ...inoutI).filter(i => turf.area(i) > MapLayerBuildings.minArea);
    multiPolygonI = VectorTileGeometryUtil.restructureMultiPolygon(polygonsI);

    if (multiPolygonO.coordinates.length > 0 && multiPolygonI.coordinates.length) {

        const featureO = turf.feature(multiPolygonO);
        const featureI = turf.feature(multiPolygonI);
        const featureC = turf.featureCollection([featureO, featureI]);

        console.log(`${workerInput.name}, reapplying holes ...`);
        const difference = turf.difference(featureC)!.geometry; // subtract inner polygons from outer
        const polygonsD = VectorTileGeometryUtil.destructureUnionPolygon(difference);
        polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsD);

    }

    console.log(`${workerInput.name}, clipping to bboxMap4326 ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, workerInput.bboxMap4326);

    // another very small in-out removes artifacts at the bounding box edges
    const inoutA: number[] = [-0.11, 0.1];
    console.log(`${workerInput.name}, buffer in-out [${inoutA[0]}, ${inoutA[1]}] ...`);
    const polygonsA1 = VectorTileGeometryUtil.bufferOutAndIn(polyData, ...inoutA);
    polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA1);

    const workerOutput: IWorkerPolyOutput = {
        polyData
    };
    self.postMessage(workerOutput);

}