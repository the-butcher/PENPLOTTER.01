import { Feature, LineString, Position } from "geojson";
import { IContour } from "./IContour";
import { IContourProperties } from "./IContourProperties";
import * as turf from "@turf/turf";
import { GeometryUtil } from "../util/GeometryUtil";
import { RasterUtil } from "../util/RasterUtil";
import { IContourVertex } from "./IContourVertex";
import { ObjectUtil } from "../util/ObjectUtil";
import { IHachure } from "./IHachure";
import { Hachure } from "./Hachure";

export class Contour implements IContour {

    static readonly SEGMENT_BASE_LENGTH = 10;

    private id: string;
    private height: number;
    private length: number;
    private weighedLength: number;

    private geometry: LineString;

    private weightCalcIncrement: number;
    private contourVertices: IContourVertex[];

    constructor(feature: Feature<LineString, IContourProperties>) {

        this.id = ObjectUtil.createId();
        this.height = feature.properties.height;
        this.length = turf.length(feature, {
            units: 'meters'
        });
        console.log('length', this.length)

        this.geometry = feature.geometry;

        const weightCalcSegments = Math.round(this.length * 2 / Contour.SEGMENT_BASE_LENGTH);
        this.weightCalcIncrement = this.length / weightCalcSegments;

        this.contourVertices = [];

        let position4326A = feature.geometry.coordinates[0]; // start with initial coordinate
        let position4326I = turf.along(feature, this.weightCalcIncrement, {
            units: 'meters'
        }).geometry.coordinates;
        let position4326B: Position | undefined;

        let positionPixlA = GeometryUtil.position4326ToPixel(position4326A);
        let positionPixlI = GeometryUtil.position4326ToPixel(position4326I);
        let positionPixlB: Position | undefined;

        let length = 0;
        let aspect = 0;
        let weighedLength = 0;
        const nwdrct = -135; // light direction

        this.contourVertices.push({
            position4326: position4326A,
            positionPixl: positionPixlA,
            length,
            aspect, // start with 0, but later copy back or extrapolate
            weighedLength
        });

        for (let i = 1; i <= weightCalcSegments - 1; i++) {

            length = (i + 1) * this.weightCalcIncrement;

            position4326B = turf.along(feature, length, {
                units: 'meters'
            }).geometry.coordinates;
            positionPixlB = GeometryUtil.position4326ToPixel(position4326B);

            const dX = positionPixlB[0] - positionPixlA[0];
            const dY = positionPixlB[1] - positionPixlA[1];
            aspect = Math.atan2(dY, dX) * RasterUtil.RAD2DEG - 90;

            const unit2: Position = [
                Math.cos(aspect * RasterUtil.DEG2RAD),
                Math.sin(aspect * RasterUtil.DEG2RAD)
            ];
            const unit3: Position = [
                Math.cos(nwdrct * RasterUtil.DEG2RAD),
                Math.sin(nwdrct * RasterUtil.DEG2RAD)
            ];
            const dot23 = unit2[0] * unit3[0] + unit2[1] * unit3[1];
            const incrmt = ObjectUtil.mapValues(dot23, {
                min: 1,
                max: -1
            }, {
                min: 6.3 * 4,
                max: 6.3
            });
            weighedLength += incrmt;

            this.contourVertices.push({
                position4326: position4326I,
                positionPixl: positionPixlI,
                length,
                aspect, // start with 0, but later extrapolate
                weighedLength
            });

            // move forward
            position4326A = position4326I;
            position4326I = position4326B;
            positionPixlA = positionPixlI;
            positionPixlI = positionPixlB;

        }


        this.contourVertices[0].aspect = this.contourVertices[1].aspect; // TODO :: extrapolytion of needed

        length = this.length;
        aspect = this.contourVertices[this.contourVertices.length - 1].aspect;
        weighedLength = this.contourVertices[this.contourVertices.length - 1].weighedLength * 2 - this.contourVertices[this.contourVertices.length - 2].weighedLength;
        this.contourVertices.push({
            position4326: position4326B!,
            positionPixl: positionPixlB!,
            length,
            aspect, // start with 0, but later extrapolate
            weighedLength
        });

        this.weighedLength = weighedLength;

        // console.log('contour', this);

    }

    getId(): string {
        return this.id;
    }

    getHeight(): number {
        return this.height;
    }

    handleHachures(hachures: IHachure[]): IHachure[] {

        const extraHachures: IHachure[] = [];

        const weighedLengths: number[] = []; // [0, this.weighedLength];
        weighedLengths.push(0);

        // console.log('handleHachures', hachures.length);
        for (let i = 0; i < hachures.length; i++) {

            // weighedLengths.sort();

            const hachure = hachures[i];
            if (!hachure.isComplete()) {

                const lastVertex4326 = hachure.getLastVertex().position4326;
                const nearestPointOnLine = turf.nearestPointOnLine(this.geometry, lastVertex4326, {
                    units: 'meters'
                });

                // console.log('nearestPointOnLine', this.height, hachure.getVertexCount());

                if (nearestPointOnLine.properties.dist < 0.01) {

                    // console.log('nearestPointOnLine', heightA, nearestPointOnLine.properties.dist, nearestPointOnLine);
                    const length = nearestPointOnLine.properties.location;
                    const weighedLength = this.lengthToWeighedLength(length);
                    const hasWeightLengthSmallerThanMin = weighedLengths.find(w => Math.abs(weighedLength - w) < Hachure.HACHURE_MIN_SPACING);
                    // const weighedLengthDiff = weighedLength - weighedLengths[weighedLengths.length - 1];
                    if (hasWeightLengthSmallerThanMin) {
                        // TODO :: decide if the weighed distance for this line should still be counted
                        // TODO :: depending on distances before or after it may also make sense to discontinue/complete the previous line
                        hachure.setComplete();
                    } else {
                        weighedLengths.push(weighedLength);
                    }


                }

            }

        };
        weighedLengths.push(this.weighedLength);

        weighedLengths.sort();

        // console.log('weighedLengths', weighedLengths);


        let extraHachureAdded = true;
        let counter = 0;
        while (extraHachureAdded && counter++ < 10) {

            const _weighedLengths = [...weighedLengths.sort((a, b) => a - b)];
            // console.log('_weighedLengths', _weighedLengths);

            extraHachureAdded = false;

            for (let i = 0; i < _weighedLengths.length - 1; i++) {

                const weighedLengthDiff = _weighedLengths[i + 1] - _weighedLengths[i];
                if (weighedLengthDiff > Hachure.HACHURE_MAX_SPACING * 2) {

                    const weighedLength = _weighedLengths[i] + weighedLengthDiff / 2;
                    const length = this.weighedLengthToLength(weighedLength);

                    const position4326 = turf.along(this.geometry, length, {
                        units: 'meters'
                    }).geometry.coordinates;
                    const positionPixl = GeometryUtil.position4326ToPixel(position4326);
                    const aspect = this.lengthToAspect(length);

                    const extraHachure = new Hachure({
                        position4326,
                        positionPixl,
                        aspect,
                        height: this.height
                    });
                    extraHachures.push(extraHachure);
                    extraHachureAdded = true;

                    // console.log('adding extra hachure', i, i + 1, weighedLength, extraHachure);
                    weighedLengths.push(weighedLength);

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
            if (!hachure.isComplete()) {

                const lastHachureVertex = hachure.getLastVertex();

                const pixelCoordinateA = lastHachureVertex.positionPixl;
                const pixelCoordinateB: Position = [
                    pixelCoordinateA[0] + Math.cos(lastHachureVertex.aspect * RasterUtil.DEG2RAD) * Hachure.HACHURE_RAY__LENGTH,
                    pixelCoordinateA[1] + Math.sin(lastHachureVertex.aspect * RasterUtil.DEG2RAD) * Hachure.HACHURE_RAY__LENGTH
                ];
                const coordinate4326A = GeometryUtil.pixelToPosition4326(pixelCoordinateA);
                const coordinate4326B = GeometryUtil.pixelToPosition4326(pixelCoordinateB);
                const rayBGeom: LineString = {
                    type: 'LineString',
                    coordinates: [
                        coordinate4326A,
                        coordinate4326B
                    ]
                };
                const intersections = turf.lineIntersect(this.geometry, rayBGeom);
                if (intersections.features.length > 0) {

                    const intersection4326 = intersections.features[0].geometry.coordinates;

                    const intersectionNear = turf.nearestPointOnLine(this.geometry, intersection4326, {
                        units: 'meters'
                    });
                    // console.log('intersects', intersections.features[0], nearestPoint);

                    if (intersectionNear.properties.dist < 0.01) {

                        // console.log('intersectionNear', hachure, intersectionNear);
                        const position4326 = intersectionNear.geometry.coordinates;
                        const positionPixl = GeometryUtil.position4326ToPixel(position4326);
                        const length = intersectionNear.properties.location;
                        const aspect = this.lengthToAspect(length);
                        hachure.addVertex({
                            position4326,
                            positionPixl,
                            aspect,
                            height: this.height
                        });
                        // console.log('hachure after adding', hachure);

                    } else {
                        // should actually not happen
                    }


                    // TODO :: add vertex to


                } else {
                    // console.log('does not intersect');
                }

            }

            intersectHachures.push(hachure);

        }

        return intersectHachures;

    }

    weighedLengthToLength(_weighedLength: number): number {
        if (_weighedLength < 0) {
            return 0;
        } else if (_weighedLength > this.weighedLength) {
            return this.length;
        } else {
            for (let i = 1; i < this.contourVertices.length; i++) {
                if (this.contourVertices[i].weighedLength > _weighedLength) {
                    return ObjectUtil.mapValues(_weighedLength, {
                        min: this.contourVertices[i - 1].weighedLength,
                        max: this.contourVertices[i].weighedLength
                    }, {
                        min: this.contourVertices[i - 1].length,
                        max: this.contourVertices[i].length
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
            for (let i = 1; i < this.contourVertices.length; i++) {
                if (this.contourVertices[i].length > _length) {
                    return ObjectUtil.mapValues(_length, {
                        min: this.contourVertices[i - 1].length,
                        max: this.contourVertices[i].length
                    }, {
                        min: this.contourVertices[i - 1].weighedLength,
                        max: this.contourVertices[i].weighedLength
                    })
                }
            }
            return this.weighedLength;
        }
    }

    lengthToAspect(_length: number): number {
        if (_length < 0) {
            return this.contourVertices[0].aspect;
        } else if (_length > this.length) {
            return this.contourVertices[this.contourVertices.length - 1].aspect;
        } else {
            for (let i = 1; i < this.contourVertices.length; i++) {
                if (this.contourVertices[i].length > _length) {
                    const aspectA = this.contourVertices[i - 1].aspect * RasterUtil.DEG2RAD;
                    const aspectB = this.contourVertices[i].aspect * RasterUtil.DEG2RAD;
                    const cosSum = Math.cos(aspectA) + Math.cos(aspectB);
                    const sinSum = Math.sin(aspectA) + Math.sin(aspectB);
                    return Math.atan2(sinSum, cosSum) * RasterUtil.RAD2DEG;
                }
            }
            return this.contourVertices[this.contourVertices.length - 1].aspect;
        }
    }

    getSvgData(): string {

        const aspectLength = 5;

        let d = '';
        this.contourVertices.forEach(contourVertex => {
            d += `M${contourVertex.positionPixl[0]} ${contourVertex.positionPixl[1]}l${Math.cos(contourVertex.aspect * RasterUtil.DEG2RAD) * aspectLength} ${Math.sin(contourVertex.aspect * RasterUtil.DEG2RAD) * aspectLength}`;
        });
        return d;

    }

}