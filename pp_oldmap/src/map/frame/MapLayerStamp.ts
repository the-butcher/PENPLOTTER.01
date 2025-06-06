import * as turf from '@turf/turf';
import { BBox, Feature, GeoJsonProperties, LineString, MultiLineString, Position } from "geojson";
import { PPGeometry, PPProjection, PPTransformation } from 'pp-geom';
import { AMapLayer } from "../AMapLayer";
import { ILayout } from './ILayout';
import { MapLayerFrame } from './MapLayerFrame';
// @ts-expect-error no index file
import * as JSONfn from 'json-fn';
import { ILabelDefLineLabel } from '../linelabel/ILabelDefLineLabel';
import { IWorkerPolyInputLineLabel } from '../linelabel/IWorkerPolyInputLineLabel';
import { MapDefs } from '../MapDefs';
import { Line } from 'd3';
import { IWorkerPolyOutputLineLabel } from '../linelabel/IWorkerPolyOutputLineLabel';

export class MapLayerStamp extends AMapLayer<LineString, GeoJsonProperties> {

    coordinateUL3857Outer: Position = [0, 0];
    coordinateLR3857Outer: Position = [0, 0];
    coordinateUL3857Inner: Position = [0, 0];
    coordinateLR3857Inner: Position = [0, 0];
    coordinateUL3857Crop: Position = [0, 0];
    coordinateLR3857Crop: Position = [0, 0];
    coordinateUL4326Crop: Position = [0, 0];
    coordinateLR4326Crop: Position = [0, 0];

    private labelDefs: ILabelDefLineLabel[] = [];
    private layout: ILayout;

    constructor(name: string, layout: ILayout) {
        super(name, {
            accepts: () => {
                return false;
            }
        });
        this.layout = layout;
    }

    getRectCoordinates3857(ul: Position, lr: Position): Position[] {
        const coordinates3857: Position[] = [];
        coordinates3857.push([ // ul
            ul[0], ul[1]
        ]);
        coordinates3857.push([ // ur
            lr[0], ul[1]
        ]);
        coordinates3857.push([ // ur
            lr[0], lr[1]
        ]);
        coordinates3857.push([ // ll
            ul[0], lr[1]
        ]);
        coordinates3857.push([ // ul
            ul[0], ul[1]
        ]);
        return coordinates3857;
    }

    async accept(): Promise<void> { }

    async processPoly(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing ...`);

        const coordinateUL4326Outer: Position = [
            bboxMap4326[0],
            bboxMap4326[3]
        ];
        this.coordinateUL3857Outer = turf.toMercator(coordinateUL4326Outer);
        this.coordinateUL3857Inner = [
            this.coordinateUL3857Outer[0] + MapLayerFrame.FRAME_____WIDTH,
            this.coordinateUL3857Outer[1] - MapLayerFrame.FRAME_____WIDTH,
        ];
        this.coordinateUL3857Crop = [
            this.coordinateUL3857Outer[0] - MapLayerFrame.FRAME_BASE_UNIT,
            this.coordinateUL3857Outer[1] + MapLayerFrame.FRAME_BASE_UNIT
        ];
        this.coordinateUL4326Crop = turf.toWgs84(this.coordinateUL3857Crop);

        const coordinateLR4326: Position = [
            bboxMap4326[2],
            bboxMap4326[1]
        ];
        this.coordinateLR3857Outer = turf.toMercator(coordinateLR4326);
        this.coordinateLR3857Inner = [
            this.coordinateLR3857Outer[0] - MapLayerFrame.FRAME_____WIDTH,
            this.coordinateLR3857Outer[1] + MapLayerFrame.FRAME_____WIDTH,
        ];
        this.coordinateLR3857Crop = [
            this.coordinateLR3857Outer[0] + MapLayerFrame.FRAME_BASE_UNIT,
            this.coordinateLR3857Outer[1] - this.layout.cropLROffY
        ];
        this.coordinateLR4326Crop = turf.toWgs84(this.coordinateLR3857Crop);

    }

    async processLine(): Promise<void> {

        const coordinates018: Position[][] = []; // the hachure shadows
        const coordinates035: Position[][] = [];

        const centerCoord3857: Position = [
            this.coordinateLR3857Inner[0] - 1800,
            this.coordinateLR3857Inner[1] - 800
        ];

        const createOval = (radiusX: number, radiusY: number, minGrad: number, maxGrad: number): Position[] => {
            const ovalPositions: Position[] = [];
            for (let grad = minGrad; grad <= maxGrad; grad += 5) {
                ovalPositions.push([
                    centerCoord3857[0] + Math.cos(grad * PPGeometry.GRAD_TO_RAD) * radiusX,
                    centerCoord3857[1] + Math.sin(grad * PPGeometry.GRAD_TO_RAD) * radiusY,
                ]);
            }
            return ovalPositions;
        }
        const ovalPositionsA = createOval(400, 200, 0, 360);
        const ovalPositionsB = createOval(300, 100, 0, 360);

        const ovalPositionsC = createOval(370, 170, -55, 35);
        const ovalPositionsD = createOval(370, 170, 180 - 35, 180 + 60);

        coordinates035.push(ovalPositionsA.map(p => turf.toWgs84(p)));
        coordinates018.push(ovalPositionsB.map(p => turf.toWgs84(p)));
        coordinates018.push(ovalPositionsC.map(p => turf.toWgs84(p)));
        coordinates018.push(ovalPositionsD.map(p => turf.toWgs84(p)));

        this.multiPolyline018 = {
            type: 'MultiLineString',
            coordinates: coordinates018
        };
        this.multiPolyline035 = {
            type: 'MultiLineString',
            coordinates: coordinates035
        };

        this.createLabel('VIENNA', {
            type: 'LineString',
            coordinates: coordinates035[0]
        }, -0.335);
        this.createLabel('H.FLEISCHER', {
            type: 'LineString',
            coordinates: coordinates035[0]
        }, 0.595);
        this.createLabel('04.06.25', {
            type: 'LineString',
            coordinates: [
                [
                    centerCoord3857[0] - 400,
                    centerCoord3857[1] + 45
                ], [
                    centerCoord3857[0] + 400,
                    centerCoord3857[1] + 45
                ]
            ].map(p => turf.toWgs84(p))
        }, 0.25, MapDefs.DEFAULT_TEXT_SCALE__LOCATION * 1.25);

        const workerInput: IWorkerPolyInputLineLabel = {
            name: this.name,
            tileData: this.tileData,
            outin: [0, 0], // not used
            labelDefs: this.labelDefs,
            bboxClp4326: [
                this.coordinateUL4326Crop[0],
                this.coordinateLR4326Crop[1],
                this.coordinateLR4326Crop[0],
                this.coordinateUL4326Crop[1]
            ],
            bboxMap4326: [
                this.coordinateUL4326Crop[0],
                this.coordinateLR4326Crop[1],
                this.coordinateLR4326Crop[0],
                this.coordinateUL4326Crop[1]
            ]
        };

        const polyTextProm = new Promise<void>((resolve, reject) => {
            const workerInstance = new Worker(new URL('../linelabel/worker_poly_l_linelabel.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {

                const workerOutput: IWorkerPolyOutputLineLabel = e.data;

                // this.polyData = workerOutput.polyData;
                console.log('workerOutput.polyText', workerOutput.polyText); // workerOutput.polyText;
                workerOutput.polyText.forEach(p => {
                    const coordinates018: Position[][] = p.geometry.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
                    this.multiPolyline018.coordinates.push(...coordinates018);
                });

                workerInstance.terminate();
                resolve();
            };
            workerInstance.onerror = (e) => {
                workerInstance.terminate();
                reject(e);
            };
            workerInstance.postMessage(workerInput);
        });
        await polyTextProm;

        const transformMultiPolyline = (multiPolyline: MultiLineString): MultiLineString => {

            let coordinates3857 = PPProjection.projectPosition2(multiPolyline.coordinates, turf.toMercator);
            coordinates3857 = PPTransformation.transformPosition2(coordinates3857, PPTransformation.matrixTranslationInstance(- centerCoord3857[0], -centerCoord3857[1]));
            coordinates3857 = PPTransformation.transformPosition2(coordinates3857, PPTransformation.matrixRotationInstance(8 * PPGeometry.GRAD_TO_RAD));
            coordinates3857 = PPTransformation.transformPosition2(coordinates3857, PPTransformation.matrixTranslationInstance(centerCoord3857[0], centerCoord3857[1]));
            return {
                type: 'MultiLineString',
                coordinates: PPProjection.projectPosition2(coordinates3857, turf.toWgs84)
            }
        }
        this.multiPolyline018 = transformMultiPolyline(this.multiPolyline018);
        this.multiPolyline035 = transformMultiPolyline(this.multiPolyline035);

    }

    async processPlot(): Promise<void> {
        // nothing
    }

    async createLabel(name: string, path: LineString, distance: number, txtscale: number = MapDefs.DEFAULT_TEXT_SCALE__LOCATION) {



        const labelLineFeatureDeg: Feature<LineString, GeoJsonProperties> = turf.feature(path, {
            'name': name
        })
        const labelDefDeg: ILabelDefLineLabel = {
            tileName: name,
            plotName: name,
            distance: distance > 0 ? distance : 1 + distance,
            vertical: distance > 0 ? 56 : -12,
            charsign: 1.2 * Math.sign(distance),
            txtscale,
            fonttype: 'noto_serif___bold_regular',
            idxvalid: JSONfn.stringify(() => true),
            fillprop: {
                type: 'none'
            }
        };
        this.tileData.push(labelLineFeatureDeg);
        this.labelDefs.push(labelDefDeg);

    }

}