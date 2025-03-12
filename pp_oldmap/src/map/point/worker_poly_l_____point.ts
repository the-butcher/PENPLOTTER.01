import * as turf from '@turf/turf';
import { Feature, MultiLineString, MultiPolygon, Point, Polygon, Position } from 'geojson';
import { GeometryUtil } from '../../util/GeometryUtil';
import { SymbolUtil } from '../../util/SymbolUtil';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerPolyInputPoint } from './IWorkerPolyInputPoint';
import { IWorkerPolyOutputPoint } from './IWorkerPolyOutputPoint';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInputPoint = e.data;

    // remove duplicates
    workerInput.tileData.sort((a, b) => (a.geometry.coordinates[0] - b.geometry.coordinates[0]) * 10000 + a.geometry.coordinates[1] - b.geometry.coordinates[1]);
    let refPosition: Position = [-1, -1];
    const _tileData: Feature<Point>[] = [];
    for (let i = 0; i < workerInput.tileData.length; i++) {
        if (turf.distance(refPosition, workerInput.tileData[i].geometry.coordinates, {
            units: 'meters'
        }) > 1) {
            _tileData.push(workerInput.tileData[i]);
            refPosition = workerInput.tileData[i].geometry.coordinates;
        }
    }
    workerInput.tileData = _tileData;

    const polyText: MultiPolygon = {
        type: 'MultiPolygon',
        coordinates: []
    };
    let multiPolyline005: MultiLineString = {
        type: 'MultiLineString',
        coordinates: []
    };
    let polyData: MultiPolygon = {
        type: 'MultiPolygon',
        coordinates: []
    };

    // @ts-expect-error text type
    const symbolFactory = SymbolUtil[workerInput.symbolFactory];

    workerInput.tileData.forEach(point => {
        if (VectorTileGeometryUtil.booleanWithin(workerInput.bboxMap4326, point.geometry.coordinates)) {

            multiPolyline005.coordinates.push(symbolFactory(point.geometry.coordinates));

            const name: string = point.properties!.name;
            if (name) {

                const labelCoordinate3857A = turf.toMercator(point.geometry.coordinates);
                const scale = 0.03;
                const chars = Array.from(name);
                const zeroOffset: Position = [0, 0];
                let charOffset: Position = [0, 0];
                for (let i = 0; i < chars.length; i++) {

                    let charCoordinates = VectorTileGeometryUtil.getMultiPolygonChar(chars[i], scale, charOffset).coordinates;
                    charOffset = VectorTileGeometryUtil.getCharOffset(chars[i], scale, zeroOffset, charOffset);

                    const angle = 0; //Math.atan2(labelCoordinate3857B[1] - labelCoordinate3857A[1], labelCoordinate3857B[0] - labelCoordinate3857A[0]);
                    const matrixA = GeometryUtil.matrixRotationInstance(-angle);
                    const matrixB = GeometryUtil.matrixTranslationInstance(12, -12);
                    charCoordinates = GeometryUtil.transformPosition3(charCoordinates, GeometryUtil.matrixMultiply(matrixA, matrixB));

                    let position4326: Position;
                    charCoordinates.forEach(polygon => {
                        polygon.forEach(ring => {
                            ring.forEach(position => {
                                const position3857 = [
                                    labelCoordinate3857A[0] + position[0],
                                    labelCoordinate3857A[1] - position[1]
                                ];
                                position4326 = turf.toWgs84([
                                    position3857[0],
                                    position3857[1]
                                ]);
                                position[0] = position4326[0];
                                position[1] = position4326[1];
                            })
                        });
                    });

                    polyText.coordinates.push(...charCoordinates);

                }

            }

        }

    });

    const bufferDist = 8;
    // buffer around symbols
    let bufferPolygons: Polygon[] = [];
    if (multiPolyline005.coordinates.length > 0) {
        const linebuffer005 = turf.buffer(multiPolyline005, bufferDist, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        bufferPolygons.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer005.geometry));
    }

    // buffer around text polygons
    if (polyText.coordinates.length > 0) {
        const polyTextBuffer = turf.buffer(polyText, bufferDist, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        bufferPolygons.push(...VectorTileGeometryUtil.destructureUnionPolygon(polyTextBuffer.geometry));
    }

    if (bufferPolygons.length > 0) {
        const bufferUnion = VectorTileGeometryUtil.unionPolygons(bufferPolygons);
        bufferPolygons = VectorTileGeometryUtil.destructureUnionPolygon(bufferUnion);
        polyData = VectorTileGeometryUtil.restructureMultiPolygon(bufferPolygons);
    }

    multiPolyline005 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline005, workerInput.bboxMap4326);
    turf.cleanCoords(multiPolyline005, {
        mutate: true
    });

    const workerOutput: IWorkerPolyOutputPoint = {
        polyData,
        polyText,
        multiPolyline005
    };
    self.postMessage(workerOutput);

}