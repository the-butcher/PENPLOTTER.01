import { Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";

export class MapLayerLabels extends AMapLayer {

    hasTestText = false;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
    }

    async openTile(): Promise<void> { }

    async accept(_vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {


        if (feature.valueLookup.hasKey('_name')) { // && !this.hasTestText

            const nameKey = feature.valueLookup.getKeyPointer('_name');
            const nameVal = feature.valueLookup.getValue(nameKey)?.getValue() as string;

            const symbKey = feature.valueLookup.getKeyPointer('_label_class');
            const symbVal = feature.valueLookup.getValue(symbKey)?.getValue() as number;
            console.log('nameVal', nameVal, 'symbVal', symbVal);

            // // const multiPolygonText = VectorTileGeometryUtil.getMultiPolygonText(nameVal, [
            // //     feature.coordinates[0].x,
            // //     feature.coordinates[0].y
            // // ]);
            // let multiPolygonText = VectorTileGeometryUtil.getMultiPolygonText(nameVal, [
            //     0,
            //     0
            // ]);

            // const matrix = VectorTileGeometryUtil.matrixMultiply(VectorTileGeometryUtil.matrixTranslationInstance(2000, 750), VectorTileGeometryUtil.matrixRotationInstance(0.95));
            // multiPolygonText = VectorTileGeometryUtil.transformMultiPolygon(multiPolygonText, matrix);

            // let position4326: Position;
            // multiPolygonText.coordinates.forEach(polygon => {
            //     polygon.forEach(ring => {
            //         ring.forEach(position => {
            //             position4326 = turf.toWgs84(VectorTileGeometryUtil.toMercator(vectorTileKey, position));
            //             position[0] = position4326[0];
            //             position[1] = position4326[1];
            //         })
            //     });
            // });

            // this.multiPolygon.coordinates.push(...multiPolygonText.coordinates);

            // this.hasTestText = true;

        }

    }

    async closeTile(): Promise<void> { }

    async process(): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing ...`);

        const distances: number[] = [];
        for (let i = 0; i < 20; i++) {
            distances.push(-3);
        }

        const polygonsB: Polygon[] = VectorTileGeometryUtil.bufferCollect(this.multiPolygon, ...distances);

        // rebuild from polygonsB
        const coordinatesB: Position[][][] = [];
        const coordinatesC: Position[][] = [];
        polygonsB.forEach(polygonB => {
            coordinatesB.push(polygonB.coordinates);
            coordinatesC.push(...polygonB.coordinates)
        });
        this.multiPolygon = {
            type: 'MultiPolygon',
            coordinates: coordinatesB
        }
        this.multiPolyline030 = {
            type: 'MultiLineString',
            coordinates: coordinatesC
        }

        console.log(`${this.name}, done`);

    }

}