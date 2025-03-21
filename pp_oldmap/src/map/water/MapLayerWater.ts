import * as turf from '@turf/turf';
import { BBox, GeoJsonProperties, Polygon } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { IWorkerLineInput } from '../common/IWorkerLineInput';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';

export class MapLayerWater extends AMapLayer<Polygon, GeoJsonProperties> {

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {
        const polygons = VectorTileGeometryUtil.toPolygons(vectorTileKey, feature.coordinates).filter(p => Math.abs(turf.area(p)) > 100); // TODO :: remove magic number
        polygons.forEach(polygon => {
            this.tileData.push(turf.feature(polygon, {
                lod: vectorTileKey.lod,
                col: vectorTileKey.col,
                row: vectorTileKey.row
            }));
        });
    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        const workerInput: IWorkerPolyInput<Polygon, GeoJsonProperties> = {
            name: this.name,
            tileData: this.tileData,
            outin: [3, -3],
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_poly_l_____water.ts', import.meta.url), { type: 'module' });
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

        const workerInput: IWorkerLineInput<Polygon> = {
            name: this.name,
            tileData: this.tileData,
            polyData: this.polyData,
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_line_l_____water.ts', import.meta.url), { type: 'module' });
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
        this.connectPolylines(4);

    }

}