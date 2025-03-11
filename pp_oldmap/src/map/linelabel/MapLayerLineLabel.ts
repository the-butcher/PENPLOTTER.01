import * as turf from '@turf/turf';
import { BBox, LineString, MultiPolygon, Position } from "geojson";
import { IVectorTileFeature } from "../../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "../AMapLayer";
import { ILabelDef } from '../ILabelDef';
import { Map } from '../Map';
import { Pen } from "../Pen";
import { ILabelDefLineLabel, IWorkerPolyInputLineLabel } from './IWorkerPolyInputLineLabel';
import { IWorkerPolyOutputLineLabel } from './IWorkerPolyOutputLineLabel';

// @ts-expect-error no index file
import * as JSONfn from 'json-fn';

export class MapLayerLineLabel extends AMapLayer<LineString> {

    polyText: MultiPolygon;
    labelDefs: ILabelDef[];

    constructor(name: string, filter: IVectorTileFeatureFilter, labelDefs: ILabelDef[]) {
        super(name, filter);
        this.labelDefs = labelDefs;
        this.polyText = {
            type: 'MultiPolygon',
            coordinates: []
        };
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        // console.log(feature.hasValue('_name'), feature);

        const polylines = VectorTileGeometryUtil.toPolylines(vectorTileKey, feature.coordinates);
        if (feature.hasValue('_name') && feature.hasValue('_label_class', 4)) { //  && feature.hasValue('_label_class', 4, 5)

            let name = feature.getValue('_name')!.getValue()!.toString();
            console.log('name', name, feature.getValue('_label_class'));

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

    async closeTile(): Promise<void> { }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> { // bboxMap4326: BBox

        console.log(`${this.name}, processing data ...`);
        console.log('this.tileData', this.tileData);

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

        return new Promise((resolve) => { // , reject
            const workerInstance = new Worker(new URL('./worker_poly_l_linelabel.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerPolyOutputLineLabel = e.data;
                this.polyData = workerOutput.polyData;
                this.polyText = workerOutput.polyText;
                resolve();
            };
            workerInstance.postMessage(workerInput);
        });

    }

    async processLine(): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const coordinates005: Position[][] = this.polyText.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline005.coordinates.push(...coordinates005);

    }

    async postProcess(): Promise<void> {

        // console.log(`${this.name}, connecting polylines ...`, this.linesByName);

        const polygonCount005 = 3;
        const polygonDelta005 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.60;

        // TODO :: remove code duplication
        const distances005: number[] = [];
        for (let i = 0; i < polygonCount005; i++) {
            distances005.push(polygonDelta005);
        }
        console.log(`${this.name}, buffer collect 010 ...`, distances005);
        const features005 = VectorTileGeometryUtil.bufferCollect2(this.polyText, true, ...distances005);

        const connected005 = VectorTileGeometryUtil.connectBufferFeatures(features005);
        this.multiPolyline005 = VectorTileGeometryUtil.restructureMultiPolyline(connected005);



        //
        // this.connectPolylines(2);

    }

}