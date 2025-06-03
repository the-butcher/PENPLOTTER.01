import * as turf from '@turf/turf';
import { BBox, GeoJsonProperties, LineString, MultiLineString } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { GeoJsonLoader } from '../../util/GeoJsonLoader';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyOutput';
import { ISymbolDefPointDash, IWorkerLineInputLine } from './IWorkerLineInputLine';
import { ISymbolProperties } from '../common/ISymbolProperties';


export class MapLayerLines extends AMapLayer<LineString, ISymbolProperties> {

    private getDefaultPolylineContainer: (mapLayerLines: MapLayerLines) => MultiLineString;
    private dashArray: [number, number];
    private offset: number;
    private geoJsonPath: string;
    symbolDefinitions: { [K in string]: ISymbolDefPointDash } = {};

    constructor(name: string, filter: IVectorTileFeatureFilter, getDefaultPolylineContainer: (mapLayerLines: MapLayerLines) => MultiLineString, dashArray: [number, number] = [0, 0], offset: number = 0, symbolDefinitions: { [K in string]: ISymbolDefPointDash } = {}, geoJsonPath: string = '') {
        super(name, filter);
        this.getDefaultPolylineContainer = getDefaultPolylineContainer;
        this.dashArray = dashArray;
        this.offset = offset;
        this.symbolDefinitions = symbolDefinitions;
        this.geoJsonPath = geoJsonPath;
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        const symbolValue = feature.getValue('_symbol')?.getValue() as number;

        polylines.forEach(polyline => {
            this.tileData.push(turf.feature(polyline, {
                lod: vectorTileKey.lod,
                col: vectorTileKey.col,
                row: vectorTileKey.row,
                layer: feature.layerName,
                symbol: symbolValue
            }));
        });

    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        if (this.geoJsonPath !== '') {
            const featureCollection = await new GeoJsonLoader().load<LineString, ISymbolProperties>(this.geoJsonPath);
            featureCollection.features.forEach(f => this.tileData.push(f));
        }

        const workerInput: IWorkerPolyInput<LineString, GeoJsonProperties> = {
            name: this.name,
            tileData: this.tileData,
            outin: [0, 0], // not used
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_poly_l______line.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerPolyOutput = e.data;
                this.polyData = workerOutput.polyData;
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

        const workerInput: IWorkerLineInputLine = {
            name: this.name,
            tileData: this.tileData,
            polyData: this.polyData,
            dashArray: this.dashArray,
            offset: this.offset,
            symbolDefinitions: this.symbolDefinitions,
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_line_l______line.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerLineOutput = e.data;
                this.applyWorkerOutputLine(workerOutput);
                this.getDefaultPolylineContainer(this).coordinates.push(...workerOutput.multiPolylineDef!.coordinates);
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
        // this.connectPolylines(2);

    }

}