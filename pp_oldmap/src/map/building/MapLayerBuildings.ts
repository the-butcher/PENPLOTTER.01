import * as turf from '@turf/turf';
import { BBox, GeoJsonProperties, Polygon } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { IWorkerPlotInput } from '../common/IWorkerPlotInput';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';

export class MapLayerBuildings extends AMapLayer<Polygon, GeoJsonProperties> {

    static minArea = 25;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        // this.polygons = [];
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {
        const polygons = VectorTileGeometryUtil.toPolygons(vectorTileKey, feature.coordinates).filter(p => Math.abs(turf.area(p)) > MapLayerBuildings.minArea);
        polygons.forEach(polygon => {
            this.tileData.push(turf.feature(polygon, {
                lod: vectorTileKey.lod,
                col: vectorTileKey.col,
                row: vectorTileKey.row
            }));
        });
    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing data ...`);

        const workerInput: IWorkerPolyInput<Polygon, GeoJsonProperties> = {
            name: this.name,
            tileData: this.tileData,
            outin: [0, 0],
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_poly_l__building.ts', import.meta.url), { // let respective layers produce URLs and worker input
                type: 'module',
            });
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

    async processLine(): Promise<void> {
        // do nothing, lines are only built after clipping this layer
    }

    async processPlot(): Promise<void> {

        const workerInput: IWorkerPlotInput = {
            name: this.name,
            polyData: this.polyData,
            polyText: VectorTileGeometryUtil.emptyMultiPolygon()
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_plot_l__building.ts', import.meta.url), { // let respective layers produce URLs and worker input
                type: 'module',
            });
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

        // const polygonCount010 = 3;
        // const polygonCount030 = 50;
        // const polygonDelta010 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.60;
        // const polygonDelta030 = Pen.getPenWidthMeters(0.20, Map.SCALE) * -0.60;

        // // thinner rings for better edge precision
        // const distances010: number[] = [];
        // for (let i = 0; i < polygonCount010; i++) {
        //     distances010.push(polygonDelta010);
        // }
        // console.log(`${this.name}, buffer collect 010 ...`, distances010);
        // const features010 = VectorTileGeometryUtil.bufferCollect2(this.polyData, true, ...distances010);

        // const distances030: number[] = [polygonDelta030 * 2.00]; // let the first ring be well inside the finer rings
        // for (let i = 0; i < polygonCount030; i++) {
        //     distances030.push(polygonDelta030);
        // }
        // console.log(`${this.name}, buffer collect 030 ...`, distances030);
        // const features030 = VectorTileGeometryUtil.bufferCollect2(this.polyData, false, ...distances030);

        // const connected010 = VectorTileGeometryUtil.connectBufferFeatures(features010);
        // this.multiPolyline010 = VectorTileGeometryUtil.restructureMultiPolyline(connected010);

        // const connected030 = VectorTileGeometryUtil.connectBufferFeatures(features030);
        // this.multiPolyline030 = VectorTileGeometryUtil.restructureMultiPolyline(connected030);

        // this.cleanCoords();

    }

}