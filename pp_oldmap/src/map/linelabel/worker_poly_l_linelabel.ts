import * as turf from '@turf/turf';
import { Feature, MultiPolygon, Polygon, Position } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { ILabelDef } from "../ILabelDef";
import { ILabelDefLineLabel, IWorkerPolyInputLineLabel } from "./IWorkerPolyInputLineLabel";
import { IWorkerPolyOutputLineLabel } from './IWorkerPolyOutputLineLabel';

// @ts-expect-error no index file
import * as JSONfn from 'json-fn';

self.onmessage = (e) => {

    const workerInput: IWorkerPolyInputLineLabel = e.data;

    const lineNames = new Set(workerInput.tileData.map(f => f.properties!.name));
    console.log('lineNames', lineNames);

    let polyText: MultiPolygon = {
        type: 'MultiPolygon',
        coordinates: []
    };

    const labelDefs: ILabelDef[] = workerInput.labelDefs.map(d => {
        const labelDefOmit: Omit<ILabelDefLineLabel, 'idxvalid'> = {
            ...d
        };
        return {
            ...labelDefOmit,
            idxvalid: JSONfn.parse(d.idxvalid)
        }
    });
    console.log('labelDefs', labelDefs);


    lineNames.forEach(lineName => {

        const namedLines = workerInput.tileData.filter(f => f.properties!.name === lineName).map(f => f.geometry);
        const connectedLinesA = VectorTileGeometryUtil.restructureMultiPolyline(namedLines);
        const connectedLinesB = VectorTileGeometryUtil.connectMultiPolyline(connectedLinesA, 5);
        const connectedLinesC = VectorTileGeometryUtil.destructureMultiPolyline(connectedLinesB);

        if (connectedLinesC.length > 0) {

            for (let a = 0; a < connectedLinesC.length; a++) {

                let labelDef: ILabelDef = {
                    tileName: lineName,
                    plotName: lineName,
                    distance: 0.50,
                    vertical: 12,
                    charsign: 0,
                    txtscale: 0.022,
                    idxvalid: () => true
                };
                for (let i = 0; i < labelDefs.length; i++) {
                    if (labelDefs[i].plotName === lineName) {
                        labelDef = labelDefs[i];
                        break;
                    }
                }

                if (!labelDef.idxvalid(a)) {
                    continue;
                }

                const labelLine = connectedLinesC[a]; // turf.bboxClip(connectedLinesB[a], bboxMap4326).geometry as LineString;
                console.log('labelLine', labelLine);
                turf.cleanCoords(labelLine, {
                    mutate: true
                });
                const labelLineLength = turf.length(turf.feature(labelLine), {
                    units: 'meters'
                });
                if (labelLineLength === 0) {
                    continue; // next
                }

                let labelLinePositionA = labelLineLength * labelDef.distance;
                let labelCoordinate4326A = turf.along(labelLine, labelLinePositionA, {
                    units: 'meters'
                }).geometry.coordinates;
                let labelCoordinate3857A = turf.toMercator(labelCoordinate4326A);

                const scale = labelDef.txtscale;
                const chars = Array.from(labelDef.plotName);
                const zeroOffset: Position = [0, 0];
                for (let i = 0; i < chars.length; i++) {

                    let charCoordinates = VectorTileGeometryUtil.getMultiPolygonChar(chars[i], scale, zeroOffset).coordinates;
                    const charOffset = VectorTileGeometryUtil.getCharOffset(chars[i], scale, zeroOffset, zeroOffset);

                    if (labelDef.charsign === 0) { // auto
                        const labelLinePositionT = labelLinePositionA + charOffset[0];
                        const labelCoordinate4326T = turf.along(labelLine, labelLinePositionT, {
                            units: 'meters'
                        }).geometry.coordinates;
                        const labelCoordinate3857T = turf.toMercator(labelCoordinate4326T);
                        const angleT = Math.atan2(labelCoordinate3857T[1] - labelCoordinate3857A[1], labelCoordinate3857T[0] - labelCoordinate3857A[0]);
                        console.log(labelDef.plotName, angleT * 180 / Math.PI)
                        if (Math.abs(angleT) > Math.PI / 2) {
                            labelDef.charsign = -1;
                        } else {
                            labelDef.charsign = 1;
                        }
                    }

                    const labelLinePositionB = labelLinePositionA + charOffset[0] * labelDef.charsign;
                    if (labelLinePositionB < 0 || labelLinePositionB > labelLineLength) {
                        break;
                    }
                    const labelCoordinate4326B = turf.along(labelLine, labelLinePositionB, {
                        units: 'meters'
                    }).geometry.coordinates;
                    const labelCoordinate3857B = turf.toMercator(labelCoordinate4326B);

                    const angle = Math.atan2(labelCoordinate3857B[1] - labelCoordinate3857A[1], labelCoordinate3857B[0] - labelCoordinate3857A[0]);
                    const matrixA = VectorTileGeometryUtil.matrixRotationInstance(-angle);
                    const matrixB = VectorTileGeometryUtil.matrixTranslationInstance(0, labelDef.vertical);
                    charCoordinates = VectorTileGeometryUtil.transformPosition3(charCoordinates, VectorTileGeometryUtil.matrixMultiply(matrixA, matrixB));

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

                    labelLinePositionA = labelLinePositionB;
                    labelCoordinate4326A = labelCoordinate4326B;
                    labelCoordinate3857A = labelCoordinate3857B;

                    polyText.coordinates.push(...charCoordinates);

                }

            }

        }

    });

    const polyTextBufferPolygons: Polygon[] = [];
    if (polyText.coordinates.length > 0) {
        const polyTextBuffer = turf.buffer(polyText, 8, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        polyTextBufferPolygons.push(...VectorTileGeometryUtil.destructureUnionPolygon(polyTextBuffer.geometry));
    }

    let polyData = VectorTileGeometryUtil.restructureMultiPolygon(polyTextBufferPolygons);

    console.log(`${workerInput.name}, clipping ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326);
    polyText = VectorTileGeometryUtil.bboxClipMultiPolygon(polyText, workerInput.bboxMap4326);

    const workerOutput: IWorkerPolyOutputLineLabel = {
        polyData,
        polyText
    };
    self.postMessage(workerOutput);

    // const polygonsT: Polygon[] = workerInput.tileData.map(f => f.geometry);

    // console.log(`${workerInput.name}, buffer in-out [${workerInput.outin![0]}, ${workerInput.outin![1]}] ...`);
    // const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(VectorTileGeometryUtil.restructureMultiPolygon(polygonsT), ...workerInput.outin!);
    // let polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA);

    // console.log(`${workerInput.name}, clipping ...`);
    // polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326);

    // const workerOutput: IWorkerPolyOutput = {
    //     polyData
    // };
    // self.postMessage(workerOutput);

}