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
import { IRoadProperties } from './IRoadProperties';


export class MapLayerRoads extends AMapLayer<LineString, IRoadProperties> {

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
        this.multiPolyline02 = VectorTileGeometryUtil.emptyMultiPolyline();
        this.multiPolyline34 = VectorTileGeometryUtil.emptyMultiPolyline();
        this.multiPolyline56 = VectorTileGeometryUtil.emptyMultiPolyline();
        this.multiPolyline78 = VectorTileGeometryUtil.emptyMultiPolyline();
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
                symbol: symbolValue,
                layer: feature.layerName
            }));
        });

    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        const workerInput: IWorkerPolyInput<LineString, IRoadProperties> = {
            name: this.name,
            tileData: this.tileData,
            outin: [10, -4], // implicit 6m buffer
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve, reject) => {
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
                workerInstance.terminate();
                resolve();
            };
            workerInstance.onerror = (e) => {
                workerInstance.terminate();
                reject(e);
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

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_line_l______road.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                this.applyWorkerOutputLine(e.data);
                workerInstance.terminate();
                resolve();
            };
            workerInstance.onerror = (e) => {
                workerInstance.terminate();
                reject(e);
            };
            workerInstance.postMessage(workerInput);
        });

    }

    async processPlot(): Promise<void> {

        console.log(`${this.name}, connecting polylines ...`);
        this.connectPolylines(5);

    }

}