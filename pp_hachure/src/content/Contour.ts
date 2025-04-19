import * as turf from "@turf/turf";
import { Feature, LineString, Point, Position } from "geojson";
import { Raster } from "../raster/Raster";
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from "../util/ObjectUtil";
import { Hachure } from "./Hachure";
import { IContour } from "./IContour";
import { IContourProperties } from "./IContourProperties";
import { IContourVertex } from "./IContourVertex";
import { IHachure } from "./IHachure";
import { ISubGeometry } from "./ISubGeometry";
import { IHachureConfigProps } from "../components/IHachureConfigProps";
import { IRasterConfigProps } from "../components/IRasterConfigProps";

/**
 * Implementation of {@link IContour}, holds a major part of the hachure implementation.
 *
 * @author h.fleischer
 * @since 06.04.2025
 */
export class Contour implements IContour {

    readonly id: string;
    readonly svgData: string;
    complete: boolean;
    private height: number;
    private length: number;
    private scaledLength: number;

    private rasterConfig: IRasterConfigProps;
    private hachureConfig: IHachureConfigProps;

    private subGeometries: ISubGeometry[];

    private weightCalcIncrement: number;
    private vertices: IContourVertex[];

    constructor(feature: Feature<LineString, IContourProperties>, rasterConfig: IRasterConfigProps, hachureConfig: IHachureConfigProps, heightFunction: (positionPixl: Position) => number) {

        this.id = ObjectUtil.createId();
        this.height = feature.properties.height;
        this.rasterConfig = rasterConfig;
        this.hachureConfig = hachureConfig;

        this.length = turf.length(feature, {
            units: 'meters'
        });


        const weightCalcSegments = Math.round(this.length / this.hachureConfig.contourDiv);
        this.weightCalcIncrement = this.length / weightCalcSegments;

        this.vertices = [];
        this.subGeometries = [];

        const subGeometryCountA = Math.ceil(this.length / 100);
        const subGeometryLengthIncr = this.length / subGeometryCountA;
        for (let i = 0; i < subGeometryCountA; i++) {
            const lengthMin = Math.max(0, i * subGeometryLengthIncr);
            const lengthMax = Math.min(this.length, (i + 1) * subGeometryLengthIncr);
            const subFeature = turf.lineSliceAlong(feature, lengthMin, lengthMax, {
                units: 'meters'
            }).geometry;
            this.subGeometries.push({
                geometry: subFeature,
                lengthMin,
                lengthMax,
                bbox: turf.bbox(subFeature)
            });
        }

        let position4326A = feature.geometry.coordinates[0]; // start with initial coordinate
        let position4326I = this.findPointAlong(this.weightCalcIncrement)!;
        let position4326B: Position | undefined; // positionB along contour (in terms of fixed vertex increment)

        let positionPixlA = GeometryUtil.position4326ToPixel(position4326A, this.rasterConfig);
        let positionPixlI = GeometryUtil.position4326ToPixel(position4326I, this.rasterConfig);
        let positionPixlB: Position | undefined;
        let positionPixlS: Position | undefined;

        let length = 0;
        let slope = 0;
        let aspect = 0;
        let scaledLength = 0;

        const zenith = 45;
        let azimuthDeg = ObjectUtil.mapValues(this.hachureConfig.azimuthDeg, {
            min: 0,
            max: 360
        }, {
            min: -90 + 360,
            max: 270 + 360
        });
        while (azimuthDeg > 360) {
            azimuthDeg -= 360;
        }
        // console.log('azimuthDeg', azimuthDeg);

        this.vertices.push({
            position4326: position4326A,
            positionPixl: positionPixlA,
            length,
            slope, // start with 0, but later copy back or extrapolate
            aspect, // start with 0, but later copy back or extrapolate
            scaledLength
        });
        const lenS = 5;

        for (let i = 1; i <= weightCalcSegments - 1; i++) {

            length = (i + 1) * this.weightCalcIncrement;

            position4326B = this.findPointAlong(length)!;
            positionPixlB = GeometryUtil.position4326ToPixel(position4326B, this.rasterConfig);

            const dX = positionPixlB[0] - positionPixlA[0];
            const dY = positionPixlB[1] - positionPixlA[1];
            aspect = Math.atan2(dY, dX) * Raster.RAD2DEG - 90;

            positionPixlS = [
                positionPixlI[0] - Math.cos(aspect * Raster.DEG2RAD) * lenS / this.rasterConfig.cellsize,
                positionPixlI[1] - Math.sin(aspect * Raster.DEG2RAD) * lenS / this.rasterConfig.cellsize
            ];
            const heightI = heightFunction(positionPixlI);
            const heightS = heightFunction(positionPixlS);
            slope = Math.atan2(heightI - heightS, lenS) * Raster.RAD2DEG;

            // https://pro.arcgis.com/en/pro-app/latest/tool-reference/3d-analyst/how-hillshade-works.htm
            // aspect is pointing "inwards" for this apps concerns, 180deg need to be added to let it face "outwards"
            const hillshade = (Math.cos(zenith * Raster.DEG2RAD) * Math.cos(slope * Raster.DEG2RAD) +
                Math.sin(zenith * Raster.DEG2RAD) * Math.sin(slope * Raster.DEG2RAD) * Math.cos((azimuthDeg - aspect + 180) * Raster.DEG2RAD));

            const incrmt = ObjectUtil.mapValues(hillshade, {
                min: 0,
                max: 1
            }, {
                min: this.hachureConfig.contourDiv * 2.10, // larger means tighter spacing
                max: this.hachureConfig.contourDiv * 0.30
            });

            scaledLength += incrmt;

            this.vertices.push({
                position4326: position4326I,
                positionPixl: positionPixlI,
                length,
                aspect,
                slope,
                scaledLength: scaledLength
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
            scaledLength = this.vertices[this.vertices.length - 1].scaledLength * 2 - this.vertices[this.vertices.length - 2].scaledLength;
            this.vertices.push({
                position4326: position4326B!,
                positionPixl: positionPixlB!,
                length,
                slope,
                aspect,
                scaledLength: scaledLength
            });
        }

        const coordinates: Position[] = [];
        this.vertices.forEach(contourVertex => {
            coordinates.push(contourVertex.position4326);
        });

        // split to multiple geometries to speed up calculations later
        const subGeometryCountB = Math.ceil(this.vertices.length / 50);
        const subGeometryCoordIncr = this.vertices.length / subGeometryCountB;
        for (let i = 0; i < subGeometryCountB; i++) {
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
        this.scaledLength = scaledLength;

        this.svgData = this.getSvgData();
        this.complete = false;

    }

    getId(): string {
        return this.id;
    }

    getHeight(): number {
        return this.height;
    }

    handleHachures(hachuresProgress: IHachure[], hachuresComplete: IHachure[]): IHachure[] {

        const extraHachures: IHachure[] = [];

        const scaledLengths: number[] = [];
        scaledLengths.push(0);

        for (let i = 0; i < hachuresProgress.length; i++) {

            const hachure = hachuresProgress[i];

            const lastVertex4326 = hachure.getLastVertex().position4326;
            const nearestPoint = this.findNearestPointOnLine(lastVertex4326)!;
            if (nearestPoint && nearestPoint.properties.dist < 0.01) {

                const length = nearestPoint.properties.location;
                const scaledLength = this.lengthToScaledLength(length);
                const hasWeightLengthSmallerThanMin = scaledLengths.find(w => Math.abs(scaledLength - w) < this.hachureConfig.minSpacing);
                if (hasWeightLengthSmallerThanMin) {
                    // TODO :: depending on distances before or after it may also make sense to discontinue/complete the previous line
                    hachure.complete = true;
                }
                //  else {
                scaledLengths.push(scaledLength); // scaledLength is added regardless of complete state that may just have been set, in some cases another line would be started right away otherwise
                // }

            }

        }
        scaledLengths.push(this.scaledLength);
        scaledLengths.sort();

        let extraHachureAdded = true;
        let counter = 0;
        while (extraHachureAdded && counter++ < 25) {

            const _scaledLengths = [...scaledLengths.sort((a, b) => a - b)];

            extraHachureAdded = false;

            for (let i = 0; i < _scaledLengths.length - 1; i++) {

                const scaledLengthDiff = _scaledLengths[i + 1] - _scaledLengths[i];
                if (scaledLengthDiff > this.hachureConfig.maxSpacing * 2) { // enough space to fit one extra

                    const scaledLength = _scaledLengths[i] + scaledLengthDiff / 2;
                    const length = this.scaledLengthToLength(scaledLength);

                    const position4326 = this.findPointAlong(length);
                    if (position4326) {

                        const positionPixl = GeometryUtil.position4326ToPixel(position4326, this.rasterConfig);

                        const hasNearbyEndOfCompletedHachure = hachuresComplete.some(h => {
                            const lastVertex = h.getLastVertex();
                            if (Math.abs(positionPixl[0] - lastVertex.positionPixl[0]) > this.hachureConfig.minSpacing * 3 / this.rasterConfig.cellsize) {
                                return false;
                            }
                            if (Math.abs(positionPixl[1] - lastVertex.positionPixl[1]) > this.hachureConfig.minSpacing * 3 / this.rasterConfig.cellsize) {
                                return false;
                            }
                            const distance = turf.distance(position4326, lastVertex.position4326, {
                                units: 'meters'
                            });
                            return distance < this.hachureConfig.minSpacing * 1;
                        });

                        if (!hasNearbyEndOfCompletedHachure) {

                            const positionPixl = GeometryUtil.position4326ToPixel(position4326, this.rasterConfig);
                            const aspect = this.lengthToAspect(length);
                            const slope = this.lengthToSlope(length);

                            const extraHachure = new Hachure({
                                position4326,
                                positionPixl,
                                aspect,
                                height: this.height,
                                slope
                            }, this.rasterConfig);
                            extraHachures.push(extraHachure);
                            extraHachureAdded = true;

                            scaledLengths.push(scaledLength);

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
        const hachureRay = (this.hachureConfig.contourOff / Math.tan(this.hachureConfig.hachureDeg * Raster.DEG2RAD)) / this.rasterConfig.cellsize;

        for (let i = 0; i < hachures.length; i++) {

            // const hachure = hachures[i];

            const hachure = hachures[i];
            // if (!hachure.isComplete()) {

            const lastHachureVertex = hachure.getLastVertex();

            const pixelCoordinateA = lastHachureVertex.positionPixl;
            const pixelCoordinateB: Position = [
                pixelCoordinateA[0] + Math.cos(lastHachureVertex.aspect * Raster.DEG2RAD) * hachureRay,
                pixelCoordinateA[1] + Math.sin(lastHachureVertex.aspect * Raster.DEG2RAD) * hachureRay
            ];
            const coordinate4326A = GeometryUtil.pixelToPosition4326(pixelCoordinateA, this.rasterConfig);
            const coordinate4326B = GeometryUtil.pixelToPosition4326(pixelCoordinateB, this.rasterConfig);

            const intersection4326 = this.findIntersection(coordinate4326A, coordinate4326B, lastHachureVertex.position4326);
            if (intersection4326) {

                const nearestPoint = this.findNearestPointOnLine(intersection4326)!;
                if (nearestPoint && nearestPoint.properties.dist < 0.01) {

                    // console.log('intersectionNear', hachure, intersectionNear);
                    const position4326 = nearestPoint.geometry.coordinates;
                    const positionPixl = GeometryUtil.position4326ToPixel(position4326, this.rasterConfig);
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

        const rayGeom: LineString = {
            type: 'LineString',
            coordinates: [
                coordinate4326A,
                coordinate4326B
            ]
        };
        const rayBbox = turf.bbox(rayGeom);
        // console.log('rayBbox', rayBbox);

        for (let i = 0; i < this.subGeometries.length; i++) {

            const subGeometry = this.subGeometries[i];

            if (GeometryUtil.booleanBboxOverlap(rayBbox, subGeometry.bbox)) {
                // if (GeometryUtil.booleanWithinBbox(subGeometry.bbox, coordinate4326A) || GeometryUtil.booleanWithinBbox(subGeometry.bbox, coordinate4326B)) {

                const intersections = turf.lineIntersect(subGeometry.geometry, rayGeom);
                if (intersections.features.length > 0) {

                    // if (!GeometryUtil.booleanBboxOverlap(rayBbox, subGeometry.bbox)) {
                    //     console.log(rayBbox, subGeometry.bbox);
                    // }

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
        const lastSubGeometry = this.subGeometries[this.subGeometries.length - 1];
        if (length > lastSubGeometry.lengthMax) {
            return lastSubGeometry.geometry.coordinates[lastSubGeometry.geometry.coordinates.length - 1];
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
                    });
                }
            }
        }

    }

    scaledLengthToLength(_scaledLength: number): number {
        if (_scaledLength < 0) {
            return 0;
        } else if (_scaledLength > this.scaledLength) {
            return this.length;
        } else {
            for (let i = 1; i < this.vertices.length; i++) {
                if (this.vertices[i].scaledLength > _scaledLength) {
                    return ObjectUtil.mapValues(_scaledLength, {
                        min: this.vertices[i - 1].scaledLength,
                        max: this.vertices[i].scaledLength
                    }, {
                        min: this.vertices[i - 1].length,
                        max: this.vertices[i].length
                    });
                }
            }
            return this.length;
        }
    }

    lengthToScaledLength(_length: number): number {
        if (_length < 0) {
            return 0;
        } else if (_length > this.length) {
            return this.scaledLength;
        } else {
            for (let i = 1; i < this.vertices.length; i++) {
                if (this.vertices[i].length > _length) {
                    return ObjectUtil.mapValues(_length, {
                        min: this.vertices[i - 1].length,
                        max: this.vertices[i].length
                    }, {
                        min: this.vertices[i - 1].scaledLength,
                        max: this.vertices[i].scaledLength
                    });
                }
            }
            return this.scaledLength;
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
                    const aspectA = this.vertices[i - 1].aspect * Raster.DEG2RAD;
                    const aspectB = this.vertices[i].aspect * Raster.DEG2RAD;
                    const cosSum = Math.cos(aspectA) + Math.cos(aspectB);
                    const sinSum = Math.sin(aspectA) + Math.sin(aspectB);
                    return Math.atan2(sinSum, cosSum) * Raster.RAD2DEG;
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
        });
        return lineString;

    }

    getSvgData(): string {

        let command = 'M';
        let d = '';
        this.vertices.forEach(vertex => {
            d += `${command}${vertex.positionPixl[0].toFixed(2)} ${vertex.positionPixl[1].toFixed(2)} `;
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