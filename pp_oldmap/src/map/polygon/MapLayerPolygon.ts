import * as turf from '@turf/turf';
import { BBox, Polygon, Position } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyOutput';


export class MapLayerPolygon extends AMapLayer<Polygon> {

    outin: [number, number];
    minArea: number;

    constructor(name: string, filter: IVectorTileFeatureFilter, outin: [number, number], minArea: number) {
        super(name, filter);
        this.outin = outin;
        this.minArea = minArea;
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {
        const polygons = VectorTileGeometryUtil.toPolygons(vectorTileKey, feature.coordinates).filter(p => Math.abs(turf.area(p)) > this.minArea);
        polygons.forEach(polygon => {
            this.tileData.push(turf.feature(polygon, {
                lod: vectorTileKey.lod,
                col: vectorTileKey.col,
                row: vectorTileKey.row
            }));
        });
    }

    async closeTile(): Promise<void> { }

    async processPoly(bboxClp4326: BBox): Promise<void> {

        console.log(`${this.name}, processing data ...`);

        const workerInput: IWorkerPolyInput<Polygon> = {
            name: this.name,
            tileData: this.tileData,
            outin: this.outin,
            bboxClp4326
        };

        return new Promise((resolve) => { // , reject
            const workerInstance = new Worker(new URL('./worker_poly_l___polygon.ts', import.meta.url), { // let respective layers produce URLs and worker input
                type: 'module',
            });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerPolyOutput = e.data;
                this.polyData = workerOutput.polyData;
                resolve();
            };
            workerInstance.postMessage(workerInput);
        });

    }

    async processLine(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const coordinates01: Position[][] = this.polyData.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline010.coordinates.push(...coordinates01);

        console.log(`${this.name}, clipping to bboxMap4326 ...`);
        this.bboxClip(bboxMap4326);

    }

    async postProcess(): Promise<void> {

        console.log(`${this.name}, connecting polylines ...`);
        this.connectPolylines(2);

        const polylines010 = VectorTileGeometryUtil.destructureMultiPolyline(this.multiPolyline010).filter(p => turf.length(turf.feature(p), {
            units: 'meters'
        }) > 20);
        this.multiPolyline010 = VectorTileGeometryUtil.restructureMultiPolyline(polylines010);

    }

}