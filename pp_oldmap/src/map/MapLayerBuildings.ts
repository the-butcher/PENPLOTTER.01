import * as turf from '@turf/turf';
import { BBox, Polygon } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import { Pen } from './Pen';
import { Map } from './Map';


export class MapLayerBuildings extends AMapLayer<Polygon> {

    polygons: Polygon[];

    static minArea = 25;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.polygons = [];
    }

    async openTile(): Promise<void> {
        this.polygons = [];
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {
        const polygons = VectorTileGeometryUtil.toPolygons(vectorTileKey, feature.coordinates).filter(p => Math.abs(turf.area(p)) > MapLayerBuildings.minArea);
        this.polygons.push(...polygons);
    }

    async closeTile(): Promise<void> {

        if (this.polygons.length > 1) {

            // union of this tiles polygons (faster processing on the full map later on)
            const collA = turf.featureCollection(this.polygons.map(p => turf.feature(p)));
            const unionA = turf.union(collA)!;
            if (unionA.geometry.type === 'MultiPolygon') {
                unionA.geometry.coordinates.forEach(coordinates => {
                    this.polyData.coordinates.push(coordinates);
                });
            } else if (unionA.geometry.type === 'Polygon') {
                this.polyData.coordinates.push(unionA.geometry.coordinates);
            }

        } else {
            this.polygons.forEach(polygon => {
                this.polyData.coordinates.push(polygon.coordinates);
            })
        }

    }

    async processData(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing data ...`);

        turf.simplify(this.polyData, {
            mutate: true,
            tolerance: 0.000012,
            highQuality: true
        });
        turf.cleanCoords(this.polyData);

        console.log(`${this.name}, clipping to bboxClp4326 ...`);
        this.polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(this.polyData, bboxClp4326);

        // get outer rings, all holes removed
        let polygons010 = VectorTileGeometryUtil.destructureMultiPolygon(this.polyData);
        polygons010.forEach(polygonO => {
            polygonO.coordinates = polygonO.coordinates.slice(0, 1);
        });
        let multiPolygonO = VectorTileGeometryUtil.restructureMultiPolygon(polygons010);

        // get inner ring reversed, act like real polygons temporarily
        let polygonsI: Polygon[] = VectorTileGeometryUtil.destructureMultiPolygon(this.polyData);
        const polygonsIFlat: Polygon[] = [];
        polygonsI.forEach(polygonI => {
            polygonI.coordinates.slice(1).forEach(hole => {
                polygonsIFlat.push({
                    type: 'Polygon',
                    coordinates: [hole.reverse()]
                });
            })
        });
        polygonsIFlat.forEach(polygonI => {
            turf.rewind(polygonI, {
                mutate: true
            });
        });
        let multiPolygonI = VectorTileGeometryUtil.restructureMultiPolygon(polygonsIFlat);

        console.log(`${this.name}, clipping to bboxClp4326 (1) ...`);
        multiPolygonO = VectorTileGeometryUtil.bboxClipMultiPolygon(multiPolygonO, bboxClp4326);
        console.log(`${this.name}, clipping to bboxClp4326 (2) ...`);
        this.polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(this.polyData, bboxClp4326);

        // let the polygons be a litte smaller than original to account for pen width
        const inout0 = 0;
        const polygonInset = -2;

        // outer polygon inset (to account for pen width)
        const inoutO: number[] = [inout0, polygonInset - inout0];
        console.log(`${this.name}, buffer in-out [${inoutO[0]}, ${inoutO[1]}] ...`);
        polygons010 = VectorTileGeometryUtil.bufferOutAndIn(multiPolygonO, ...inoutO);
        multiPolygonO = VectorTileGeometryUtil.restructureMultiPolygon(polygons010);

        const inoutI: number[] = [polygonInset - inout0, inout0];
        console.log(`${this.name}, buffer in-out [${inoutI[0]}, ${inoutI[1]}] ...`);
        polygonsI = VectorTileGeometryUtil.bufferOutAndIn(multiPolygonI, ...inoutI).filter(i => turf.area(i) > MapLayerBuildings.minArea);
        multiPolygonI = VectorTileGeometryUtil.restructureMultiPolygon(polygonsI);

        if (multiPolygonO.coordinates.length > 0 && multiPolygonI.coordinates.length) {

            const featureO = turf.feature(multiPolygonO);
            const featureI = turf.feature(multiPolygonI);
            const featureC = turf.featureCollection([featureO, featureI]);

            console.log(`${this.name}, reapplying holes ...`);
            const difference = turf.difference(featureC)!.geometry; // subtract inner polygons from outer
            const polygonsD = VectorTileGeometryUtil.destructureUnionPolygon(difference);
            this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsD);

        }

        console.log(`${this.name}, clipping to bboxMap4326 ...`);
        this.polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(this.polyData, bboxMap4326);

        // another very small in-out removes artifacts at the bounding box edges
        const inoutA: number[] = [-0.11, 0.1];
        console.log(`${this.name}, buffer in-out [${inoutA[0]}, ${inoutA[1]}] ...`);
        const polygonsA1 = VectorTileGeometryUtil.bufferOutAndIn(this.polyData, ...inoutA);
        this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA1);

    }

    async processLine(): Promise<void> {

        // do nothing, lines are only built after clipping this layer

    }


    async postProcess(): Promise<void> {

        const polygonCount010 = 3;
        const polygonCount030 = 50;
        const polygonDelta010 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.60;
        const polygonDelta030 = Pen.getPenWidthMeters(0.20, Map.SCALE) * -0.60;

        // thinner rings for better edge precision
        const distances010: number[] = [];
        for (let i = 0; i < polygonCount010; i++) {
            distances010.push(polygonDelta010);
        }
        console.log(`${this.name}, buffer collect 010 ...`, distances010);
        const features010 = VectorTileGeometryUtil.bufferCollect2(this.polyData, true, ...distances010);

        const distances030: number[] = [polygonDelta030 * 2.00]; // let the first ring be well inside the finer rings
        for (let i = 0; i < polygonCount030; i++) {
            distances030.push(polygonDelta030);
        }
        console.log(`${this.name}, buffer collect 030 ...`, distances030);
        const features030 = VectorTileGeometryUtil.bufferCollect2(this.polyData, false, ...distances030);

        const connected010 = VectorTileGeometryUtil.connectBufferFeatures(features010);
        this.multiPolyline010 = VectorTileGeometryUtil.restructureMultiPolyline(connected010);

        const connected030 = VectorTileGeometryUtil.connectBufferFeatures(features030);
        this.multiPolyline030 = VectorTileGeometryUtil.restructureMultiPolyline(connected030);

        this.cleanCoords();

    }

}