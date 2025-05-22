import * as turf from '@turf/turf';
import { BBox, Geometry, LineString, Point, Polygon, Position } from "geojson";
import { CODE____LINE_TO, CODE____MOVE_TO, IVectorTileCoordinate } from "../protobuf/vectortile/geometry/IVectorTileCoordinate";
import { IVectorTileKey } from "./IVectorTileKey";
import { VectorTileKey } from "./VectorTileKey";

export class VectorTileGeometryUtil {

    // static clipMultiPolyline2(multiPolyline: MultiLineString, bufferFeature: Feature<UnionPolygon>): MultiLineString {

    //     const remainingLines: LineString[] = [];

    //     // console.log(`clipping ${multiPolyline.coordinates.length} polylines ...`);
    //     multiPolyline.coordinates.forEach(polyline => {

    //         const polylineS: LineString = {
    //             type: 'LineString',
    //             coordinates: polyline
    //         };
    //         VectorTileGeometryUtil.cleanAndSimplify(polylineS);

    //         const splitColl1 = turf.lineSplit(turf.feature(polylineS), bufferFeature);
    //         if (splitColl1.features.length > 0) {

    //             splitColl1.features.forEach(splitFeature1 => {

    //                 // const length1 = turf.length(splitFeature1, {
    //                 //     units: 'meters'
    //                 // });
    //                 // console.log('length1', length1);

    //                 // const splitColl2 = turf.lineSplit(splitFeature1, bufferFeature);

    //                 // if (splitColl2.features.length > 0) {

    //                 //     splitColl2.features.forEach(splitFeature2 => {

    //                 //         // const checkIndex = Math.floor(feature.geometry.coordinates.length / 2)
    //                 //         // const pofB = turf.midpoint(feature.geometry.coordinates[0], feature.geometry.coordinates[1])
    //                 //         const length2 = turf.length(splitFeature2, {
    //                 //             units: 'meters'
    //                 //         });
    //                 //         if (length2 > 0.0000000001) {
    //                 //             console.log('length2', length2);
    //                 //             const pofB = turf.along(splitFeature2, length2 / 2, {
    //                 //                 units: 'meters'
    //                 //             });
    //                 //             // const pofB = turf.pointOnFeature(feature);
    //                 //             if (turf.booleanWithin(pofB, bufferFeature)) { //  && turf.length(feature, { units: 'meters' }) > maxKeepLength
    //                 //                 // dont keep
    //                 //             } else {
    //                 //                 remainingLines.push(splitFeature2.geometry);
    //                 //             }
    //                 //         }

    //                 //     });

    //                 // } else {

    //                 const length1 = turf.length(splitFeature1, {
    //                     units: 'meters'
    //                 });
    //                 const pofB = turf.along(splitFeature1, length1 / 2, {
    //                     units: 'meters'
    //                 });
    //                 // const pofB = turf.pointOnFeature(feature);
    //                 if (turf.booleanWithin(pofB, bufferFeature)) { //  && turf.length(feature, { units: 'meters' }) > maxKeepLength
    //                     // dont keep
    //                 } else {
    //                     remainingLines.push(splitFeature1.geometry);
    //                 }

    //                 // }



    //             });

    //         } else {

    //             const pofB = turf.midpoint(polylineS.coordinates[0], polylineS.coordinates[1]);
    //             // could be fully outside or fully inside
    //             if (turf.booleanWithin(pofB, bufferFeature!)) {
    //                 // dont keep
    //             } else {
    //                 remainingLines.push(polylineS);
    //             }
    //         }

    //     });
    //     return {
    //         type: 'MultiLineString',
    //         coordinates: remainingLines.map(c => c.coordinates)
    //     };

    // }

    static toMercator = (tileKey: IVectorTileKey, tilePos: Position = [0, 0]): Position => {
        const resolution = VectorTileKey.lods[tileKey.lod].resolution;
        const tileMeters = VectorTileKey.DIM * resolution;
        return [
            tileKey.col * tileMeters - VectorTileKey.ORI + tilePos[0] * resolution,
            VectorTileKey.ORI - tileKey.row * tileMeters - tilePos[1] * resolution
        ]
    }

    /**
     * parses a set of coordinates in vector-tile-space (0/512) to geojson polygons in EPSG:4326 coordinate space
     * @param tileKey
     * @param coordinates
     * @returns
     */
    static toPolygons(tileKey: IVectorTileKey, coordinates: IVectorTileCoordinate[]): Polygon[] {

        const polygons: Polygon[] = [];
        let ring: Position[];
        coordinates.forEach(coordinate => {

            if (coordinate.type === CODE____MOVE_TO) {

                // starting a new ring with the move-to coordinate as first element
                ring = [
                    turf.toWgs84(VectorTileGeometryUtil.toMercator(tileKey, [coordinate.x, coordinate.y]))
                ]

            } else if (coordinate.type === CODE____LINE_TO) {

                // add to ring
                ring.push(turf.toWgs84(VectorTileGeometryUtil.toMercator(tileKey, [coordinate.x, coordinate.y])));

            } else {

                // re-insert first coordinate
                ring.push(ring[0]);

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

    /**
     * parses a set of coordinates in vector-tile-space (0/512) to geojson positions in EPSG:4326 coordinate space
     * @param tileKey
     * @param coordinates
     * @returns
     */
    static toPoints(tileKey: IVectorTileKey, coordinates: IVectorTileCoordinate[]): Point[] {

        const points: Point[] = [];
        coordinates.forEach(coordinate => {
            const coordinates = turf.toWgs84(VectorTileGeometryUtil.toMercator(tileKey, [coordinate.x, coordinate.y]));
            points.push({
                type: 'Point',
                coordinates
            });
        });
        return points;

    }

    /**
     * parses a set of coordinates in vector-tile coordinate space (0/512) to geojson lines in EPSG:4326 coordinate space
     * lines are clipped to polygon boundaries because it has shown to be complex to reliably find overlap between lines
     * @param tileKey
     * @param coordinates
     * @returns
     */
    static toPolylines(tileKey: IVectorTileKey, coordinates: IVectorTileCoordinate[]): LineString[] {

        const result: LineString[] = [];
        let path: Position[] = [];

        const addPathIfHavingCoordinates = () => {
            if (path.length > 0) {
                result.push({
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
                result.push({
                    type: 'LineString',
                    coordinates: path
                });

            }

        });
        addPathIfHavingCoordinates();

        const bbox: BBox = [
            0,
            0,
            VectorTileKey.DIM,
            VectorTileKey.DIM
        ];
        const polylinesClipped: LineString[] = [];
        let clipResult: Geometry;
        result.forEach(polyline => {
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
                coordinate4326 = turf.toWgs84(VectorTileGeometryUtil.toMercator(tileKey, coordinate));
                coordinate[0] = coordinate4326[0];
                coordinate[1] = coordinate4326[1];
            });
        })

        return polylinesClipped;

    }

}