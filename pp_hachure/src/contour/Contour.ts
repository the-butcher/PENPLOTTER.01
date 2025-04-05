import * as turf from "@turf/turf";
import { Feature, LineString, Point, Position } from "geojson";
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from "../util/ObjectUtil";
import { RasterUtil } from "../util/RasterUtil";
import { Hachure } from "./Hachure";
import { IContour } from "./IContour";
import { IContourProperties } from "./IContourProperties";
import { IContourVertex } from "./IContourVertex";
import { IHachure } from "./IHachure";
import { ISubGeometry } from "./ISubGeometry";

export class Contour implements IContour {

    private id: string;
    private height: number;
    private length: number;
    private weighedLength: number;

    private subGeometries: ISubGeometry[];

    private weightCalcIncrement: number;
    private vertices: IContourVertex[];

    constructor(feature: Feature<LineString, IContourProperties>, heightFunction: (positionPixl: Position) => number) {

        this.id = ObjectUtil.createId();
        this.height = feature.properties.height;
        this.length = turf.length(feature, {
            units: 'meters'
        });

        const weightCalcSegments = Math.round(this.length / Hachure.CONFIG.contourDiv);
        this.weightCalcIncrement = this.length / weightCalcSegments;

        this.vertices = [];
        this.subGeometries = [];

        let position4326A = feature.geometry.coordinates[0]; // start with initial coordinate
        let position4326I = turf.along(feature, this.weightCalcIncrement, {
            units: 'meters'
        }).geometry.coordinates;
        let position4326B: Position | undefined; // positionB along contour (in terms of fixed vertex increment)

        let positionPixlA = GeometryUtil.position4326ToPixel(position4326A);
        let positionPixlI = GeometryUtil.position4326ToPixel(position4326I);
        let positionPixlB: Position | undefined;
        let positionPixlS: Position | undefined;

        let length = 0;
        let slope = 0;
        let aspect = 0;
        let weighedLength = 0;

        const zenith = 45;
        const azimut = 135; // north-west

        this.vertices.push({
            position4326: position4326A,
            positionPixl: positionPixlA,
            length,
            slope, // start with 0, but later copy back or extrapolate
            aspect, // start with 0, but later copy back or extrapolate
            weighedLength
        });
        const lenS = 5;

        // console.log('weightCalcSegments', weightCalcSegments);
        for (let i = 1; i <= weightCalcSegments - 1; i++) {

            length = (i + 1) * this.weightCalcIncrement;

            position4326B = turf.along(feature, length, {
                units: 'meters'
            }).geometry.coordinates;
            positionPixlB = GeometryUtil.position4326ToPixel(position4326B);

            const dX = positionPixlB[0] - positionPixlA[0];
            const dY = positionPixlB[1] - positionPixlA[1];
            aspect = Math.atan2(dY, dX) * RasterUtil.RAD2DEG - 90; // upwards

            positionPixlS = [
                positionPixlI[0] - Math.cos(aspect * RasterUtil.DEG2RAD) * lenS / GeometryUtil.cellSize,
                positionPixlI[1] - Math.sin(aspect * RasterUtil.DEG2RAD) * lenS / GeometryUtil.cellSize
            ];
            const heightI = heightFunction(positionPixlI);
            const heightS = heightFunction(positionPixlS);
            slope = Math.atan2(heightI - heightS, lenS) * RasterUtil.RAD2DEG;

            // https://pro.arcgis.com/en/pro-app/latest/tool-reference/3d-analyst/how-hillshade-works.htm
            // aspect is pointing "inwards" for this apps concerns, 180deg need to be added to let it face "outwards"
            const hillshade = (Math.cos(zenith * RasterUtil.DEG2RAD) * Math.cos(slope * RasterUtil.DEG2RAD) +
                Math.sin(zenith * RasterUtil.DEG2RAD) * Math.sin(slope * RasterUtil.DEG2RAD) * Math.cos((azimut - aspect + 180) * RasterUtil.DEG2RAD));

            const incrmt = ObjectUtil.mapValues(hillshade, {
                min: 0,
                max: 1
            }, {
                min: Hachure.CONFIG.contourDiv * 1.75, // larger means tighter spacing
                max: Hachure.CONFIG.contourDiv * 0.25
            });

            weighedLength += incrmt;

            this.vertices.push({
                position4326: position4326I,
                positionPixl: positionPixlI,
                length,
                aspect,
                slope,
                weighedLength
            });

            // move forward
            position4326A = position4326I;
            position4326I = position4326B;
            positionPixlA = positionPixlI;
            positionPixlI = positionPixlB;

        }

        this.vertices[0].aspect = this.vertices[1].aspect; // TODO :: extrapolation of needed
        this.vertices[0].slope = this.vertices[1].slope; // TODO :: extrapolation of needed

        if (this.length > length) {
            length = this.length;
            aspect = this.vertices[this.vertices.length - 1].aspect;
            slope = this.vertices[this.vertices.length - 1].slope;
            weighedLength = this.vertices[this.vertices.length - 1].weighedLength * 2 - this.vertices[this.vertices.length - 2].weighedLength;
            this.vertices.push({
                position4326: position4326B!,
                positionPixl: positionPixlB!,
                length,
                slope,
                aspect,
                weighedLength
            });
        }

        const coordinates: Position[] = [];
        this.vertices.forEach(contourVertex => {
            coordinates.push(contourVertex.position4326);
        });

        // split to multiple geometries to speed up calculations later
        const subGeometryCount = Math.ceil(this.vertices.length / 50);
        const subGeometryCoordIncr = this.vertices.length / subGeometryCount;
        for (let i = 0; i < subGeometryCount; i++) {
            const indexMin = Math.max(0, Math.round(i * subGeometryCoordIncr));
            const indexMax = Math.min(this.vertices.length - 1, Math.round((i + 1) * subGeometryCoordIncr));
            const subCoordinates: Position[] = [];
            for (let j = indexMin; j <= indexMax; j++) {
                subCoordinates.push(this.vertices[j].position4326);
            }
            const subGeometry: LineString = {
                type: 'LineString',
                coordinates: subCoordinates
            };
            this.subGeometries.push({
                geometry: subGeometry,
                lengthMin: this.vertices[indexMin].length,
                lengthMax: this.vertices[indexMax].length,
                bbox: turf.bbox(subGeometry)
            });
        }
        this.weighedLength = weighedLength;

    }

    getId(): string {
        return this.id;
    }

    getHeight(): number {
        return this.height;
    }

    handleHachures(hachuresProgress: IHachure[], hachuresComplete: IHachure[]): IHachure[] {

        const extraHachures: IHachure[] = [];

        const weighedLengths: number[] = []; // [0, this.weighedLength];
        weighedLengths.push(0);

        for (let i = 0; i < hachuresProgress.length; i++) {

            const hachure = hachuresProgress[i];

            const lastVertex4326 = hachure.getLastVertex().position4326;
            const nearestPoint = this.findNearestPointOnLine(lastVertex4326)!;
            if (nearestPoint && nearestPoint.properties.dist < 0.01) {

                const length = nearestPoint.properties.location;
                const weighedLength = this.lengthToWeighedLength(length);
                const hasWeightLengthSmallerThanMin = weighedLengths.find(w => Math.abs(weighedLength - w) < Hachure.CONFIG.minSpacing);
                if (hasWeightLengthSmallerThanMin) {
                    // TODO :: depending on distances before or after it may also make sense to discontinue/complete the previous line
                    hachure.setComplete();
                }
                //  else {
                weighedLengths.push(weighedLength); // weighedLength is added regardless of complete state that may just have been set, in some cases another line would be started right away otherwise
                // }

            }

        }
        weighedLengths.push(this.weighedLength);
        weighedLengths.sort();

        // console.log('weighedLengths', weighedLengths);


        let extraHachureAdded = true;
        let counter = 0;
        while (extraHachureAdded && counter++ < 25) {

            const _weighedLengths = [...weighedLengths.sort((a, b) => a - b)];
            // console.log('_weighedLengths', _weighedLengths);

            extraHachureAdded = false;

            for (let i = 0; i < _weighedLengths.length - 1; i++) {

                const weighedLengthDiff = _weighedLengths[i + 1] - _weighedLengths[i];
                if (weighedLengthDiff > Hachure.CONFIG.maxSpacing * 2) { // enough space to fit one extra

                    const weighedLength = _weighedLengths[i] + weighedLengthDiff / 2;
                    const length = this.weighedLengthToLength(weighedLength);

                    const position4326 = this.findPointAlong(length);
                    if (position4326) {

                        const positionPixl = GeometryUtil.position4326ToPixel(position4326);

                        const hasNearbyEndOfCompletedHachure = hachuresComplete.some(h => {
                            const lastVertex = h.getLastVertex();
                            if (Math.abs(positionPixl[0] - lastVertex.positionPixl[0]) > Hachure.CONFIG.minSpacing / GeometryUtil.cellSize) {
                                return false;
                            }
                            if (Math.abs(positionPixl[1] - lastVertex.positionPixl[1]) > Hachure.CONFIG.minSpacing / GeometryUtil.cellSize) {
                                return false;
                            }
                            const distance = turf.distance(position4326, lastVertex.position4326, {
                                units: 'meters'
                            });
                            return distance < Hachure.CONFIG.minSpacing * 1;
                        });

                        if (!hasNearbyEndOfCompletedHachure) {

                            const positionPixl = GeometryUtil.position4326ToPixel(position4326);
                            const aspect = this.lengthToAspect(length);
                            const slope = this.lengthToSlope(length);

                            const extraHachure = new Hachure({
                                position4326,
                                positionPixl,
                                aspect,
                                height: this.height,
                                slope
                            });
                            extraHachures.push(extraHachure);
                            extraHachureAdded = true;

                            // console.log('adding extra hachure', i, i + 1, weighedLength, extraHachure);
                            weighedLengths.push(weighedLength);

                        }

                    } else {
                        console.error('did not find point along');
                    }

                }

            }

        }

        return extraHachures;

    }

    intersectHachures(hachures: IHachure[]): IHachure[] {

        const intersectHachures: IHachure[] = [];


        for (let i = 0; i < hachures.length; i++) {

            // const hachure = hachures[i];

            const hachure = hachures[i];
            // if (!hachure.isComplete()) {

            const lastHachureVertex = hachure.getLastVertex();

            const pixelCoordinateA = lastHachureVertex.positionPixl;
            const pixelCoordinateB: Position = [
                pixelCoordinateA[0] + Math.cos(lastHachureVertex.aspect * RasterUtil.DEG2RAD) * Hachure.CONFIG.hachureRay,
                pixelCoordinateA[1] + Math.sin(lastHachureVertex.aspect * RasterUtil.DEG2RAD) * Hachure.CONFIG.hachureRay
            ];
            const coordinate4326A = GeometryUtil.pixelToPosition4326(pixelCoordinateA);
            const coordinate4326B = GeometryUtil.pixelToPosition4326(pixelCoordinateB);

            const intersection4326 = this.findIntersection(coordinate4326A, coordinate4326B, lastHachureVertex.position4326);
            if (intersection4326) {

                const nearestPoint = this.findNearestPointOnLine(intersection4326)!;
                if (nearestPoint && nearestPoint.properties.dist < 0.01) {

                    // console.log('intersectionNear', hachure, intersectionNear);
                    const position4326 = nearestPoint.geometry.coordinates;
                    const positionPixl = GeometryUtil.position4326ToPixel(position4326);
                    const length = nearestPoint.properties.location;
                    const aspect = this.lengthToAspect(length);
                    const slope = this.lengthToSlope(length);

                    hachure.addVertex({
                        position4326,
                        positionPixl,
                        aspect,
                        height: this.height,
                        slope
                    });
                    // console.log('hachure after adding', hachure);

                } else {
                    // should actually not happen
                    // console.log('no intersection');
                }

            }

            intersectHachures.push(hachure);

        }

        return intersectHachures;

    }

    findIntersection(coordinate4326A: Position, coordinate4326B: Position, refPosition: Position): Position | undefined {

        for (let i = 0; i < this.subGeometries.length; i++) {

            const subGeometry = this.subGeometries[i];

            const rayBGeom: LineString = {
                type: 'LineString',
                coordinates: [
                    coordinate4326A,
                    coordinate4326B
                ]
            };

            const intersections = turf.lineIntersect(subGeometry.geometry, rayBGeom);
            if (intersections.features.length > 0) {

                // find the intersection nearest to the hachure's last vertex
                let minIntersectionIndex = -1;
                if (intersections.features.length === 1) {
                    minIntersectionIndex = 0;
                } else {
                    let minIntersectionDistance = Number.MAX_VALUE;
                    for (let j = 0; j < intersections.features.length; j++) {
                        const intersectionDistance = turf.distance(refPosition, intersections.features[j].geometry.coordinates, {
                            units: 'meters'
                        });
                        if (intersectionDistance < minIntersectionDistance) {
                            minIntersectionDistance = intersectionDistance;
                            minIntersectionIndex = j;
                        }
                    }
                    // console.log('minIntersectionIndex', minIntersectionIndex);
                }

                return intersections.features[minIntersectionIndex].geometry.coordinates;

            }

        }

    }

    findPointAlong(length: number): Position | undefined {

        for (let i = 0; i < this.subGeometries.length; i++) {

            const subGeometry = this.subGeometries[i];
            if (length >= subGeometry.lengthMin && length <= subGeometry.lengthMax) {
                return turf.along(subGeometry.geometry, length - subGeometry.lengthMin, {
                    units: 'meters'
                }).geometry.coordinates;
            }

        }

    }

    findNearestPointOnLine(positionA: Position): Feature<Point, {
        dist: number;
        index: number;
        location: number;
    }> | undefined {

        for (let i = 0; i < this.subGeometries.length; i++) {
            const subGeometry = this.subGeometries[i];
            if (GeometryUtil.booleanWithinBbox(subGeometry.bbox, positionA)) { // a candidate
                const pointOnLine = turf.nearestPointOnLine(subGeometry.geometry, positionA, {
                    units: 'meters'
                });
                if (pointOnLine.properties.dist < 0.01) {
                    return turf.feature(pointOnLine.geometry, {
                        ...pointOnLine.properties,
                        location: subGeometry.lengthMin + pointOnLine.properties.location
                    })
                }
            }
        }
        // console.error('failed to find nearest point');

        // // const tolerance = 0.0001;
        // const anyBBoxContainsCoordinate = (): boolean => {
        //     for (let i = 0; i < this.bboxes.length; i++) {
        //         if (GeometryUtil.booleanWithinBbox(this.bboxes[i], positionA)) {
        //             return true;
        //         }
        //     }
        //     return false;
        // }
        // if (anyBBoxContainsCoordinate()) {

        //     Contour.FIND_CASE++;

        //     // const isCoordinateCandidate = (positionB: Position): boolean => {
        //     //     return Math.abs(positionB[0] - positionA[0]) < tolerance && Math.abs(positionB[1] - positionA[1]) < tolerance;
        //     // }
        //     // const hasCoordinateCandidates = this.contourVertices.some(v => isCoordinateCandidate(v.position4326));
        //     // if (hasCoordinateCandidates) {
        //     return turf.nearestPointOnLine(this.geometry, positionA, {
        //         units: 'meters'
        //     });
        //     // } else {
        //     //     // let a = '';
        //     // }

        // } else {
        //     Contour.BBOX_CASE++;
        // }

        // let bbox: BBox;
        // let pntA: Position;
        // let pntB: Position;
        // const tolerance = 0.00000; // 5;
        // // let locationLocal = 0;
        // let locationTotal = 0;
        // for (let i = 0; i < this.contourVertices.length - 1; i++) {
        //     pntA = this.contourVertices[i].position4326;
        //     pntB = this.contourVertices[i + 1].position4326;
        //     bbox = [
        //         Math.min(pntA[0], pntB[0]) - tolerance,
        //         Math.min(pntA[1], pntB[1]) - tolerance,
        //         Math.max(pntA[0], pntB[0]) + tolerance,
        //         Math.max(pntA[1], pntB[1]) + tolerance
        //     ];
        //     if (GeometryUtil.booleanWithinBbox(bbox, position)) {
        //         // const segmentGeometry = turf.lineSliceAlong(this.geometry, this.contourVertices[i].length, this.contourVertices[i + 1].length, {
        //         //     units: 'meters'
        //         // });
        //         const segmentGeometry: LineString = {
        //             type: 'LineString',
        //             coordinates: [
        //                 pntA,
        //                 pntB
        //             ]
        //         }
        //         const nearestPoint = turf.nearestPointOnLine(segmentGeometry, position, {
        //             units: 'meters'
        //         });
        //         // const nearestPoint = this.findNearestPointOnLine(position)!;
        //         const location = nearestPoint.properties.location;
        //         if (location < Contour.SEGMENT_BASE_LENGTH) {
        //             return turf.feature(nearestPoint.geometry, {
        //                 ...nearestPoint.properties,
        //                 location: locationTotal + location
        //             });
        //         }
        //     }
        //     locationTotal += turf.distance(pntA, pntB, {
        //         units: 'meters'
        //     });
        // }
        // console.log('fallback to full geometry');



    }

    weighedLengthToLength(_weighedLength: number): number {
        if (_weighedLength < 0) {
            return 0;
        } else if (_weighedLength > this.weighedLength) {
            return this.length;
        } else {
            for (let i = 1; i < this.vertices.length; i++) {
                if (this.vertices[i].weighedLength > _weighedLength) {
                    return ObjectUtil.mapValues(_weighedLength, {
                        min: this.vertices[i - 1].weighedLength,
                        max: this.vertices[i].weighedLength
                    }, {
                        min: this.vertices[i - 1].length,
                        max: this.vertices[i].length
                    })
                }
            }
            return this.length;
        }
    }

    lengthToWeighedLength(_length: number): number {
        if (_length < 0) {
            return 0;
        } else if (_length > this.length) {
            return this.weighedLength;
        } else {
            for (let i = 1; i < this.vertices.length; i++) {
                if (this.vertices[i].length > _length) {
                    return ObjectUtil.mapValues(_length, {
                        min: this.vertices[i - 1].length,
                        max: this.vertices[i].length
                    }, {
                        min: this.vertices[i - 1].weighedLength,
                        max: this.vertices[i].weighedLength
                    });
                }
            }
            return this.weighedLength;
        }
    }

    lengthToAspect(_length: number): number {
        if (_length < 0) {
            return this.vertices[0].aspect;
        } else if (_length > this.length) {
            return this.vertices[this.vertices.length - 1].aspect;
        } else {
            for (let i = 1; i < this.vertices.length; i++) {
                if (this.vertices[i].length > _length) {
                    const aspectA = this.vertices[i - 1].aspect * RasterUtil.DEG2RAD;
                    const aspectB = this.vertices[i].aspect * RasterUtil.DEG2RAD;
                    const cosSum = Math.cos(aspectA) + Math.cos(aspectB);
                    const sinSum = Math.sin(aspectA) + Math.sin(aspectB);
                    return Math.atan2(sinSum, cosSum) * RasterUtil.RAD2DEG;
                }
            }
            return this.vertices[this.vertices.length - 1].aspect;
        }
    }

    lengthToSlope(_length: number): number {
        if (_length < 0) {
            return this.vertices[0].slope;
        } else if (_length > this.length) {
            return this.vertices[this.vertices.length - 1].slope;
        } else {
            for (let i = 1; i < this.vertices.length; i++) {
                if (this.vertices[i].length > _length) {
                    return ObjectUtil.mapValues(_length, {
                        min: this.vertices[i - 1].length,
                        max: this.vertices[i].length
                    }, {
                        min: this.vertices[i - 1].slope,
                        max: this.vertices[i].slope
                    });
                }
            }
            return this.vertices[this.vertices.length - 1].slope;
        }
    }

    toLineString(): LineString {

        const lineString: LineString = {
            type: 'LineString',
            coordinates: []
        };
        this.vertices.forEach(vertex => {
            lineString.coordinates.push(vertex.position4326);
        })
        return lineString;

    }

    getSvgData(): string {

        let command = 'M';
        let d = '';
        this.vertices.forEach(vertex => {
            d += `${command}${vertex.positionPixl[0]} ${vertex.positionPixl[1]} `;
            command = 'L';
        });

        // this.subGeometries.forEach(subGeometry => {
        //     const coordinateMin = GeometryUtil.position4326ToPixel([
        //         subGeometry.bbox[0],
        //         subGeometry.bbox[1]
        //     ]);
        //     const coordinateMax = GeometryUtil.position4326ToPixel([
        //         subGeometry.bbox[2],
        //         subGeometry.bbox[3]
        //     ]);
        //     d += `M${coordinateMin[0]} ${coordinateMin[1]}`
        //     d += `L${coordinateMin[0]} ${coordinateMax[1]}`
        //     d += `L${coordinateMax[0]} ${coordinateMax[1]}`
        //     d += `L${coordinateMax[0]} ${coordinateMin[1]}`
        //     d += `L${coordinateMin[0]} ${coordinateMin[1]}`
        // })

        return d;

        // let d = '';
        // this.contourVertices.forEach(contourVertex => {
        //     d += `M${contourVertex.positionPixl[0]} ${contourVertex.positionPixl[1]}l${Math.cos(contourVertex.aspect * RasterUtil.DEG2RAD) * aspectLength} ${Math.sin(contourVertex.aspect * RasterUtil.DEG2RAD) * aspectLength}`;
        // });
        // return d;

    }

}