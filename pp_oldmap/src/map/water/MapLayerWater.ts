import * as turf from '@turf/turf';
import { BBox, Feature, GeoJsonProperties, LineString, MultiPolygon, Polygon } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { IWorkerLineInput } from '../common/IWorkerLineInput';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';

export class MapLayerWater extends AMapLayer<Polygon, GeoJsonProperties> {

    tileDataLines: Feature<LineString, GeoJsonProperties>[];

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.tileDataLines = [];
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        if (feature.geomType.getName() === 'polygon') {

            const polygons = VectorTileGeometryUtil.toPolygons(vectorTileKey, feature.coordinates).filter(p => Math.abs(turf.area(p)) > 50); // TODO :: remove magic number
            polygons.forEach(polygon => {
                this.tileData.push(turf.feature(polygon, {
                    lod: vectorTileKey.lod,
                    col: vectorTileKey.col,
                    row: vectorTileKey.row
                }));
            });

        } else if (feature.geomType.getName() === 'line') {

            const symbolValue = feature.getValue('_symbol')?.getValue() as number;
            console.log('water line symbol', symbolValue);

            if (feature.hasValue('_symbol', 1, 5)) {
                const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
                polylines.forEach(polyline => {
                    this.tileDataLines.push(turf.feature(polyline, {
                        lod: vectorTileKey.lod,
                        col: vectorTileKey.col,
                        row: vectorTileKey.row
                    }));
                });
            }

        }



    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);

        const multiPolyline = VectorTileGeometryUtil.restructurePolylines(this.tileDataLines.map(f => f.geometry));
        // let polyData = VectorTileGeometryUtil.emptyMultiPolygon();

        if (multiPolyline.coordinates.length > 0) {
            const linebuffer04 = turf.buffer(multiPolyline, 2, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            const polygons04 = VectorTileGeometryUtil.destructurePolygons(linebuffer04.geometry);
            polygons04.forEach(polygon => {
                this.tileData.push(turf.feature(polygon, {
                    lod: -1,
                    col: -1,
                    row: -1
                }));
            });
        }

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

        const workerInput: IWorkerLineInput<Polygon, GeoJsonProperties> = {
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
        this.filterPolylinesShorterThan(20);

    }

}