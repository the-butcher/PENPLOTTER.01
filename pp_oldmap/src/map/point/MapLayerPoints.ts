import * as turf from '@turf/turf';
import { BBox, GeoJsonProperties, MultiPolygon, Point, Position } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { ILabelDef } from '../ILabelDef';
import { ILabelDefPointLabel } from './ILabelDefPointLabel';
import { IWorkerPolyInputPoint } from './IWorkerPolyInputPoint';
import { IWorkerPolyOutputPoint } from './IWorkerPolyOutputPoint';
import { GeoJsonLoader } from '../../util/GeoJsonLoader';
import { PPGeometry } from 'pp-geom';

export class MapLayerPoints extends AMapLayer<Point, GeoJsonProperties> {

    symbolFactory: string;
    polyText: MultiPolygon;
    labelDefs: ILabelDef[];
    private geoJsonPath: string;

    constructor(name: string, filter: IVectorTileFeatureFilter, symbolFactory: string, labelDefs: ILabelDef[], geoJsonPath: string) {
        super(name, filter);
        this.symbolFactory = symbolFactory;
        this.labelDefs = labelDefs;
        this.geoJsonPath = geoJsonPath;
        this.polyText = PPGeometry.emptyMultiPolygon();
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {

        const points = VectorTileGeometryUtil.toPoints(vectorTileKey, feature.coordinates);

        let nameVal = feature.getValue('_name')?.getValue();
        let clasVal = feature.getValue('_label_class')?.getValue();
        for (let i = 1; i < 30; i++) {
            nameVal = nameVal ?? feature.getValue(`_name${i}`)?.getValue();
            clasVal = clasVal ?? feature.getValue(`_label_class${i}`)?.getValue();
        }

        // if (nameVal && !this.labelClasses.some(v => clasVal === v)) {
        //     return;
        // }

        let name: string | undefined;
        if (nameVal) {
            const nameValSplit = nameVal.toString().split(/\n/g);
            if (nameValSplit.length === 2 && nameValSplit[1].endsWith('m')) {
                name = nameValSplit[1];
            } else {
                name = nameVal.toString();
            }
        }

        for (let i = 0; i < this.labelDefs.length; i++) {
            if (this.labelDefs[i].tileName === name) {
                name = this.labelDefs[i].plotName;
            }
        }

        if (nameVal && !name) {
            return; // ignore label AND point
        }

        // console.log(`${this.name}, _name '${name}', _label_class '${clasVal}' ...`);

        points.forEach(point => {
            this.tileData.push(turf.feature(point, {
                lod: vectorTileKey.lod,
                col: vectorTileKey.col,
                row: vectorTileKey.row,
                name
            }));
        });

        // console.log('_name1', feature.getValue('_name1')?.getValue());
        // console.log('_name2', feature.getValue('_name2')?.getValue());
        // console.log('_name3', feature.getValue('_name3')?.getValue());
        // console.log('_name4', feature.getValue('_name4')?.getValue());

    }

    async processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        if (this.geoJsonPath !== '') {
            const featureCollection = await new GeoJsonLoader().load<Point, GeoJsonProperties>(this.geoJsonPath);
            featureCollection.features.forEach(f => this.tileData.push(f));
        }

        console.log(`${this.name}, processing data ...`);

        const labelDefsWorkerInput: ILabelDefPointLabel[] = this.labelDefs.map(d => {
            const labelDefOmit: Omit<ILabelDef, 'idxvalid'> = {
                ...d
            };
            return {
                ...labelDefOmit,
                idxvalid: undefined
            }
        });
        // console.log(this.name, 'labelDefsWorkerInput', labelDefsWorkerInput);

        const workerInput: IWorkerPolyInputPoint = {
            name: this.name,
            tileData: this.tileData,
            outin: [0, 0],
            bboxClp4326,
            bboxMap4326,
            symbolFactory: this.symbolFactory,
            labelDefs: labelDefsWorkerInput
        };

        return new Promise((resolve, reject) => {
            const workerInstance = new Worker(new URL('./worker_poly_l_____point.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerPolyOutputPoint = e.data;
                this.polyData = workerOutput.polyData;
                this.polyText = workerOutput.polyText;
                this.multiPolyline025 = workerOutput.multiPolyline025;
                // workerInstance.terminate();
                resolve();
            };
            workerInstance.onerror = (e) => {
                // workerInstance.terminate();
                reject(e);
            };
            workerInstance.postMessage(workerInput);
        });

    }

    async processLine(): Promise<void> {
        // nothing
    }


    async processPlot(): Promise<void> {

        const coordinates018: Position[][] = this.polyText.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline018.coordinates.push(...coordinates018);

        // const polygonCount018 = 3;
        // const polygonDelta018 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.60;

        // // TODO :: remove code duplication
        // const distances018: number[] = [];
        // for (let i = 0; i < polygonCount018; i++) {
        //     distances018.push(polygonDelta018);
        // }
        // console.log(`${this.name}, buffer collect 018 ...`, distances018);
        // const features018 = VectorTileGeometryUtil.bufferCollect2(this.polyText, true, ...distances018);

        // const connected018A = VectorTileGeometryUtil.connectBufferFeatures(features018);
        // const connected018B = VectorTileGeometryUtil.restructureMultiPolyline(connected018A);
        // this.multiPolyline018.coordinates.push(...connected018B.coordinates);

    }

}