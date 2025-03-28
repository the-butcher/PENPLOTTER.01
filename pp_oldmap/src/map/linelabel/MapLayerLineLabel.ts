import * as turf from '@turf/turf';
import { BBox, GeoJsonProperties, LineString, MultiPolygon } from "geojson";
import { IVectorTileFeature } from "../../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "../AMapLayer";
import { ILabelDef } from '../ILabelDef';
import { Map } from '../Map';
import { Pen } from "../Pen";
import { IWorkerPolyInputLineLabel } from './IWorkerPolyInputLineLabel';
import { IWorkerPolyOutputLineLabel } from './IWorkerPolyOutputLineLabel';

// @ts-expect-error no index file
import * as JSONfn from 'json-fn';
import { IWorkerLineInputLineLabel } from './IWorkerLineInputLineLabel';
import { ILabelDefLineLabel } from './ILabelDefLineLabel';

export class MapLayerLineLabel extends AMapLayer<LineString, GeoJsonProperties> {

    polyText: MultiPolygon;
    labelDefs: ILabelDef[];
    labelClasses: (string | number)[];

    constructor(name: string, filter: IVectorTileFeatureFilter, labelDefs: ILabelDef[], ...labelClasses: (string | number)[]) {
        super(name, filter);
        this.labelDefs = labelDefs;
        this.polyText = VectorTileGeometryUtil.emptyMultiPolygon();
        this.labelClasses = labelClasses;
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        // console.log(feature.hasValue('_name'), feature);

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        if (feature.hasValue('_name') && feature.hasValue('_label_class', ...this.labelClasses)) { //  && feature.hasValue('_label_class', 4, 5)

            let name = feature.getValue('_name')!.getValue()!.toString();
            console.log(`${this.name}, _name '${name}', _label_class '${feature.getValue('_label_class')?.getValue()}' ...`);

            for (let i = 0; i < this.labelDefs.length; i++) {
                if (this.labelDefs[i].tileName === name) {
                    name = this.labelDefs[i].plotName;
                }
            }

            polylines.forEach(polyline => {
                this.tileData.push(turf.feature(polyline, {
                    lod: vectorTileKey.lod,
                    col: vectorTileKey.col,
                    row: vectorTileKey.row,
                    name
                }));
            });

        }

    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);
        // console.log('this.tileData', this.tileData);

        // https://dev.to/localazy/how-to-pass-function-to-web-workers-4ee1
        const labelDefsWorkerInput: ILabelDefLineLabel[] = this.labelDefs.map(d => {
            const labelDefOmit: Omit<ILabelDef, 'idxvalid'> = {
                ...d
            };
            return {
                ...labelDefOmit,
                idxvalid: JSONfn.stringify(d.idxvalid)
            }
        });
        const workerInput: IWorkerPolyInputLineLabel = {
            name: this.name,
            tileData: this.tileData,
            outin: [0, 0], // not used
            labelDefs: labelDefsWorkerInput,
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_poly_l_linelabel.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerPolyOutputLineLabel = e.data;
                this.polyData = workerOutput.polyData;
                this.polyText = workerOutput.polyText;
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

        const workerInput: IWorkerLineInputLineLabel = {
            name: this.name,
            tileData: this.tileData,
            polyData: this.polyData,
            polyText: this.polyText,
            bboxClp4326,
            bboxMap4326
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_line_l_linelabel.ts', import.meta.url), { type: 'module' });
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

        // console.log(`${this.name}, connecting polylines ...`, this.linesByName);

        const polygonCount018 = 3;
        const polygonDelta018 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.60;

        // TODO :: remove code duplication
        const distances018: number[] = [];
        for (let i = 0; i < polygonCount018; i++) {
            distances018.push(polygonDelta018);
        }
        console.log(`${this.name}, buffer collect 018 ...`, distances018);
        const features018 = VectorTileGeometryUtil.bufferCollect2(this.polyText, true, ...distances018);

        const connected018 = VectorTileGeometryUtil.connectBufferFeatures(features018);
        this.multiPolyline018 = VectorTileGeometryUtil.restructureMultiPolyline(connected018);



        //
        // this.connectPolylines(2);

    }

}