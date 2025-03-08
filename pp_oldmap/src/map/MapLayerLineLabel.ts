import * as turf from '@turf/turf';
import { BBox, LineString, MultiLineString, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import { Pen } from "./Pen";

export class MapLayerLineLabel extends AMapLayer<LineString> {

    linesByName: {[K:string]: MultiLineString} = {};

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        if (feature.hasValue('_name') && feature.hasValue('_label_class', 4, 5)) {
            let name = feature.getValue('_name')!.getValue()!.toString();

            if (name.startsWith('Taugl')) {
                name = 'Taugl';
            }

            // console.log('name', name);
            if (!this.linesByName[name]) {
                this.linesByName[name] = {
                    type: 'MultiLineString',
                    coordinates: []
                };
            }
            this.linesByName[name].coordinates.push(...polylines.map(p => p.coordinates));
        }

    }

    async closeTile(): Promise<void> { }

    async processData(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        for (const lineName in this.linesByName) {

            const connectedLines =  VectorTileGeometryUtil.connectMultiPolyline(this.linesByName[lineName], 5);

            if (connectedLines.coordinates.length === 1) {

                const lengthPos = lineName.startsWith('Taugl') ? 0.42 : 0.55
                const labelLine = turf.bboxClip(VectorTileGeometryUtil.destructureMultiPolyline(connectedLines)[0], bboxMap4326).geometry as LineString;
                let labelLinePositionA = turf.length(turf.feature(labelLine), {
                    units: 'meters'
                }) * lengthPos;
                let labelCoordinate4326A = turf.along(labelLine, labelLinePositionA, {
                    units: 'meters'
                }).geometry.coordinates;
                let labelCoordinate3857A = turf.toMercator(labelCoordinate4326A);

                const scale = 0.04;
                const chars = Array.from(lineName);
                const zeroOffset: Position = [0, 0];
                for (let i = 0; i < chars.length; i++) {

                    let charCoordinates = VectorTileGeometryUtil.getMultiPolygonChar(chars[i], scale, zeroOffset).coordinates;
                    const charOffset = VectorTileGeometryUtil.getCharOffset(chars[i], scale, zeroOffset, zeroOffset);

                    // the sign in this expression effectively determines text-direction, since it affects the angle
                    const labelLinePositionB = labelLinePositionA - charOffset[0];
                    const labelCoordinate4326B = turf.along(labelLine, labelLinePositionB, {
                        units: 'meters'
                    }).geometry.coordinates;
                    const labelCoordinate3857B = turf.toMercator(labelCoordinate4326B);

                    const angle = Math.atan2(labelCoordinate3857B[1] - labelCoordinate3857A[1], labelCoordinate3857B[0] - labelCoordinate3857A[0]);
                    const matrixA = VectorTileGeometryUtil.matrixRotationInstance(-angle);
                    const matrixB = VectorTileGeometryUtil.matrixTranslationInstance(0, 25);
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

                    labelLinePositionA = labelLinePositionB;
                    labelCoordinate4326A = labelCoordinate4326B;
                    labelCoordinate3857A = labelCoordinate3857B;

                    this.polyData.coordinates.push(...charCoordinates);

                }

            }

        }

        console.log(`${this.name}, done`);

    }

    async processLine(): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const coordinates005: Position[][] = this.polyData.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline005.coordinates.push(...coordinates005);

        console.log(`${this.name}, done`);

    }

    async postProcess(): Promise<void> {

        // console.log(`${this.name}, connecting polylines ...`, this.linesByName);

        const polygonCount005 = 3;
        const polygonDelta005 = Pen.getPenWidthMeters(0.10, 25000) * -0.60;

        // TODO :: remove code duplication
        const distances005: number[] = [];
        for (let i = 0; i < polygonCount005; i++) {
            distances005.push(polygonDelta005);
        }
        console.log(`${this.name}, buffer collect 010 ...`, distances005);
        const features005 = VectorTileGeometryUtil.bufferCollect2(this.polyData, true, ...distances005);

        const connected005 = VectorTileGeometryUtil.connectBufferFeatures(features005);
        this.multiPolyline005 = VectorTileGeometryUtil.restructureMultiPolyline(connected005);

        //
        // this.connectPolylines(2);

    }

}