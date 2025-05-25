import * as turf from "@turf/turf";
import { LineString, Position } from "geojson";
import { PPGeometry, PPTransformation } from "pp-geom";
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { Map } from "../Map";
import { Pen } from "../Pen";
import { IWorkerPlotInput } from "./IWorkerPlotInput";

/**
 * @deprecated
 * @param e
 */
self.onmessage = (e) => {

    const workerInput: IWorkerPlotInput = e.data;

    const multiPolyline018 = PPGeometry.emptyMultiPolyline();

    const polyText = workerInput.polyText;
    polyText.forEach(p => {

        // console.log('p', p.properties.type)
        if (p.properties.type === 'none') {

            const coordinates018: Position[][] = p.geometry.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
            multiPolyline018.coordinates.push(...coordinates018);

        } else if (p.properties.type === 'buff') {

            const polygonCount018 = 20;
            const polygonDelta018 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.60;

            // TODO :: remove code duplication
            const distances018: number[] = [];
            for (let i = 0; i < polygonCount018; i++) {
                distances018.push(polygonDelta018);
            }

            // console.log(`${workerInput.name}, buffer collect 018 ...`, distances018);
            const features018 = PPGeometry.bufferCollect2(p.geometry, true, ...distances018);

            const connected018A = PPGeometry.connectBufferFeatures(features018);
            const connected018B = PPGeometry.restructurePolylines(connected018A);
            multiPolyline018.coordinates.push(...connected018B.coordinates);

        } else if (p.properties.type === 'hatch') {

            // outlines
            const coordinates018: Position[][] = p.geometry.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
            multiPolyline018.coordinates.push(...coordinates018);

            const lineResolution = p.properties.space;
            const linepad = lineResolution * 2;

            let contourBBox = turf.bbox(p.geometry);
            const dimX = contourBBox[2] - contourBBox[0];
            const dimY = contourBBox[3] - contourBBox[1];

            const radAngle = p.properties.angle * PPGeometry.GRAD_TO_RAD;

            const rotMatrixP = PPTransformation.matrixRotationInstance(-radAngle);
            const trnMatrixP = PPTransformation.matrixTranslationInstance(dimX / 2, dimY / 2);
            const trnMatrixI = PPTransformation.matrixInvert(trnMatrixP);
            const cntMatrixP = PPTransformation.matrixMultiply(trnMatrixP, rotMatrixP, trnMatrixI);
            const cntMatrixI = PPTransformation.matrixInvert(cntMatrixP);

            const contourLineRotated = PPTransformation.transformMultiPolygon(p.geometry, cntMatrixP);
            contourBBox = turf.bbox(contourLineRotated);

            let intersectPointA: Position;
            let intersectPointB: Position;

            const minY = contourBBox[1] - contourBBox[1] % lineResolution - linepad;
            const maxY = contourBBox[3] + linepad;
            for (let y = minY; y <= maxY; y += lineResolution) {

                const line: LineString = {
                    type: 'LineString',
                    coordinates: [
                        [contourBBox[0] - linepad, y],
                        [contourBBox[2] + linepad, y]
                    ]
                };

                const intersects = turf.lineIntersect(contourLineRotated, line, {
                    removeDuplicates: true,
                });
                let positions = intersects.features.map(f => f.geometry.coordinates);
                positions = positions.sort((a, b) => (a[0] - b[0]));
                positions = PPTransformation.transformPosition1(positions, cntMatrixI);

                for (let intersectIndex = 0; intersectIndex < positions.length - 1; intersectIndex += 2) {

                    intersectPointA = positions[intersectIndex];
                    intersectPointB = positions[intersectIndex + 1];

                    multiPolyline018.coordinates.push([
                        intersectPointA,
                        intersectPointB
                    ]);

                }

            }

        }

    });

    const workerOutput: IWorkerLineOutput = {
        multiPolyline018
    };
    self.postMessage(workerOutput);

}