import * as turf from '@turf/turf';
import { BBox, GeoJsonProperties, LineString, MultiLineString, Position } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { Map } from '../Map';
import { IWorkerPolyOutputTunnel } from './IWorkerPolyOutputTunnel';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';

export class MapLayerTunnels extends AMapLayer<LineString, GeoJsonProperties> {

    multiPolyline04: MultiLineString;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.multiPolyline04 = VectorTileGeometryUtil.emptyMultiPolyline();
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        const symbolValue = feature.getValue('_symbol')?.getValue() as number;

        if (symbolValue < Map.SYMBOL_INDEX_____OTHER) {
            polylines.forEach(polyline => {
                this.tileData.push(turf.feature(polyline, {
                    lod: vectorTileKey.lod,
                    col: vectorTileKey.col,
                    row: vectorTileKey.row
                }));
            });
            // this.multiPolyline04.coordinates.push(...polylines.map(p => p.coordinates));
        }

    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        const workerInput: IWorkerPolyInput<LineString, GeoJsonProperties> = {
            name: this.name,
            tileData: this.tileData,
            outin: [3, -3],
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve) => { // , reject
            const workerInstance = new Worker(new URL('./worker_poly_l____tunnel.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerPolyOutputTunnel = e.data;
                this.polyData = workerOutput.polyData;
                this.multiPolyline04 = workerOutput.multiPolyline04;
                workerInstance.terminate();
                resolve();
            };
            workerInstance.postMessage(workerInput);
        });

    }

    async processLine(): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        // no worker, just copying some coordinates

        this.multiPolyline030.coordinates.push(...this.multiPolyline04.coordinates);

    }

    async processPlot(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, creating dashes ...`);

        this.multiPolyline04 = VectorTileGeometryUtil.dashMultiPolyline(this.multiPolyline04, [10, 12]);
        this.multiPolyline030.coordinates = this.multiPolyline04.coordinates;

        console.log(`${this.name}, clipping to bboxMap4326 ...`);
        this.bboxClipLayer(bboxMap4326);

    }

}