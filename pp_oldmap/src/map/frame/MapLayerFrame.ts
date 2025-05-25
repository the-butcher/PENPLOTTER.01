import * as turf from '@turf/turf';
import { BBox, Feature, GeoJsonProperties, LineString, Position } from "geojson";
import { ISurface } from '../../util/ISurface';
import { JsonLoader } from '../../util/JsonLoader';
import { Surface } from '../../util/Surface';
import { AMapLayer } from "../AMapLayer";
import { IWorkerPolyOutputLineLabel } from '../linelabel/IWorkerPolyOutputLineLabel';
import { IWorkerPolyInputLineLabel } from '../linelabel/IWorkerPolyInputLineLabel';
import { MapDefs } from '../MapDefs';
// @ts-expect-error no index file
import * as JSONfn from 'json-fn';

export class MapLayerFrame extends AMapLayer<LineString, GeoJsonProperties> {

    coordinateUL3857Outer: Position = [0, 0];
    coordinateLR3857Outer: Position = [0, 0];
    coordinateUL3857Inner: Position = [0, 0];
    coordinateLR3857Inner: Position = [0, 0];
    radiusA = 100;
    radiusB = 1000;

    private surfacePath: string;

    constructor(name: string, surfacePath: string) {
        super(name, {
            accepts: () => {
                return false;
            }
        });
        this.surfacePath = surfacePath;
    }

    async accept(): Promise<void> { }

    async processPoly(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing ...`);

        const frameWidth = 100;

        const coordinateUL4326Outer: Position = [
            bboxMap4326[0],
            bboxMap4326[3]
        ];
        this.coordinateUL3857Outer = turf.toMercator(coordinateUL4326Outer);
        this.coordinateUL3857Inner = [
            this.coordinateUL3857Outer[0] + frameWidth,
            this.coordinateUL3857Outer[1] - frameWidth,
        ];

        const coordinateLR4326: Position = [
            bboxMap4326[2],
            bboxMap4326[1]
        ];
        this.coordinateLR3857Outer = turf.toMercator(coordinateLR4326);
        this.coordinateLR3857Inner = [
            this.coordinateLR3857Outer[0] - frameWidth,
            this.coordinateLR3857Outer[1] + frameWidth,
        ];

        const getCircleCoordinates3857 = (center3857: Position, radius: number): Position[] => {
            const coordinates3857: Position[] = [];
            for (let i = 0; i <= Math.PI * 2; i += Math.PI / 18) {
                coordinates3857.push([
                    center3857[0] + Math.cos(i) * radius,
                    center3857[1] + Math.sin(i) * radius,
                ])
            };
            return coordinates3857;
        }

        const getRectCoordinates3857 = (ul: Position, lr: Position): Position[] => {
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

        this.polyData = {
            type: 'MultiPolygon',
            coordinates: [
                [getCircleCoordinates3857(this.coordinateUL3857Outer, this.radiusA).map(c => turf.toWgs84(c))],
                [getCircleCoordinates3857(this.coordinateLR3857Inner, this.radiusB).map(c => turf.toWgs84(c))],
                [getRectCoordinates3857([ // upper frame bar
                    this.coordinateUL3857Inner[0], this.coordinateUL3857Outer[1]
                ], [
                    this.coordinateLR3857Inner[0], this.coordinateUL3857Inner[1]
                ]).map(c => turf.toWgs84(c))],
                [getRectCoordinates3857([ // right frame bar
                    this.coordinateLR3857Inner[0], this.coordinateUL3857Outer[1]
                ], [
                    this.coordinateLR3857Outer[0], this.coordinateLR3857Outer[1]
                ]).map(c => turf.toWgs84(c))],
                [getRectCoordinates3857([ // lower frame bar
                    this.coordinateUL3857Inner[0], this.coordinateLR3857Inner[1]
                ], [
                    this.coordinateLR3857Inner[0], this.coordinateLR3857Outer[1]
                ]).map(c => turf.toWgs84(c))],
                [getRectCoordinates3857([ // left frame bar
                    this.coordinateUL3857Outer[0], this.coordinateUL3857Outer[1]
                ], [
                    this.coordinateUL3857Inner[0], this.coordinateLR3857Outer[1]
                ]).map(c => turf.toWgs84(c))],

            ]
        };

    }

    async processLine(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        const coordinates018: Position[][] = [];
        let coordinates035: Position[][] = [];
        if (this.surfacePath !== '') {

            const surface = await new JsonLoader().load<ISurface>(this.surfacePath);

            const arcCoordinates3857: Position[] = [];
            for (let i = Math.PI / 2; i <= Math.PI; i += Math.PI / 18) {
                arcCoordinates3857.push([
                    this.coordinateLR3857Inner[0] + Math.cos(i) * this.radiusB,
                    this.coordinateLR3857Inner[1] + Math.sin(i) * this.radiusB,
                ])
            };
            arcCoordinates3857.reverse();

            coordinates035.push([
                turf.toWgs84([
                    this.coordinateUL3857Inner[0],
                    this.coordinateLR3857Inner[1]
                ]),
                turf.toWgs84([
                    this.coordinateLR3857Inner[0] - this.radiusB,
                    this.coordinateLR3857Inner[1]
                ]),
                ...arcCoordinates3857.map(c => turf.toWgs84(c)),
                turf.toWgs84([
                    this.coordinateLR3857Inner[0],
                    this.coordinateLR3857Inner[1] + this.radiusB
                ]),
                turf.toWgs84([
                    this.coordinateLR3857Inner[0],
                    this.coordinateUL3857Inner[1]
                ])
            ]);
            const polyline035: Feature<LineString> = turf.feature({
                type: 'LineString',
                coordinates: coordinates035[0]
            });


            const length035 = turf.length(polyline035, {
                units: 'meters'
            });

            let shedDist = 25;
            const shedCount = Math.ceil(length035 / shedDist);
            shedDist = length035 / shedCount;
            for (let i = 0; i <= shedCount; i++) {

                const position4326 = turf.along(polyline035, i * shedDist, {
                    units: 'meters'
                }).geometry.coordinates;
                const position3857 = turf.toMercator(position4326);
                const surfaceValue = (Surface.getSurfaceValue(surface, position3857) - 200) * 0.5;

                coordinates018.push([ // upper crop mark
                    turf.toWgs84([
                        position3857[0] + 20,
                        position3857[1] - 20,
                    ]),
                    turf.toWgs84([
                        position3857[0] + surfaceValue,
                        position3857[1] - surfaceValue,
                    ])
                ]);

            }

        }



        coordinates018.push([ // upper crop mark
            turf.toWgs84([
                this.coordinateUL3857Outer[0] + this.radiusA,
                this.coordinateUL3857Outer[1]
            ]),
            turf.toWgs84(this.coordinateUL3857Outer),
            turf.toWgs84([
                this.coordinateUL3857Outer[0],
                this.coordinateUL3857Outer[1] - this.radiusA
            ])
        ], [ // lower crop mark
            turf.toWgs84([
                this.coordinateLR3857Outer[0] - this.radiusA,
                this.coordinateLR3857Outer[1]
            ]),
            turf.toWgs84(this.coordinateLR3857Outer),
            turf.toWgs84([
                this.coordinateLR3857Outer[0],
                this.coordinateLR3857Outer[1] + this.radiusA
            ])
        ]);

        const outerFrameMargin = this.radiusA * 1.2;
        const coordinates050: Position[][] = [
            [ // top and right outer frame
                turf.toWgs84([
                    this.coordinateUL3857Outer[0] + outerFrameMargin,
                    this.coordinateUL3857Outer[1]
                ]),
                turf.toWgs84([
                    this.coordinateLR3857Outer[0],
                    this.coordinateUL3857Outer[1]
                ]),
                turf.toWgs84([
                    this.coordinateLR3857Outer[0],
                    this.coordinateLR3857Outer[1] + outerFrameMargin
                ])
            ],
            [ // lower and left outer frame
                turf.toWgs84([
                    this.coordinateLR3857Outer[0] - outerFrameMargin,
                    this.coordinateLR3857Outer[1]
                ]),
                turf.toWgs84([
                    this.coordinateUL3857Outer[0],
                    this.coordinateLR3857Outer[1]
                ]),
                turf.toWgs84([
                    this.coordinateUL3857Outer[0],
                    this.coordinateUL3857Outer[1] - outerFrameMargin
                ])
            ],
        ];

        const innerFrameMargin = this.radiusA * 0.2;
        const coordinates025: Position[][] = [
            [
                turf.toWgs84([
                    this.coordinateUL3857Outer[0] + innerFrameMargin,
                    this.coordinateUL3857Outer[1] - innerFrameMargin
                ]),
                turf.toWgs84([
                    this.coordinateLR3857Outer[0] - innerFrameMargin,
                    this.coordinateUL3857Outer[1] - innerFrameMargin
                ]),
                turf.toWgs84([
                    this.coordinateLR3857Outer[0] - innerFrameMargin,
                    this.coordinateLR3857Outer[1] + innerFrameMargin
                ]),
                turf.toWgs84([
                    this.coordinateUL3857Outer[0] + innerFrameMargin,
                    this.coordinateLR3857Outer[1] + innerFrameMargin
                ]),
                turf.toWgs84([
                    this.coordinateUL3857Outer[0] + innerFrameMargin,
                    this.coordinateUL3857Outer[1] - innerFrameMargin
                ])
            ]
        ];



        // UL and RL corner markers
        this.multiPolyline018 = {
            type: 'MultiLineString',
            coordinates: coordinates018
        };

        this.multiPolyline025 = {
            type: 'MultiLineString',
            coordinates: coordinates025
        };

        this.multiPolyline035 = {
            type: 'MultiLineString',
            coordinates: [] // coordinates035
        };

        this.multiPolyline050 = {
            type: 'MultiLineString',
            coordinates: coordinates050
        };

        // EXPERIMENTAL from here

        const arcCoordinates3857: Position[] = [];
        for (let i = Math.PI / 2; i <= Math.PI; i += Math.PI / 18) {
            arcCoordinates3857.push([
                this.coordinateLR3857Inner[0] + Math.cos(i) * this.radiusB * 0.65,
                this.coordinateLR3857Inner[1] + Math.sin(i) * this.radiusB * 0.65,
            ])
        };
        arcCoordinates3857.reverse();

        coordinates035 = [];
        coordinates035.push([
            ...arcCoordinates3857.map(c => turf.toWgs84(c))
        ]);

        this.tileData.push(turf.feature({
            type: 'LineString',
            coordinates: coordinates035[0]
        }, {
            'name': 'GREIN'
        }));

        const workerInput: IWorkerPolyInputLineLabel = {
            name: this.name,
            tileData: this.tileData,
            outin: [0, 0], // not used
            labelDefs: [
                {
                    tileName: 'GREIN',
                    plotName: 'GREIN',
                    distance: 0.01,
                    vertical: 0,
                    charsign: 1.2,
                    txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION * 6,
                    fonttype: 'noto_serif___bold_regular',
                    idxvalid: JSONfn.stringify(() => true),
                    fillprop: {
                        type: 'none'
                    }
                }
            ],
            bboxClp4326,
            bboxMap4326
        };

        const polyTextProm = new Promise<void>((resolve, reject) => {
            const workerInstance = new Worker(new URL('../linelabel/worker_poly_l_linelabel.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerPolyOutputLineLabel = e.data;
                // this.polyData = workerOutput.polyData;
                console.log('workerOutput.polyText', workerOutput.polyText); // workerOutput.polyText;
                workerOutput.polyText.forEach(p => {
                    const coordinates035: Position[][] = p.geometry.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
                    this.multiPolyline035.coordinates.push(...coordinates035);
                })


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



    }

    async processPlot(): Promise<void> {
        // nothing
    }

}