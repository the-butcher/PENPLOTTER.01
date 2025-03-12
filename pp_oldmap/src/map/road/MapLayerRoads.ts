import * as turf from '@turf/turf';
import { BBox, LineString, MultiLineString, Polygon } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerLineInputRoad } from './IWorkerLineInputRoad';
import { IWorkerPolyOutputRoad } from './IWorkerPolyOutputRoad';

export class MapLayerRoads extends AMapLayer<LineString> {

    multiPolyline02: MultiLineString;
    multiPolyline34: MultiLineString;
    multiPolyline56: MultiLineString;
    multiPolyline78: MultiLineString;

    polygons02: Polygon[];
    polygons34: Polygon[];
    polygons56: Polygon[];
    polygons78: Polygon[];

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.multiPolyline02 = {
            type: 'MultiLineString',
            coordinates: []
        };
        this.multiPolyline34 = {
            type: 'MultiLineString',
            coordinates: []
        };
        this.multiPolyline56 = {
            type: 'MultiLineString',
            coordinates: []
        };
        this.multiPolyline78 = {
            type: 'MultiLineString',
            coordinates: []
        };
        this.polygons02 = [];
        this.polygons34 = [];
        this.polygons56 = [];
        this.polygons78 = [];
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        const symbolValue = feature.getValue('_symbol')?.getValue() as number;

        polylines.forEach(polyline => {
            this.tileData.push(turf.feature(polyline, {
                lod: vectorTileKey.lod,
                col: vectorTileKey.col,
                row: vectorTileKey.row,
                symbol: symbolValue
            }));
        });

    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        const workerInput: IWorkerPolyInput<LineString> = {
            name: this.name,
            tileData: this.tileData,
            outin: [3, -3],
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve) => { // , reject
            const workerInstance = new Worker(new URL('./worker_poly_l______road.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerPolyOutputRoad = e.data;
                this.polyData = workerOutput.polyData;
                this.multiPolyline02 = workerOutput.multiPolyline02;
                this.multiPolyline34 = workerOutput.multiPolyline34;
                this.multiPolyline56 = workerOutput.multiPolyline56;
                this.multiPolyline78 = workerOutput.multiPolyline78;
                this.polygons02 = workerOutput.polygons02;
                this.polygons34 = workerOutput.polygons34;
                this.polygons56 = workerOutput.polygons56;
                this.polygons78 = workerOutput.polygons78;
                resolve();
            };
            workerInstance.postMessage(workerInput);
        });

    }

    async processLine(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const workerInput: IWorkerLineInputRoad = {
            name: this.name,
            tileData: this.tileData,
            polyData: this.polyData,
            bboxClp4326,
            bboxMap4326,
            polygons02: this.polygons02,
            polygons34: this.polygons34,
            polygons56: this.polygons56,
            polygons78: this.polygons78,
            multiPolyline78: this.multiPolyline78
        };

        return new Promise((resolve) => { // , reject
            const workerInstance = new Worker(new URL('./worker_line_l______road.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                this.applyWorkerOutputLine(e.data);
                resolve();
            };
            workerInstance.postMessage(workerInput);
        });

        // const multiPolygon02 = VectorTileGeometryUtil.restructureMultiPolygon(this.polygons02);
        // const multiPolygon34 = VectorTileGeometryUtil.restructureMultiPolygon(this.polygons34);
        // const multiPolygon56 = VectorTileGeometryUtil.restructureMultiPolygon(this.polygons56);

        // const coordinates02: Position[][] = multiPolygon02.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        // const multiOutline02: MultiLineString = {
        //     type: 'MultiLineString',
        //     coordinates: coordinates02
        // };

        // const coordinates34: Position[][] = multiPolygon34.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        // let multiOutline34: MultiLineString = {
        //     type: 'MultiLineString',
        //     coordinates: coordinates34
        // };

        // const coordinates56: Position[][] = multiPolygon56.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        // let multiOutline56: MultiLineString = {
        //     type: 'MultiLineString',
        //     coordinates: coordinates56
        // };

        // // clip smaller streets away from bigger streets
        // multiOutline34 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline34, turf.feature(multiPolygon56));

        // // clip bigger streets away from smaller streets
        // multiOutline56 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline56, turf.feature(multiPolygon34));

        // // clip bigger and smaller streets away from smallest streets
        // const union36 = VectorTileGeometryUtil.unionPolygons([...this.polygons34, ...this.polygons56]);
        // this.multiPolyline78 = VectorTileGeometryUtil.clipMultiPolyline(this.multiPolyline78, turf.feature(union36));

        // // clip away highways from all streets
        // multiOutline34 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline34, turf.feature(multiPolygon02));
        // multiOutline56 = VectorTileGeometryUtil.clipMultiPolyline(multiOutline56, turf.feature(multiPolygon02));
        // this.multiPolyline78 = VectorTileGeometryUtil.clipMultiPolyline(this.multiPolyline78, turf.feature(multiPolygon02));

        // this.multiPolyline010.coordinates.push(...multiOutline34.coordinates);
        // this.multiPolyline010.coordinates.push(...multiOutline56.coordinates);
        // this.multiPolyline030.coordinates.push(...this.multiPolyline78.coordinates);
        // this.multiPolyline030.coordinates.push(...multiOutline02.coordinates);

        // console.log(`${this.name}, clipping to bboxMap4326 ...`);
        // this.bboxClip(bboxMap4326);

    }

    async postProcess(): Promise<void> {

        console.log(`${this.name}, connecting polylines ...`);
        this.connectPolylines(5);

    }

}