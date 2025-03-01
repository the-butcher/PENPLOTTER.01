import * as turf from '@turf/turf';
import { BBox, Feature, Geometry, LineString, MultiLineString, MultiPolygon, Polygon, Position } from "geojson";
import { noto_serif_regular } from "../map/NotoSerif";
import { CODE____LINE_TO, CODE____MOVE_TO, IVectorTileCoordinate } from "../protobuf/vectortile/geometry/IVectorTileCoordinate";
import { IMatrix2D } from "../util/Interfaces";
import { IVectorTileKey } from "./IVectorTileKey";
import { VectorTileKey } from "./VectorTileKey";


export type UnionPolygon = Polygon | MultiPolygon;
export type UnionPolyline = LineString | MultiLineString;

export class VectorTileGeometryUtil {

    static transformMultiPolygon(polygons: MultiPolygon, matrix: IMatrix2D): MultiPolygon {
        return {
            type: 'MultiPolygon',
            coordinates: VectorTileGeometryUtil.transformPosition3(polygons.coordinates, matrix)
        }
    }

    static transformPosition3(positions: Position[][][], matrix: IMatrix2D): Position[][][] {
        return positions.map(p => VectorTileGeometryUtil.transformPosition2(p, matrix));
    }

    static transformPosition2(positions: Position[][], matrix: IMatrix2D): Position[][] {
        return positions.map(p => VectorTileGeometryUtil.transformPosition1(p, matrix));
    }

    static transformPosition1(positions: Position[], matrix: IMatrix2D): Position[] {
        return positions.map(p => VectorTileGeometryUtil.transformPosition(p, matrix));
    }

    /**
     * https://github.com/Fionoble/transformation-matrix-js/blob/master/src/matrix.js
     * @param matrixA
     * @param matrixB
     * @returns
     */
    static matrixMultiply(...matrices: IMatrix2D[]): IMatrix2D {
        let matrixA = matrices[0];
        for (let i = 1; i < matrices.length; i++) {
            const matrixB = matrices[i];
            matrixA = {
                a: matrixA.a * matrixB.a + matrixA.c * matrixB.b,
                b: matrixA.b * matrixB.a + matrixA.d * matrixB.b,
                c: matrixA.a * matrixB.c + matrixA.c * matrixB.d,
                d: matrixA.b * matrixB.c + matrixA.d * matrixB.d,
                e: matrixA.a * matrixB.e + matrixA.c * matrixB.f + matrixA.e,
                f: matrixA.b * matrixB.e + matrixA.d * matrixB.f + matrixA.f
            }
        }
        return matrixA;
    }

    static matrixTranslationInstance(x: number, y: number): IMatrix2D {
        return {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: x,
            f: y
        }
    }

    /**
     * https://github.com/Fionoble/transformation-matrix-js/blob/master/src/matrix.js
     * @param radians
     * @returns
     */
    static matrixRotationInstance(radians: number): IMatrix2D {
        const cos = Math.cos(radians), sin = Math.sin(radians);
        return {
            a: cos,
            b: sin,
            c: -sin,
            d: cos,
            e: 0,
            f: 0
        }
    }


    static transformPosition(position: Position, transform: IMatrix2D): Position {
        return [
            position[0] * transform.a + position[1] * transform.c + transform.e,
            position[0] * transform.b + position[1] * transform.d + transform.f
        ];
    }

    static clipMultiPolyline(multiPolyline: MultiLineString, bufferFeature: Feature<UnionPolygon>, maxKeepLength: number = 0): MultiLineString {

        const remainingLines: LineString[] = [];

        console.log(`clipping ${multiPolyline.coordinates.length} polylines ....`);
        multiPolyline.coordinates.forEach(polyline => {

            const polylineS: LineString = {
                type: 'LineString',
                coordinates: polyline
            };
            turf.cleanCoords(polylineS, {
                mutate: true
            });

            const splitColl = turf.lineSplit(turf.feature(polylineS), bufferFeature);
            if (splitColl.features.length > 0) {
                splitColl.features.forEach(feature => {

                    // const checkIndex = Math.floor(feature.geometry.coordinates.length / 2)
                    // const pofB = turf.midpoint(feature.geometry.coordinates[0], feature.geometry.coordinates[1])
                    const length = turf.length(feature);
                    const pofB = turf.along(feature, length / 2);
                    // const pofB = turf.pointOnFeature(feature);
                    if (turf.booleanWithin(pofB, bufferFeature) && turf.length(feature, {
                        units: 'meters'
                    }) > maxKeepLength) {
                        // dont keep
                    } else {
                        remainingLines.push(feature.geometry);
                    }

                });
            } else {
                const pofB = turf.midpoint(polylineS.coordinates[0], polylineS.coordinates[1]);
                // could be fully outside or fully inside
                if (turf.booleanWithin(pofB, bufferFeature!)) {
                    //
                } else {
                    remainingLines.push(polylineS);
                }
            }

        });
        return {
            type: 'MultiLineString',
            coordinates: remainingLines.map(c => c.coordinates)
        };

    }

    static bboxClipMultiPolygon(multiPolygon: MultiPolygon, bbox: BBox): MultiPolygon {

        const clipped = turf.bboxClip(multiPolygon, bbox);
        if (clipped.geometry.type === 'MultiPolygon') {
            const clippedPolygons = VectorTileGeometryUtil.destructureMultiPolygon(clipped.geometry);
            return VectorTileGeometryUtil.restructureMultiPolygon(clippedPolygons);
        } else if (clipped.geometry.type === 'Polygon') {
            return {
                type: 'MultiPolygon',
                coordinates: [clipped.geometry.coordinates]
            }
        } else {
            return {
                type: 'MultiPolygon',
                coordinates: []
            }
        }

    }

    static bboxClipMultiPolyline(multiPolyline: MultiLineString, bbox: BBox): MultiLineString {

        const clipped = turf.bboxClip(multiPolyline, bbox);
        if (clipped.geometry.type === 'MultiLineString') {
            const clippedPolylines = VectorTileGeometryUtil.destructureMultiPolyline(clipped.geometry);
            return VectorTileGeometryUtil.restructureMultiPolyline(clippedPolylines);
        } else if (clipped.geometry.type === 'LineString') {
            return {
                type: 'MultiLineString',
                coordinates: [clipped.geometry.coordinates]
            }
        } else {
            return {
                type: 'MultiLineString',
                coordinates: []
            }
        }

    }

    static destructureMultiPolygon(multiPolygon: MultiPolygon): Polygon[] {
        const result: Polygon[] = [];
        multiPolygon.coordinates.forEach(polygon => {
            if (polygon.length > 0) {
                result.push({
                    type: 'Polygon',
                    coordinates: polygon
                });
            }
        });
        return result;
    }

    static destructureMultiPolyline(multiLineString: MultiLineString): LineString[] {
        const result: LineString[] = [];
        multiLineString.coordinates.forEach(polyline => {
            if (polyline.length > 0) {
                result.push({
                    type: 'LineString',
                    coordinates: polyline
                });
            }
        });
        return result;
    }

    static unionPolygons(input: Polygon[]): UnionPolygon {

        if (input.length > 1) {
            const featureCollection = turf.featureCollection(input.map(p => turf.feature(p)));
            return turf.union(featureCollection)!.geometry;
        } else if (input.length === 1) {
            return input[0];
        } else {
            return {
                type: 'Polygon',
                coordinates: []
            }
        }

    }

    static unionPolylines(input: LineString[]): UnionPolyline {

        console.log('line union input', input.length);
        const overlaps: MultiLineString = {
            type: 'MultiLineString',
            coordinates: []
        }
        if (input.length > 1) {
            for (let i = 0; i < input.length - 1; i++) {

                for (let j = i + 1; j < input.length; j++) {
                    // const overlapping = turf.lineOverlap(input[i], input[j]);
                    if (turf.booleanOverlap(input[i], input[j])) {

                        // input[i].coordinates.push(...input[j].coordinates);
                        // input.splice(j, 1);

                        // turf.cleanCoords(input[i], {
                        //     mutate: true
                        // });
                        console.log('overlapping', i, j);
                        overlaps.coordinates.push(input[i].coordinates);
                        overlaps.coordinates.push(input[j].coordinates);
                        // break;
                    }

                }
                // break;

            }
            return overlaps;
            // const featureCollection = turf.featureCollection(input.map(p => turf.feature(p)));
            // return turf.union(featureCollection)!.geometry;
        } else if (input.length === 1) {
            return input[0];
        } else {
            return {
                type: 'LineString',
                coordinates: []
            }
        }

    }

    static restructureMultiPolygon(polygons: Polygon[]): MultiPolygon {
        return {
            type: 'MultiPolygon',
            coordinates: [...polygons.map(p => p.coordinates)]
        }
    }

    static restructureMultiPolyline(polylines: LineString[]): MultiLineString {
        return {
            type: 'MultiLineString',
            coordinates: [...polylines.map(p => p.coordinates)]
        }
    }

    static destructureUnionPolygon(unionPolygon: UnionPolygon): Polygon[] {

        const result: Polygon[] = [];
        if (unionPolygon.type === 'MultiPolygon') {
            unionPolygon.coordinates.forEach(coordinates => {
                result.push({
                    type: 'Polygon',
                    coordinates
                });
            });
        } else if (unionPolygon.type === 'Polygon') {
            result.push(unionPolygon);
        }
        return result;

    }

    static bufferOutAndIn(multiPolygon: MultiPolygon, ...distances: number[]): Polygon[] {

        let bufferable: UnionPolygon = multiPolygon;
        if (bufferable.coordinates.length > 0) {
            for (let i = 0; i < distances.length; i++) {
                const bufferFeature: Feature<Polygon | MultiPolygon> = turf.buffer(bufferable, distances[i], {
                    units: 'meters'
                }) as Feature<Polygon | MultiPolygon>;
                if (bufferFeature) {
                    bufferable = bufferFeature.geometry;
                } else {
                    break;
                }
            }
        }
        return VectorTileGeometryUtil.destructureUnionPolygon(bufferable);

    }

    static bufferCollect(unionPolygon: UnionPolygon, includeInput: boolean, ...distances: number[]): Polygon[] {

        const polygons: Polygon[] = [];
        if (includeInput) {
            if (unionPolygon.type === 'MultiPolygon') {
                polygons.push(...VectorTileGeometryUtil.destructureMultiPolygon(unionPolygon));
            } else {
                polygons.push(unionPolygon);
            }
        }

        let bufferable: Polygon | MultiPolygon = unionPolygon;
        if (bufferable.coordinates.length > 0) {
            for (let i = 0; i < distances.length; i++) {
                const bufferFeature: Feature<Polygon | MultiPolygon> = turf.buffer(bufferable, distances[i], {
                    units: 'meters'
                }) as Feature<Polygon | MultiPolygon>;
                if (bufferFeature) {
                    bufferable = bufferFeature.geometry;
                    if (bufferable.type === 'MultiPolygon') {
                        bufferable.coordinates.forEach(coordinates => {
                            polygons.push({
                                type: 'Polygon',
                                coordinates
                            })
                        });
                    } else if (bufferable.type === 'Polygon') {
                        polygons.push(bufferable);
                    }
                } else {
                    break;
                }
            }
        }
        return polygons;

    }

    static getMultiPolygonText(text: string, textOffset: Position): MultiPolygon {

        const coordinates: Position[][][] = [];

        const chars = Array.from(text);
        let charOffset: Position = [...textOffset];
        const scale = 0.12;

        for (let i = 0; i < chars.length; i++) {

            coordinates.push(...VectorTileGeometryUtil.getMultiPolygonChar(chars[i], scale, charOffset).coordinates);
            charOffset = VectorTileGeometryUtil.getCharOffset(chars[i], scale, textOffset, charOffset);

        }

        return {
            type: 'MultiPolygon',
            coordinates
        };

    }

    static getCharOffset(char: string, scale: number, textOffset: Position, charOffset: Position): Position {

        if (char === '\n') {
            return [
                textOffset[0],
                charOffset[1] + 50
            ];
        }

        const glyph = noto_serif_regular.glyphs[char];
        return [
            charOffset[0] + glyph.ha * scale,
            charOffset[1]
        ];

    }


    /**
     * glyph parsing as of https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/FontLoader.js
     * @param char
     * @param charOffset
     */
    static getMultiPolygonChar(char: string, scale: number, charOffset: Position): MultiPolygon {

        const coordinates: Position[][][] = [];

        if (char === '\n') {
            return {
                type: 'MultiPolygon',
                coordinates
            };
        }

        console.log('char', char);

        const glyphData = noto_serif_regular.glyphs[char]?.o;
        const glyphCommands = glyphData.split(' ');

        let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2: number;
        let d = '';
        for (let i = 0, l = glyphCommands.length; i < l;) {

            const action = glyphCommands[i++];
            if (action === 'm') {

                if (d !== '') {
                    const ringCoordinates = this.getPolygonChar(d);
                    if (!turf.booleanClockwise(ringCoordinates)) { // an outer ring
                        coordinates.push([]);
                    }
                    coordinates[coordinates.length - 1].push(ringCoordinates);
                    d = '';
                }

                x = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                y = -parseInt(glyphCommands[i++]) * scale + charOffset[1];

                d = `${d}M${x} ${y}`;

            } else if (action === 'l') {

                x = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                y = -parseInt(glyphCommands[i++]) * scale + charOffset[1];

                d = `${d}L${x} ${y}`;

            } else if (action === 'q') {

                cpx = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                cpy = -parseInt(glyphCommands[i++]) * scale + charOffset[1];
                cpx1 = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                cpy1 = -parseInt(glyphCommands[i++]) * scale + charOffset[1];

                d = `${d}Q${cpx1} ${cpy1} ${cpx} ${cpy}`;

            } else if (action === 'b') {

                cpx = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                cpy = -parseInt(glyphCommands[i++]) * scale + charOffset[1];
                cpx1 = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                cpy1 = -parseInt(glyphCommands[i++]) * scale + charOffset[1];
                cpx2 = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                cpy2 = -parseInt(glyphCommands[i++]) * scale + charOffset[1];

                d = `${d}Q${cpx1} ${cpy1} ${cpx2} ${cpy2} ${cpx} ${cpy}`;

            } else if (action === 'z') {

                const ringCoordinates = this.getPolygonChar(d);
                if (!turf.booleanClockwise(ringCoordinates)) { // an outer ring
                    coordinates.push([]);
                }
                coordinates[coordinates.length - 1].push(ringCoordinates);

            }


        }

        // console.log('char', char, 'd', d, coordinates);

        return {
            type: 'MultiPolygon',
            coordinates
        };

    }

    static getPolygonChar(d: string): Position[] {

        const svgPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        svgPathElement.setAttribute('d', d);

        const pathLength = svgPathElement.getTotalLength();
        const pathSegmts = Math.ceil(pathLength / 2); // TODO :: better segment count, maybe depending on scale
        const segmtLength = pathLength / pathSegmts;

        let pointAtLength: DOMPoint;
        const coordinates: Position[] = [];
        for (let i = 0; i <= pathSegmts; i++) {
            pointAtLength = svgPathElement.getPointAtLength(i * segmtLength);
            coordinates.push([
                pointAtLength.x,
                pointAtLength.y
            ]);
        }

        return coordinates;

    }

    static toMercator = (tileKey: IVectorTileKey, tilePos: Position = [0, 0]): Position => {
        const resolution = VectorTileKey.lods[tileKey.lod].resolution;
        const tileMeters = VectorTileKey.DIM * resolution;
        return [
            tileKey.col * tileMeters - VectorTileKey.ORI + tilePos[0] * resolution,
            VectorTileKey.ORI - tileKey.row * tileMeters - tilePos[1] * resolution
        ]
    }

    static toPolygons(vectorTileKey: IVectorTileKey, coordinates: IVectorTileCoordinate[]): Polygon[] {

        const polygons: Polygon[] = [];
        let ring: Position[];
        coordinates.forEach(coordinate => {

            if (coordinate.type === CODE____MOVE_TO) {

                // starting a new ring with the move-to coordinate as first element
                ring = [
                    turf.toWgs84(VectorTileGeometryUtil.toMercator(vectorTileKey, [coordinate.x, coordinate.y]))
                ]

            } else if (coordinate.type === CODE____LINE_TO) {

                // add to ring
                ring.push(turf.toWgs84(VectorTileGeometryUtil.toMercator(vectorTileKey, [coordinate.x, coordinate.y])));

            } else {

                // re-insert first coordinate
                ring.push(ring[0]);
                // nothing to be done in context

                const isOuter = turf.booleanClockwise(ring);
                const polygon: Polygon = {
                    type: 'Polygon',
                    coordinates: [ring]
                };

                if (isOuter) {
                    // a new outer ring
                    polygons.push(polygon);
                } else {
                    // add inner ring to current outer ring
                    polygons[polygons.length - 1].coordinates.push(ring);
                }

            }

        });
        return polygons;

    }

    static toPolylines(vectorTileKey: IVectorTileKey, coordinates: IVectorTileCoordinate[]): LineString[] {

        const polylines: LineString[] = [];
        let path: Position[] = [];

        const addPathIfHavingCoordinates = () => {
            if (path.length > 0) {
                polylines.push({
                    type: 'LineString',
                    coordinates: path
                });
            }
            path = [];
        }

        coordinates.forEach(coordinate => {

            if (coordinate.type === CODE____MOVE_TO) {

                addPathIfHavingCoordinates();
                path.push([coordinate.x, coordinate.y]);

            } else if (coordinate.type === CODE____LINE_TO) {

                // add to ring
                path.push([coordinate.x, coordinate.y]);

            } else {

                // re-insert first coordinate
                polylines.push({
                    type: 'LineString',
                    coordinates: path
                });

            }

        });
        addPathIfHavingCoordinates();

        const bbox: BBox = [
            0,
            0,
            512,
            512
        ];
        const polylinesClipped: LineString[] = [];
        let clipResult: Geometry;
        polylines.forEach(polyline => {
            clipResult = turf.bboxClip(polyline, bbox).geometry;
            if (clipResult.type === 'MultiLineString') {
                clipResult.coordinates.forEach(coordinates => {
                    polylinesClipped.push({
                        type: 'LineString',
                        coordinates
                    });
                })
            } else if (clipResult.type === 'LineString') {
                polylinesClipped.push({
                    type: 'LineString',
                    coordinates: clipResult.coordinates
                });
            }
        });

        let coordinate4326: Position;
        polylinesClipped.forEach(polyline => {
            polyline.coordinates.forEach(coordinate => {
                coordinate4326 = turf.toWgs84(VectorTileGeometryUtil.toMercator(vectorTileKey, coordinate));
                coordinate[0] = coordinate4326[0];
                coordinate[1] = coordinate4326[1];
            });
        })

        return polylinesClipped;

    }

}