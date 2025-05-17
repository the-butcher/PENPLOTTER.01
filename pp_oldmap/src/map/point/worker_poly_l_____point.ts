import * as turf from '@turf/turf';
import { Feature, MultiPolygon, Point, Polygon, Position } from 'geojson';
import { GeometryUtil } from '../../util/GeometryUtil';
import { SymbolUtil } from '../../util/SymbolUtil';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { IWorkerPolyInputPoint } from './IWorkerPolyInputPoint';
import { IWorkerPolyOutputPoint } from './IWorkerPolyOutputPoint';
import { ILabelDefPointLabel } from './ILabelDefPointLabel';
import { MapDefs } from '../MapDefs';
import { LabelBuilder } from '../../vectortile/LabelBuilder';
import { noto_serif_regular } from '../../util/NotoSerifRegular';
import { noto_serif_italic } from '../../util/NotoSerifItalic';

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



    const polyText = VectorTileGeometryUtil.emptyMultiPolygon();
    let multiPolyline025 = VectorTileGeometryUtil.emptyMultiPolyline();
    let polyData = VectorTileGeometryUtil.emptyMultiPolygon();

    // @ts-expect-error text type
    const symbolFactory: (coordinate: Position) => Position[][] = SymbolUtil[workerInput.symbolFactory];

    workerInput.tileData.forEach(point => {
        if (VectorTileGeometryUtil.booleanWithin(workerInput.bboxMap4326, point.geometry.coordinates)) {

            const symbolCoordinates = symbolFactory(point.geometry.coordinates);
            if (symbolCoordinates.length > 0) {
                multiPolyline025.coordinates.push(...symbolCoordinates);
            }

            const name: string = point.properties!.name;
            if (name) {

                let labelDef: ILabelDefPointLabel = {
                    tileName: name,
                    plotName: name,
                    distance: 12.00,
                    vertical: -12.00,
                    charsign: 1.02,
                    txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION
                };
                for (let i = 0; i < workerInput.labelDefs.length; i++) {
                    if (workerInput.labelDefs[i].plotName === name) {
                        labelDef = workerInput.labelDefs[i];
                        break;
                    }
                }

                const labelBuilder = labelDef.fonttype === 'regular' ? new LabelBuilder(noto_serif_regular) : new LabelBuilder(noto_serif_italic);

                const labelCoordinate3857A = turf.toMercator(point.geometry.coordinates);
                const scale = labelDef.txtscale;
                const chars = Array.from(name);
                const zeroOffset: Position = [0, 0];
                let charOffset: Position = [labelDef.distance, labelDef.vertical];
                for (let i = 0; i < chars.length; i++) {

                    let charCoordinates = labelBuilder.getMultiPolygonChar(chars[i], scale, charOffset).coordinates;
                    charOffset = labelBuilder.getCharOffset(chars[i], scale, zeroOffset, charOffset);
                    charOffset[0] = charOffset[0] * labelDef.charsign;

                    const angle = 0; //Math.atan2(labelCoordinate3857B[1] - labelCoordinate3857A[1], labelCoordinate3857B[0] - labelCoordinate3857A[0]);
                    const matrixA = GeometryUtil.matrixRotationInstance(-angle);
                    const matrixB = GeometryUtil.matrixTranslationInstance(labelDef.distance, labelDef.vertical);
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

    const bufferDist = 6;

    // buffer around symbols
    let bufferPolygons: Polygon[] = [];
    if (multiPolyline025.coordinates.length > 0) {
        const linebuffer018 = turf.buffer(multiPolyline025, bufferDist, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        bufferPolygons.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer018.geometry));
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

    multiPolyline025 = VectorTileGeometryUtil.bboxClipMultiPolyline(multiPolyline025, workerInput.bboxMap4326);
    turf.cleanCoords(multiPolyline025, {
        mutate: true
    });

    const workerOutput: IWorkerPolyOutputPoint = {
        polyData,
        polyText,
        multiPolyline025
    };
    self.postMessage(workerOutput);

}