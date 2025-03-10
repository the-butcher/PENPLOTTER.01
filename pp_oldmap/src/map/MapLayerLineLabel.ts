import * as turf from '@turf/turf';
import { BBox, Feature, LineString, MultiLineString, MultiPolygon, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import { Pen } from "./Pen";
import { ILabelDef } from './ILabelDef';
import { Map } from './Map';

export class MapLayerLineLabel extends AMapLayer<LineString> {

    linesByName: { [K: string]: MultiLineString } = {};
    polyText: MultiPolygon;
    labelDefs: ILabelDef[];

    constructor(name: string, filter: IVectorTileFeatureFilter, labelDefs: ILabelDef[]) {
        super(name, filter);
        this.labelDefs = labelDefs;
        this.polyText = {
            type: 'MultiPolygon',
            coordinates: []
        };
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        // console.log(feature.hasValue('_name'), feature);

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        if (feature.hasValue('_name')) { //  && feature.hasValue('_label_class', 4, 5)

            let name = feature.getValue('_name')!.getValue()!.toString();
            console.log('name', name, feature.getValue('_label_class'));

            for (let i = 0; i < this.labelDefs.length; i++) {
                if (this.labelDefs[i].tileName === name) {
                    name = this.labelDefs[i].plotName;
                }
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

            const connectedLinesA = VectorTileGeometryUtil.connectMultiPolyline(this.linesByName[lineName], 5);
            const connectedLinesB = VectorTileGeometryUtil.destructureMultiPolyline(connectedLinesA);

            if (connectedLinesB.length > 0) {

                for (let a = 0; a < connectedLinesB.length; a++) {

                    let labelDef: ILabelDef = {
                        tileName: lineName,
                        plotName: lineName,
                        distance: 0.50,
                        vertical: 12,
                        charsign: 0,
                        txtscale: 0.022,
                        idxvalid: () => true
                    };
                    for (let i = 0; i < this.labelDefs.length; i++) {
                        if (this.labelDefs[i].plotName === lineName) {
                            labelDef = this.labelDefs[i];
                            break;
                        }
                    }

                    if (!labelDef.idxvalid(a)) {
                        continue;
                    }

                    const labelLine = connectedLinesB[a]; // turf.bboxClip(connectedLinesB[a], bboxMap4326).geometry as LineString;
                    console.log('labelLine', labelLine);
                    turf.cleanCoords(labelLine, {
                        mutate: true
                    });
                    const labelLineLength = turf.length(turf.feature(labelLine), {
                        units: 'meters'
                    });
                    if (labelLineLength === 0) {
                        continue; // next
                    }

                    let labelLinePositionA = labelLineLength * labelDef.distance;
                    let labelCoordinate4326A = turf.along(labelLine, labelLinePositionA, {
                        units: 'meters'
                    }).geometry.coordinates;
                    let labelCoordinate3857A = turf.toMercator(labelCoordinate4326A);

                    const scale = labelDef.txtscale;
                    const chars = Array.from(labelDef.plotName);
                    const zeroOffset: Position = [0, 0];
                    for (let i = 0; i < chars.length; i++) {

                        let charCoordinates = VectorTileGeometryUtil.getMultiPolygonChar(chars[i], scale, zeroOffset).coordinates;
                        const charOffset = VectorTileGeometryUtil.getCharOffset(chars[i], scale, zeroOffset, zeroOffset);

                        if (labelDef.charsign === 0) { // auto
                            const labelLinePositionT = labelLinePositionA + charOffset[0];
                            const labelCoordinate4326T = turf.along(labelLine, labelLinePositionT, {
                                units: 'meters'
                            }).geometry.coordinates;
                            const labelCoordinate3857T = turf.toMercator(labelCoordinate4326T);
                            const angleT = Math.atan2(labelCoordinate3857T[1] - labelCoordinate3857A[1], labelCoordinate3857T[0] - labelCoordinate3857A[0]);
                            console.log(labelDef.plotName, angleT * 180 / Math.PI)
                            if (Math.abs(angleT) > Math.PI / 2) {
                                labelDef.charsign = -1;
                            } else {
                                labelDef.charsign = 1;
                            }
                        }

                        const labelLinePositionB = labelLinePositionA + charOffset[0] * labelDef.charsign;
                        if (labelLinePositionB < 0 || labelLinePositionB > labelLineLength) {
                            break;
                        }
                        const labelCoordinate4326B = turf.along(labelLine, labelLinePositionB, {
                            units: 'meters'
                        }).geometry.coordinates;
                        const labelCoordinate3857B = turf.toMercator(labelCoordinate4326B);

                        const angle = Math.atan2(labelCoordinate3857B[1] - labelCoordinate3857A[1], labelCoordinate3857B[0] - labelCoordinate3857A[0]);
                        const matrixA = VectorTileGeometryUtil.matrixRotationInstance(-angle);
                        const matrixB = VectorTileGeometryUtil.matrixTranslationInstance(0, labelDef.vertical);
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

                        this.polyText.coordinates.push(...charCoordinates);

                    }

                }

            }

        }

        this.polyText = VectorTileGeometryUtil.bboxClipMultiPolygon(this.polyText, bboxMap4326);

    }

    async processLine(): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const coordinates005: Position[][] = this.polyText.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline005.coordinates.push(...coordinates005);

        const polyTextBufferPolygons: Polygon[] = [];
        if (this.polyText.coordinates.length > 0) {
            const polyTextBuffer = turf.buffer(this.polyText, 8, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            polyTextBufferPolygons.push(...VectorTileGeometryUtil.destructureUnionPolygon(polyTextBuffer.geometry));
        }

        this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polyTextBufferPolygons);

    }

    async postProcess(): Promise<void> {

        // console.log(`${this.name}, connecting polylines ...`, this.linesByName);

        const polygonCount005 = 3;
        const polygonDelta005 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.60;

        // TODO :: remove code duplication
        const distances005: number[] = [];
        for (let i = 0; i < polygonCount005; i++) {
            distances005.push(polygonDelta005);
        }
        console.log(`${this.name}, buffer collect 010 ...`, distances005);
        const features005 = VectorTileGeometryUtil.bufferCollect2(this.polyText, true, ...distances005);

        const connected005 = VectorTileGeometryUtil.connectBufferFeatures(features005);
        this.multiPolyline005 = VectorTileGeometryUtil.restructureMultiPolyline(connected005);



        //
        // this.connectPolylines(2);

    }

}