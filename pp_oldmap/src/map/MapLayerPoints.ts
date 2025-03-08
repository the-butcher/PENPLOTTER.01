import * as turf from '@turf/turf';
import { BBox, Feature, MultiPolygon, Point, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";


export class MapLayerPoints extends AMapLayer<Point> {

    // points: MultiPoint;
    symbolFactory: (position: Position) => Position[]

    constructor(name: string, filter: IVectorTileFeatureFilter, symbolFactory: (position: Position) => Position[]) {
        super(name, filter);
        // this.points = {
        //     type: 'MultiPoint',
        //     coordinates: []
        // };
        this.symbolFactory = symbolFactory;
    }

    static createChurchSymbol = (coordinate4326: Position): Position[] => {

        const baseRadius = 10;
        const startRadius = - Math.PI / 2;
        const endRadius = startRadius + Math.PI * 2;

        const coordinate3857 = turf.toMercator(coordinate4326);

        const treeCoordinates3857: Position[] = [];
        treeCoordinates3857.push([
            coordinate3857[0] - baseRadius,
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2
        ]);
        treeCoordinates3857.push([
            coordinate3857[0] + baseRadius,
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2
        ]);
        treeCoordinates3857.push([
            coordinate3857[0],
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2
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

        const baseRadius = 6;
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

        const nameVal = feature.getValue('_name4')?.getValue();
        if (nameVal) {

            const nameValSplit = nameVal.toString().split(/\n/g);
            if (nameValSplit.length === 2 && nameValSplit[1].endsWith('m')) {

                // console.log('nameVal', nameValSplit[1]);

                const multiPolygonText = VectorTileGeometryUtil.getMultiPolygonText(nameValSplit[1], [
                    feature.coordinates[0].x,
                    feature.coordinates[0].y
                ]);

                let position4326: Position;
                multiPolygonText.coordinates.forEach(polygon => {
                    polygon.forEach(ring => {
                        ring.forEach(position => {
                            const position3857 = VectorTileGeometryUtil.toMercator(vectorTileKey, position);
                            position4326 = turf.toWgs84([
                                position3857[0] + 5,
                                position3857[1] + 12
                            ]);
                            position[0] = position4326[0];
                            position[1] = position4326[1];
                        })
                    });
                });

                this.polyData.coordinates.push(...multiPolygonText.coordinates);

            }

        }

    }

    async closeTile(): Promise<void> { }

    async processData(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing data ...`);

        // turf.cleanCoords(this.points, {
        //     mutate: true
        // });

        // add the lines defined by this layers symbol (TODO :: move to processLine)
        this.tileData.forEach(point => {
            this.multiPolyline010.coordinates.push(this.symbolFactory(point.coordinates));
        });

        // build polygons from the the text polygons retrieved in accept (TODO :: move away from accept)
        const coordinates010: Position[][] = this.polyData.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline010.coordinates.push(...coordinates010);

        const polygons010: Polygon[] = [];
        if (this.multiPolyline010.coordinates.length > 0) {
            const linebuffer010 = turf.buffer(this.multiPolyline010, 8, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            polygons010.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer010.geometry));
        }

        // const polygons030: Polygon[] = [];
        // if (this.multiPolyline030.coordinates.length > 0) {
        //     const linebuffer030 = turf.buffer(this.multiPolyline030, 1, {
        //         units: 'meters'
        //     }) as Feature<Polygon | MultiPolygon>;
        //     polygons030.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer030.geometry));
        // }

        // const union13 = VectorTileGeometryUtil.unionPolygons([...polygons010, ...polygons030]);
        // const polygons13 = VectorTileGeometryUtil.destructureUnionPolygon(union13);
        this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygons010);

        // // buffer around symbols lines to have base polygons
        // if (this.multiPolyline030.coordinates.length > 0) {
        //     const linebuffer030 = turf.buffer(this.multiPolyline030, 1, {
        //         units: 'meters'
        //     }) as Feature<Polygon | MultiPolygon>;
        //     polygons010.push(...VectorTileGeometryUtil.destructureUnionPolygon(linebuffer030.geometry));
        // }
        // this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygons010);
        // this.polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(this.polyData, bboxMap4326);

        this.bboxClip(bboxMap4326);
        this.cleanCoords();

        console.log(`${this.name}, done`);

    }

    async processLine(): Promise<void> {

    }


    async postProcess(): Promise<void> {

        // const polygonCount010 = 3;
        // const polygonDelta010 = Pen.getPenWidthMeters(0.10, 25000) * -0.60;

        // // TODO :: remove code duplication, all types of labels, buildings
        // const distances010: number[] = [];
        // for (let i = 0; i < polygonCount010; i++) {
        //     distances010.push(polygonDelta010);
        // }
        // console.log(`${this.name}, buffer collect 010 ...`, distances010);
        // const features010 = VectorTileGeometryUtil.bufferCollect2(this.polyData, true, ...distances010);

        // const connected010 = VectorTileGeometryUtil.connectBufferFeatures(features010);
        // this.multiPolyline010 = VectorTileGeometryUtil.restructureMultiPolyline(connected010);

    }

}