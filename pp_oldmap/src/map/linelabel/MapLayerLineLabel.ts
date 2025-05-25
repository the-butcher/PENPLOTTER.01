import * as turf from '@turf/turf';
import { BBox, Feature, GeoJsonProperties, Geometry, LineString, MultiPolygon } from "geojson";
import { IVectorTileFeature } from "../../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "../AMapLayer";
import { ILabelDef } from '../ILabelDef';
import { IWorkerPolyInputLineLabel } from './IWorkerPolyInputLineLabel';
import { IWorkerPolyOutputLineLabel } from './IWorkerPolyOutputLineLabel';

// @ts-expect-error no index file
import * as JSONfn from 'json-fn';
import { PPGeometry, TFillProps } from 'pp-geom';
import { GeoJsonLoader } from '../../util/GeoJsonLoader';
import { IWorkerClipInput } from '../clip/IWorkerClipInput';
import { IWorkerClipOutput } from '../clip/IWorkerClipOutput';
import { ISkipOptions } from '../ISkipOptions';
import { IWorkerPlotInput } from '../plot/IWorkerPlotInput';
import { ILabelDefLineLabel } from './ILabelDefLineLabel';

export class MapLayerLineLabel extends AMapLayer<LineString, GeoJsonProperties> {

    polyText: Feature<MultiPolygon, TFillProps>[];
    labelDefs: ILabelDef[];
    labelClasses: (string | number)[];
    geoJsonPath: string;

    constructor(name: string, filter: IVectorTileFeatureFilter, labelDefs: ILabelDef[], geoJsonPath: string = '', ...labelClasses: (string | number)[]) {
        super(name, filter);
        this.labelDefs = labelDefs;
        this.polyText = [];
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
            // console.log(`${this.name}, _name '${name}', _label_class '${feature.getValue('_label_class')?.getValue()}' ...`);

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
                if (turf.length(f, {
                    units: 'meters'
                }) > 250) {
                    if (f.properties?.label) {

                        this.tileData.push(turf.feature(f.geometry, {
                            lod: -1,
                            col: -1,
                            row: -1,
                            name: f.properties?.label
                        }));

                    }
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

    async processLine(): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const workerInput: IWorkerPlotInput = {
            name: this.name,
            polyText: this.polyText,
        };

        return new Promise((resolve, reject) => {

            const workerInstance = new Worker(new URL('../plot/worker_plot_l__polytext.ts', import.meta.url), { type: 'module' });
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

        console.log(`${this.name}, processing plot ...`);



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

                const clipFeature = async (feature: Feature<MultiPolygon, TFillProps>): Promise<Feature<MultiPolygon, TFillProps>> => {

                    const workerInput: IWorkerClipInput = {
                        multiPolyline018Dest: PPGeometry.emptyMultiPolyline(),
                        multiPolyline025Dest: PPGeometry.emptyMultiPolyline(),
                        multiPolyline035Dest: PPGeometry.emptyMultiPolyline(),
                        multiPolyline050Dest: PPGeometry.emptyMultiPolyline(),
                        polyDataDest: feature.geometry,
                        polyDataClip: layer.polyData,
                        distance: distance,
                        options
                    };

                    const workerProm = new Promise<Feature<MultiPolygon, TFillProps>>((resolve, reject) => {
                        const workerInstance = new Worker(new URL('../clip/worker_clip________misc.ts', import.meta.url), { type: 'module' });
                        workerInstance.onmessage = (e) => {
                            const workerOutput: IWorkerClipOutput = e.data;
                            // this.polyData = workerOutput.polyDataDest;
                            workerInstance.terminate();
                            resolve(turf.feature(workerOutput.polyDataDest, feature.properties));
                        };
                        workerInstance.onerror = (e) => {
                            workerInstance.terminate();
                            reject(e);
                        };
                        workerInstance.postMessage(workerInput);
                    });

                    return await workerProm;

                    // const bufferResult = turf.buffer(polyDataClip, distance, {
                    //     units: 'meters'
                    // });

                    // console.log('clippin poly text ...');

                    // const clipFeature = (feature: Feature<MultiPolygon, TFillProps>): Feature<MultiPolygon, TFillProps> => {

                    //     const polyDataText = PPGeometry.emptyMultiPolygon();
                    //     feature.geometry.coordinates.forEach(polygon => {
                    //         if (polygon.length > 0 && polygon[0].length > 0) { // is there an outer ring having coordinates?
                    //             polyDataText.coordinates.push(polygon);
                    //         }
                    //     });

                    //     console.log('checking poly text clip ...');
                    //     if (polyDataText.coordinates.length > 0) {
                    //         const featureC = turf.featureCollection([turf.feature(polyDataText), bufferResult!]);
                    //         const difference = turf.difference(featureC);
                    //         if (difference) {
                    //             console.log('found difference ...', feature)
                    //             const differenceGeometry: TUnionPolygon = difference!.geometry; // subtract inner polygons from outer
                    //             const polygonsD = PPGeometry.destructurePolygons(differenceGeometry);
                    //             return turf.feature(PPGeometry.restructurePolygons(polygonsD), feature.properties);
                    //         }
                    //     }
                    //     return feature;

                    // }
                    // this.polyText = this.polyText.map(p => clipFeature(p));

                }
                const _polyText: Feature<MultiPolygon, TFillProps>[] = [];
                for (let i = 0; i < this.polyText.length; i++) {
                    const _feature = await (clipFeature(this.polyText[i]));
                    _polyText.push(_feature);
                }
                this.polyText = _polyText;
                // this.polyData = PPGeometry.emptyMultiPolygon();
                // this.polyText.forEach(p => {
                //     this.polyData.coordinates.push(...p.geometry.coordinates);
                // })
            }

        }

    }

}