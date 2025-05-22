import * as turf from '@turf/turf';
import { BBox, Feature, GeoJsonProperties, Geometry, MultiPolygon, Point } from "geojson";
import { PPGeometry, TFillProps, TUnionPolygon } from 'pp-geom';
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { GeoJsonLoader } from '../../util/GeoJsonLoader';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { ILabelDef } from '../ILabelDef';
import { ISkipOptions } from '../ISkipOptions';
import { ILabelDefPointLabel } from './ILabelDefPointLabel';
import { IWorkerPolyInputPoint } from './IWorkerPolyInputPoint';
import { IWorkerPolyOutputPoint } from './IWorkerPolyOutputPoint';
import { IWorkerPlotInput } from '../plot/IWorkerPlotInput';

export class MapLayerPoints extends AMapLayer<Point, GeoJsonProperties> {

    symbolFactory: string;
    polyText: Feature<MultiPolygon, TFillProps>[];
    labelDefs: ILabelDef[];
    private geoJsonPath: string;

    constructor(name: string, filter: IVectorTileFeatureFilter, symbolFactory: string, labelDefs: ILabelDef[], geoJsonPath: string) {
        super(name, filter);
        this.symbolFactory = symbolFactory;
        this.labelDefs = labelDefs;
        this.geoJsonPath = geoJsonPath;
        this.polyText = [];
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
        // nothing
    }


    async processPlot(): Promise<void> {

        console.log(`${this.name}, processing plot ...`);

        const workerInput: IWorkerPlotInput = {
            name: this.name,
            polyText: this.polyText
        };

        return new Promise((resolve, reject) => {

            const workerInstance = new Worker(new URL('../plot/worker_plot_l__polytext.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                this.applyWorkerOutputLine(e.data);
                // workerInstance.terminate();
                resolve();
            };
            workerInstance.onerror = (e) => {
                // workerInstance.terminate();
                reject(e);
            };
            workerInstance.postMessage(workerInput);
        });


        // const polygonCount018 = 20;
        // const polygonDelta018 = Pen.getPenWidthMeters(0.10, Map.SCALE) * -0.75;

        // // TODO :: remove code duplication
        // const distances018: number[] = [];
        // for (let i = 0; i < polygonCount018; i++) {
        //     distances018.push(polygonDelta018);
        // }
        // console.log(`${this.name}, buffer collect 018 ...`, distances018);
        // const features018 = PPGeometry.bufferCollect2(this.polyText, true, ...distances018);

        // const connected018A = PPGeometry.connectBufferFeatures(features018);
        // const connected018B = PPGeometry.restructurePolylines(connected018A);
        // this.multiPolyline018.coordinates.push(...connected018B.coordinates);

    }

    async clipToLayerMultipolygon(layer: AMapLayer<Geometry, GeoJsonProperties>, distance: number, options?: ISkipOptions): Promise<void> {

        await super.clipToLayerMultipolygon(layer, distance, options);

        if (!options?.skipMlt) {

            const polyDataClip = PPGeometry.emptyMultiPolygon();
            layer.polyData.coordinates.forEach(polygon => {
                if (polygon.length > 0 && polygon[0].length > 0) { // is there an outer ring having coordinates?
                    polyDataClip.coordinates.push(polygon);
                }
            });

            if (polyDataClip.coordinates.length > 0) {

                // TODO :: polytext will have to be clipped too

                const bufferResult = turf.buffer(polyDataClip, distance, {
                    units: 'meters'
                });

                const clipFeature = (feature: Feature<MultiPolygon, TFillProps>): Feature<MultiPolygon, TFillProps> => {

                    const polyDataText = PPGeometry.emptyMultiPolygon();
                    feature.geometry.coordinates.forEach(polygon => {
                        if (polygon.length > 0 && polygon[0].length > 0) { // is there an outer ring having coordinates?
                            polyDataText.coordinates.push(polygon);
                        }
                    });
                    if (polyDataText.coordinates.length > 0) {
                        const featureC = turf.featureCollection([turf.feature(polyDataText), bufferResult!]);
                        const difference = turf.difference(featureC);
                        if (difference) {
                            const differenceGeometry: TUnionPolygon = difference!.geometry; // subtract inner polygons from outer
                            const polygonsD = PPGeometry.destructurePolygons(differenceGeometry);
                            return turf.feature(PPGeometry.restructurePolygons(polygonsD), feature.properties);
                        }
                    }
                    return feature;

                }
                this.polyText = this.polyText.map(p => clipFeature(p));

                // const polyDataText = PPGeometry.emptyMultiPolygon();
                // this.polyText.coordinates.forEach(polygon => {
                //     if (polygon.length > 0 && polygon[0].length > 0) { // is there an outer ring having coordinates?
                //         polyDataText.coordinates.push(polygon);
                //     }
                // });
                // if (polyDataText.coordinates.length > 0) {
                //     const featureC = turf.featureCollection([turf.feature(polyDataText), bufferResult!]);
                //     const difference = turf.difference(featureC);
                //     if (difference) {
                //         const differenceGeometry: TUnionPolygon = difference!.geometry; // subtract inner polygons from outer
                //         const polygonsD = PPGeometry.destructurePolygons(differenceGeometry);
                //         this.polyText = PPGeometry.restructurePolygons(polygonsD);
                //     }
                // }

            }

        }

    }

}