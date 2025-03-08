import * as turf from '@turf/turf';
import { Point, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";

export class MapLayerLabels extends AMapLayer<Point> {

    hasTestText = false;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        if (vectorTileKey.lod === 15) { //

            // console.log('_name21', feature.getValue('_name21')?.getValue(), '_label_class21', feature.getValue('_label_class21')?.getValue(), _vectorTileKey.lod);
            for (let i = 1; i < 28; i++) {

                const nameVal = feature.getValue('_name' + i)?.getValue();
                if (nameVal) {

                    console.log('nameVal', nameVal);

                    const multiPolygonText = VectorTileGeometryUtil.getMultiPolygonText(nameVal.toString(), [
                        feature.coordinates[0].x,
                        feature.coordinates[0].y
                    ]);

                    let position4326: Position;
                    multiPolygonText.coordinates.forEach(polygon => {
                        polygon.forEach(ring => {
                            ring.forEach(position => {
                                position4326 = turf.toWgs84(VectorTileGeometryUtil.toMercator(vectorTileKey, position));
                                position[0] = position4326[0];
                                position[1] = position4326[1];
                            })
                        });
                    });

                    this.polyData.coordinates.push(...multiPolygonText.coordinates);

                }

            }

        }


    }

    async closeTile(): Promise<void> { }

    async processData(): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing ...`);

        const distances: number[] = [];
        for (let i = 0; i < 20; i++) {
            distances.push(-1);
        }

        const polygonsB: Polygon[] = VectorTileGeometryUtil.bufferCollect(this.polyData, true, ...distances);

        // rebuild from polygonsB
        const coordinatesB: Position[][][] = [];
        const coordinatesC: Position[][] = [];
        polygonsB.forEach(polygonB => {
            coordinatesB.push(polygonB.coordinates);
            coordinatesC.push(...polygonB.coordinates)
        });
        this.polyData = {
            type: 'MultiPolygon',
            coordinates: coordinatesB
        }
        this.multiPolyline010 = {
            type: 'MultiLineString',
            coordinates: coordinatesC
        }

        console.log(`${this.name}, done`);

    }

    async processLine(): Promise<void> {

    }


    async postProcess(): Promise<void> {
        // TODO :: buffer fill similar to buildings
    }

}