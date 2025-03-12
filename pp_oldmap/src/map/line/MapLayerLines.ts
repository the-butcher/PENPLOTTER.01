import * as turf from '@turf/turf';
import { BBox, LineString, MultiLineString } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';
import { IWorkerLineInputLine } from './IWorkerLineInputLine';
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';


export class MapLayerLines extends AMapLayer<LineString> {

    private getDefaultPolylineContainer: (mapLayerLines: MapLayerLines) => MultiLineString;
    private dashArray: [number, number];

    constructor(name: string, filter: IVectorTileFeatureFilter, getDefaultPolylineContainer: (mapLayerLines: MapLayerLines) => MultiLineString, dashArray: [number, number] = [0, 0]) {
        super(name, filter);
        this.getDefaultPolylineContainer = getDefaultPolylineContainer;
        this.dashArray = dashArray;
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {
        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        polylines.forEach(polyline => {
            this.tileData.push(turf.feature(polyline, {
                lod: vectorTileKey.lod,
                col: vectorTileKey.col,
                row: vectorTileKey.row
            }));
        });
    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        const workerInput: IWorkerPolyInput<LineString> = {
            name: this.name,
            tileData: this.tileData,
            outin: [0, 0], // not used
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve) => { // , reject
            const workerInstance = new Worker(new URL('./worker_poly_l______line.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerPolyOutput = e.data;
                this.polyData = workerOutput.polyData;
                resolve();
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
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve) => { // , reject
            const workerInstance = new Worker(new URL('./worker_line_l______line.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerLineOutput = e.data;
                this.applyWorkerOutputLine(workerOutput);
                this.getDefaultPolylineContainer(this).coordinates.push(...workerOutput.multiPolylineDef!.coordinates);
                resolve();
            };
            workerInstance.postMessage(workerInput);
        });

    }


    async postProcess(): Promise<void> {

        console.log(`${this.name}, connecting polylines ...`);
        this.connectPolylines(2);

    }

}