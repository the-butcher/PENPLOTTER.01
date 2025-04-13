import * as turf from '@turf/turf';
import { BBox, GeoJsonProperties, Geometry, LineString, MultiPolygon } from "geojson";
import { IVectorTileFeature } from "../../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../../vectortile/IVectorTileKey";
import { UnionPolygon, VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "../AMapLayer";
import { ILabelDef } from '../ILabelDef';
import { Map } from '../Map';
import { Pen } from "../Pen";
import { IWorkerPolyInputLineLabel } from './IWorkerPolyInputLineLabel';
import { IWorkerPolyOutputLineLabel } from './IWorkerPolyOutputLineLabel';

// @ts-expect-error no index file
import * as JSONfn from 'json-fn';
import { ILabelDefLineLabel } from './ILabelDefLineLabel';
import { IWorkerLineInputLineLabel } from './IWorkerLineInputLineLabel';
import { GeoJsonLoader } from '../../util/GeoJsonLoader';
import { ISkipOptions } from '../ISkipOptions';

export class MapLayerLineLabel extends AMapLayer<LineString, GeoJsonProperties> {

    polyText: MultiPolygon;
    labelDefs: ILabelDef[];
    labelClasses: (string | number)[];
    geoJsonPath: string;

    constructor(name: string, filter: IVectorTileFeatureFilter, labelDefs: ILabelDef[], geoJsonPath: string = '', ...labelClasses: (string | number)[]) {
        super(name, filter);
        this.labelDefs = labelDefs;
        this.polyText = VectorTileGeometryUtil.emptyMultiPolygon();
        this.labelClasses = labelClasses;
        this.geoJsonPath = geoJsonPath;

        // for (let i = 0; i < this.labelDefs.length; i++) {
        //     if (this.labelDefs[i].geometry) {
        //         const polyline: LineString = {
        //             type: 'LineString',
        //             coordinates: this.labelDefs[i].geometry!
        //         }
        //         this.tileData.push(turf.feature(polyline, {
        //             lod: 0,
        //             col: 0,
        //             row: 0,
        //             name: this.labelDefs[i].tileName
        //         }));
        //     }
        // }

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

        if (this.geoJsonPath !== '') {
            const featureCollection = await new GeoJsonLoader().load<LineString, GeoJsonProperties>(this.geoJsonPath);
            featureCollection.features.forEach(f => {
                if (f.properties?.label) {

                    this.tileData.push(turf.feature(f.geometry, {
                        lod: -1,
                        col: -1,
                        row: -1,
                        name: f.properties?.label
                    }));

                }
            });
        }

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

        // const polygonCount018 = 3;
        // const polygonDelta018 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.60;

        // // TODO :: remove code duplication
        // const distances018: number[] = [];
        // for (let i = 0; i < polygonCount018; i++) {
        //     distances018.push(polygonDelta018);
        // }
        // console.log(`${this.name}, buffer collect 018 ...`, distances018);
        // const features018 = VectorTileGeometryUtil.bufferCollect2(this.polyText, true, ...distances018);

        // const connected018 = VectorTileGeometryUtil.connectBufferFeatures(features018);
        // this.multiPolyline018 = VectorTileGeometryUtil.restructureMultiPolyline(connected018);

    }

    async clipToLayerMultipolygon(layer: AMapLayer<Geometry, GeoJsonProperties>, distance: number, options?: ISkipOptions): Promise<void> {

        await super.clipToLayerMultipolygon(layer, distance, options);

        if (!options?.skipMlt) {

            const polyDataClip = VectorTileGeometryUtil.emptyMultiPolygon();
            layer.polyData.coordinates.forEach(polygon => {
                if (polygon.length > 0 && polygon[0].length > 0) { // is there an outer ring having coordinates?
                    polyDataClip.coordinates.push(polygon);
                }
            });
            if (polyDataClip.coordinates.length > 0) {

                const bufferResult = turf.buffer(polyDataClip, distance, {
                    units: 'meters'
                });

                const polyDataText = VectorTileGeometryUtil.emptyMultiPolygon();
                this.polyText.coordinates.forEach(polygon => {
                    if (polygon.length > 0 && polygon[0].length > 0) { // is there an outer ring having coordinates?
                        polyDataText.coordinates.push(polygon);
                    }
                });
                if (polyDataText.coordinates.length > 0) {
                    const featureC = turf.featureCollection([turf.feature(polyDataText), bufferResult!]);
                    const difference = turf.difference(featureC);
                    if (difference) {
                        const differenceGeometry: UnionPolygon = difference!.geometry; // subtract inner polygons from outer
                        const polygonsD = VectorTileGeometryUtil.destructureUnionPolygon(differenceGeometry);
                        this.polyText = VectorTileGeometryUtil.restructureMultiPolygon(polygonsD);
                    }
                }

            }

        }

    }

}