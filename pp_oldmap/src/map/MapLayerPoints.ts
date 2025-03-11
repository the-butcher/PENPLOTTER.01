import * as turf from '@turf/turf';
import { BBox, Feature, MultiPolygon, Point, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import { Pen } from './Pen';
import { ILabelledPoint } from './ILabelledPoint';
import { Map } from './Map';


export class MapLayerPoints extends AMapLayer<Point> {

    // points: MultiPoint;
    symbolFactory: (position: Position) => Position[];
    polyText: MultiPolygon;
    labelledPoints: ILabelledPoint[] = [];

    constructor(name: string, filter: IVectorTileFeatureFilter, symbolFactory: (position: Position) => Position[]) {
        super(name, filter);
        this.symbolFactory = symbolFactory;
        this.polyText = {
            type: 'MultiPolygon',
            coordinates: []
        };
    }

    static createChurchSymbol = (coordinate4326: Position): Position[] => {

        const baseRadius = 12;
        const startRadius = - Math.PI / 2;
        const endRadius = startRadius + Math.PI * 2;

        const coordinate3857 = turf.toMercator(coordinate4326);

        const treeCoordinates3857: Position[] = [];
        treeCoordinates3857.push([
            coordinate3857[0] - baseRadius,
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2.2
        ]);
        treeCoordinates3857.push([
            coordinate3857[0] + baseRadius,
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2.2
        ]);
        treeCoordinates3857.push([
            coordinate3857[0],
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2.2
        ]);
        treeCoordinates3857.push([
            coordinate3857[0],
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 3
        ]);
        for (let i = startRadius; i <= endRadius; i += Math.PI / 8) {
            treeCoordinates3857.push([
                coordinate3857[0] + Math.cos(i) * baseRadius,
                coordinate3857[1] - Math.sin(i) * baseRadius
            ]);
        }
        return treeCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857));

    }

    static createSummitSymbol = (coordinate4326: Position): Position[] => {

        const baseRadius = 12;
        const startRadius = - Math.PI / 2;
        const endRadius = startRadius + Math.PI * 2;

        const coordinate3857 = turf.toMercator(coordinate4326);

        const treeCoordinates3857: Position[] = [];
        for (let i = startRadius; i <= endRadius; i += Math.PI / 8) {
            treeCoordinates3857.push([
                coordinate3857[0] + Math.cos(i) * baseRadius,
                coordinate3857[1] - Math.sin(i) * baseRadius
            ]);
        }
        return treeCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857));

    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        // console.log('feature.getValue(_name)', feature, feature.getValue('_name4')); // GIPFEL name in _name4
        this.tileData.push(...VectorTileGeometryUtil.toPoints(vectorTileKey, feature.coordinates));

        let nameVal = feature.getValue('_name1')?.getValue();
        if (!nameVal) {
            nameVal = feature.getValue('_name4')?.getValue();
        }
        // console.log('_name1', feature.getValue('_name1')?.getValue());
        // console.log('_name2', feature.getValue('_name2')?.getValue());
        // console.log('_name3', feature.getValue('_name3')?.getValue());
        // console.log('_name4', feature.getValue('_name4')?.getValue());
        if (nameVal) {


            const nameValSplit = nameVal.toString().split(/\n/g);
            if (nameValSplit.length === 2 && nameValSplit[1].endsWith('m')) {

                // console.log('nameVal', nameValSplit[1]);
                const position3857 = VectorTileGeometryUtil.toMercator(vectorTileKey, [
                    feature.coordinates[0].x,
                    feature.coordinates[0].y
                ]);
                const position4326 = turf.toWgs84(position3857);
                this.labelledPoints.push({
                    name: nameValSplit[1],
                    position4326
                });
                console.log('position4326', position4326);

            }

        }

    }

    async closeTile(): Promise<void> { }

    async processPoly(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing data ...`);

        // remove duplicates
        this.tileData.sort((a, b) => (a.coordinates[0] - b.coordinates[0]) * 10000 + a.coordinates[1] - b.coordinates[1]);
        let refPosition: Position = [-1, -1];
        const _tileData: Point[] = [];
        for (let i = 0; i < this.tileData.length; i++) {
            if (turf.distance(refPosition, this.tileData[i].coordinates, {
                units: 'meters'
            }) > 1) {
                _tileData.push(this.tileData[i]);
                refPosition = this.tileData[i].coordinates;
            }
        }
        this.tileData = _tileData;

        this.tileData.forEach(point => {
            if (VectorTileGeometryUtil.booleanWithin(bboxMap4326, point.coordinates)) {
                this.multiPolyline005.coordinates.push(this.symbolFactory(point.coordinates));
            }
        });

        this.labelledPoints.forEach(labelledPoint => {

            if (VectorTileGeometryUtil.booleanWithin(bboxMap4326, labelledPoint.position4326)) {

                const labelCoordinate3857A = turf.toMercator(labelledPoint.position4326);
                const scale = 0.03;
                const chars = Array.from(labelledPoint.name);
                const zeroOffset: Position = [0, 0];
                let charOffset: Position = [0, 0];
                for (let i = 0; i < chars.length; i++) {

                    let charCoordinates = VectorTileGeometryUtil.getMultiPolygonChar(chars[i], scale, charOffset).coordinates;
                    charOffset = VectorTileGeometryUtil.getCharOffset(chars[i], scale, zeroOffset, charOffset);

                    const angle = 0; //Math.atan2(labelCoordinate3857B[1] - labelCoordinate3857A[1], labelCoordinate3857B[0] - labelCoordinate3857A[0]);
                    const matrixA = VectorTileGeometryUtil.matrixRotationInstance(-angle);
                    const matrixB = VectorTileGeometryUtil.matrixTranslationInstance(12, -12);
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

                    // this.polyData.coordinates.push(...charCoordinates);
                    this.polyText.coordinates.push(...charCoordinates);

                }

            }

        });

        // build polygons from the the text polygons retrieved in accept
        const coordinates005: Position[][] = this.polyText.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline005.coordinates.push(...coordinates005);

        const bufferDist = 8;
        // buffer around symbols
        let bufferPolygons: Polygon[] = [];
        if (this.multiPolyline005.coordinates.length > 0) {
            const linebuffer005 = turf.buffer(this.multiPolyline005, bufferDist, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            bufferPolygons.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer005.geometry));
        }

        // buffer around text polygons
        if (this.polyText.coordinates.length > 0) {
            const polyTextBuffer = turf.buffer(this.polyText, bufferDist, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            bufferPolygons.push(...VectorTileGeometryUtil.destructureUnionPolygon(polyTextBuffer.geometry));
        }

        if (bufferPolygons.length > 0) {
            const bufferUnion = VectorTileGeometryUtil.unionPolygons(bufferPolygons);
            bufferPolygons = VectorTileGeometryUtil.destructureUnionPolygon(bufferUnion);
            this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(bufferPolygons);
        }

        this.bboxClip(bboxMap4326);
        this.cleanCoords();

    }

    async processLine(): Promise<void> {


    }


    async postProcess(): Promise<void> {

        const polygonCount005 = 3;
        const polygonDelta005 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.60;

        // TODO :: remove code duplication
        const distances005: number[] = [];
        for (let i = 0; i < polygonCount005; i++) {
            distances005.push(polygonDelta005);
        }
        console.log(`${this.name}, buffer collect 010 ...`, distances005);
        const features005 = VectorTileGeometryUtil.bufferCollect2(this.polyText, true, ...distances005);

        const connected005A = VectorTileGeometryUtil.connectBufferFeatures(features005);
        const connected005B = VectorTileGeometryUtil.restructureMultiPolyline(connected005A);
        this.multiPolyline005.coordinates.push(...connected005B.coordinates);

    }

}