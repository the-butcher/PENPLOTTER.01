import { Polygon } from 'geojson';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import * as turf from '@turf/turf';
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';


self.onmessage = (e) => {

    const workerInput: IWorkerPolyInput<Polygon> = e.data;
    const polygonsT: Polygon[] = workerInput.tileData.map(f => f.geometry);

    const removeHolesSmallerThan = (polygon: Polygon, minArea: number): Polygon => {
        const result: Polygon = {
            type: 'Polygon',
            coordinates: [polygon.coordinates[0]]
        };
        polygon.coordinates.slice(1).forEach(coordinates => {
            if (Math.abs(turf.area({
                type: 'Polygon',
                coordinates: [coordinates]
            })) > minArea) {
                result.coordinates.push(coordinates);
            }
        });
        return result;
    }

    const polygonsF = polygonsT.map(t => removeHolesSmallerThan(t, 500));

    // prebuffering appears not to be faster than directly buffering inout
    // const bucketsByTileId: { [K: string]: Feature<Polygon>[] } = {};
    // workerInput.tileData.forEach(f => {
    //     const tileId = VectorTileKey.toTileId(f.properties! as IVectorTileKey);
    //     if (!bucketsByTileId[tileId]) {
    //         bucketsByTileId[tileId] = [];
    //     }
    //     bucketsByTileId[tileId].push(f);
    // });
    // console.log('bucketsByTileId', bucketsByTileId);

    // const preUnion: Polygon[] = [];
    // const tileIds = Object.keys(bucketsByTileId);
    // tileIds.forEach(tileId => {
    //     console.log(`${workerInput.name}, preunion tileId: ${tileId}, count: ${bucketsByTileId[tileId].length}...`);
    //     const collA = turf.featureCollection(bucketsByTileId[tileId]);
    //     const unionA = turf.union(collA)!;
    //     if (unionA.geometry.type === 'MultiPolygon') {
    //         unionA.geometry.coordinates.forEach(coordinates => {
    //             preUnion.push({
    //                 type: 'Polygon',
    //                 coordinates
    //             });
    //         });
    //     } else if (unionA.geometry.type === 'Polygon') {
    //         preUnion.push(unionA.geometry);
    //     }
    // });


    console.log(`${workerInput.name}, buffer in-out [${workerInput.outin![0]}, ${workerInput.outin![1]}] ...`);
    const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(VectorTileGeometryUtil.restructureMultiPolygon(polygonsF), ...workerInput.outin!);
    let polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA);

    console.log(`${workerInput.name}, clipping ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326);

    const workerOutput: IWorkerPolyOutput = {
        polyData
    };
    self.postMessage(workerOutput);

}