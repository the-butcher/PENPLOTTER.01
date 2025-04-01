import * as turf from '@turf/turf';
import { BBox, GeoJsonProperties, Polygon } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';
import { ISymbolDefPointFill, IWorkerLineInputPolygon } from './IWorkerLineInputPolygon';
import { ISymbolProperties } from '../common/ISymbolProperties';

export class MapLayerPolygon extends AMapLayer<Polygon, ISymbolProperties> {

    outin: [number, number];
    minArea: number;
    symbolDefinitions: { [K in string]: ISymbolDefPointFill } = {};

    constructor(name: string, filter: IVectorTileFeatureFilter, outin: [number, number], minArea: number, symbolDefinitions: { [K in string]: ISymbolDefPointFill } = {}) {
        super(name, filter);
        this.outin = outin;
        this.minArea = minArea;
        this.symbolDefinitions = symbolDefinitions;
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const polygons = VectorTileGeometryUtil.toPolygons(vectorTileKey, feature.coordinates).filter(p => Math.abs(turf.area(p)) > this.minArea);
        const symbolValue = feature.getValue('_symbol')?.getValue() as number;

        polygons.forEach(polygon => {
            this.tileData.push(turf.feature(polygon, {
                lod: vectorTileKey.lod,
                col: vectorTileKey.col,
                row: vectorTileKey.row,
                symbol: symbolValue
            }));
        });

    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing data ...`);

        const workerInput: IWorkerPolyInput<Polygon, GeoJsonProperties> = {
            name: this.name,
            tileData: this.tileData,
            outin: this.outin,
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_poly_l___polygon.ts', import.meta.url), { // let respective layers produce URLs and worker input
                type: 'module',
            });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerPolyOutput = e.data;
                this.polyData = workerOutput.polyData;
                workerInstance.terminate();
                resolve();
            };
            workerInstance.onerror = (e) => {
                // workerInstance.terminate();
                reject(e);
            };
            workerInstance.postMessage(workerInput);
        });

    }

    async processLine(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const workerInput: IWorkerLineInputPolygon = {
            name: this.name,
            tileData: this.tileData,
            polyData: this.polyData,
            bboxClp4326,
            bboxMap4326,
            symbolDefinitions: this.symbolDefinitions
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_line_l___polygon.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                this.applyWorkerOutputLine(e.data);
                workerInstance.terminate();
                resolve();
            };
            workerInstance.onerror = (e) => {
                // workerInstance.terminate();
                reject(e);
            };
            workerInstance.postMessage(workerInput);
        });

    }

    async processPlot(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {


        console.log(`${this.name}, connecting polylines ...`);
        this.connectPolylines(2);

        const polylines025 = VectorTileGeometryUtil.destructureMultiPolyline(this.multiPolyline025).filter(p => turf.length(turf.feature(p), {
            units: 'meters'
        }) > 20);
        this.multiPolyline025 = VectorTileGeometryUtil.restructureMultiPolyline(polylines025);

        const workerInput: IWorkerLineInputPolygon = {
            name: this.name,
            tileData: this.tileData,
            polyData: this.polyData,
            bboxClp4326,
            bboxMap4326,
            symbolDefinitions: this.symbolDefinitions
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_plot_l___polygon.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                this.applyWorkerOutputLine(e.data);
                workerInstance.terminate();
                resolve();
            };
            workerInstance.onerror = (e) => {
                // workerInstance.terminate();
                reject(e);
            };
            workerInstance.postMessage(workerInput);
        });


    }

}