import * as turf from '@turf/turf';
import { BBox, Feature, GeoJsonProperties, LineString, MultiLineString, Polygon, Position } from "geojson";
import { AMapLayer } from "../AMapLayer";
import { IWorkerPolyInputLineLabel } from '../linelabel/IWorkerPolyInputLineLabel';
import { IWorkerPolyOutputLineLabel } from '../linelabel/IWorkerPolyOutputLineLabel';
import { MapDefs } from '../MapDefs';
// @ts-expect-error no index file
import * as JSONfn from 'json-fn';
import { PPGeometry, PPTransformation } from 'pp-geom';
import { GeoJsonLoader } from '../../util/GeoJsonLoader';
import { ILabelDefLineLabel } from '../linelabel/ILabelDefLineLabel';
import { MapLayerRoad2 } from '../road2/MapLayerRoad2';
import { ILayout } from './ILayout';

export class MapLayerFrame extends AMapLayer<LineString, GeoJsonProperties> {

    coordinateUL3857Outer: Position = [0, 0];
    coordinateLR3857Outer: Position = [0, 0];
    coordinateUL3857Inner: Position = [0, 0];
    coordinateLR3857Inner: Position = [0, 0];
    coordinateUL3857Crop: Position = [0, 0];
    coordinateLR3857Crop: Position = [0, 0];
    coordinateUL4326Crop: Position = [0, 0];
    coordinateLR4326Crop: Position = [0, 0];


    private readonly magnNord: number;

    public static FRAME_BASE_UNIT = 100;
    public static FRAME_____WIDTH = 150;

    private labelDefs: ILabelDefLineLabel[] = [];
    private layout: ILayout;

    constructor(name: string, magnNord: number, layout: ILayout) {
        super(name, {
            accepts: () => {
                return false;
            }
        });
        this.layout = layout;
        this.magnNord = magnNord;
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

        // this.polyData = {
        //     type: 'MultiPolygon',
        //     coordinates: [

        //         [this.getRectCoordinates3857([ // upper frame bar
        //             this.coordinateUL3857Inner[0],
        //             this.coordinateUL3857Crop[1]
        //         ], [
        //             this.coordinateLR3857Inner[0],
        //             this.coordinateUL3857Inner[1]
        //         ]).map(c => turf.toWgs84(c))],
        //         [this.getRectCoordinates3857([ // right frame bar
        //             this.coordinateLR3857Inner[0],
        //             this.coordinateUL3857Crop[1]
        //         ], [
        //             this.coordinateLR3857Crop[0],
        //             this.coordinateLR3857Crop[1]
        //         ]).map(c => turf.toWgs84(c))],
        //         [this.getRectCoordinates3857([ // lower frame bar
        //             this.coordinateUL3857Inner[0],
        //             this.coordinateLR3857Inner[1]
        //         ], [
        //             this.coordinateLR3857Inner[0],
        //             this.coordinateLR3857Crop[1]
        //         ]).map(c => turf.toWgs84(c))],
        //         [this.getRectCoordinates3857([ // left frame bar
        //             this.coordinateUL3857Crop[0],
        //             this.coordinateUL3857Crop[1]
        //         ], [
        //             this.coordinateUL3857Inner[0],
        //             this.coordinateLR3857Crop[1]
        //         ]).map(c => turf.toWgs84(c))],

        //     ]
        // };

    }

    async processLine(): Promise<void> {

        const coordinates018: Position[][] = []; // crosshair
        const coordinates025: Position[][] = []; // at country outline, inner frame
        const coordinates050: Position[][] = [
            this.getRectCoordinates3857(this.coordinateUL3857Outer, this.coordinateLR3857Outer).map(c => turf.toWgs84(c))
        ];

        const innerFrameMargin = 25;
        coordinates025.push(...[
            this.getRectCoordinates3857([
                this.coordinateUL3857Outer[0] + innerFrameMargin,
                this.coordinateUL3857Outer[1] - innerFrameMargin
            ], [
                this.coordinateLR3857Outer[0] - innerFrameMargin,
                this.coordinateLR3857Outer[1] + innerFrameMargin
            ]).map(c => turf.toWgs84(c))
        ]);



        // load border of austria
        const atBorderCollection = await new GeoJsonLoader().load<Polygon, GeoJsonProperties>('at_border.geojson');

        let atBorder3857 = turf.toMercator(atBorderCollection.features[0]).geometry;
        let atBBox3857 = turf.bbox(atBorder3857);

        const centerX3857 = (this.coordinateLR3857Outer[0] + this.coordinateUL3857Outer[0]) / 2;
        const centerY3857 = (this.coordinateLR3857Outer[1] + this.coordinateUL3857Outer[1]) / 2;

        let atCrosshair: MultiLineString = {
            type: 'MultiLineString',
            coordinates: [
                [
                    [
                        centerX3857,
                        atBBox3857[1] - 50000
                    ],
                    [
                        centerX3857,
                        atBBox3857[3] + 50000
                    ]
                ],
                [
                    [
                        atBBox3857[0] - 10000,
                        centerY3857
                    ],
                    [
                        atBBox3857[2] + 50000,
                        centerY3857
                    ]
                ]
            ]
        }

        const matrixS = PPTransformation.matrixScaleInstance(0.0009, 0.0009);
        atBorder3857 = PPTransformation.transformPolygon(atBorder3857, matrixS);
        atCrosshair = PPTransformation.transformMultiPolyline(atCrosshair, matrixS);
        atBBox3857 = turf.bbox(atBorder3857);

        const matrixT = PPTransformation.matrixTranslationInstance(this.coordinateLR3857Inner[0] - atBBox3857[2], this.coordinateLR3857Inner[1] - atBBox3857[1] - 675); //  + 100
        atBorder3857 = PPTransformation.transformPolygon(atBorder3857, matrixT);
        atCrosshair = PPTransformation.transformMultiPolyline(atCrosshair, matrixT);
        atBBox3857 = turf.bbox(atBorder3857);

        const atBorderCoordinates: Position[] = atBorder3857.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        coordinates025.push(atBorderCoordinates.map(c => turf.toWgs84(c)));
        PPGeometry.destructurePolylines(atCrosshair).forEach(p => {
            coordinates018.push(p.coordinates.map(c => turf.toWgs84(c)));
        });

        this.multiPolyline018 = {
            type: 'MultiLineString',
            coordinates: coordinates018
        };

        this.multiPolyline025 = {
            type: 'MultiLineString',
            coordinates: coordinates025
        };

        this.multiPolyline050 = {
            type: 'MultiLineString',
            coordinates: coordinates050
        };

        // const frameCrop = await new GeoJsonLoader().load<Polygon, GeoJsonProperties>('crop_hallein.geojson');
        // console.log('frameCrop', frameCrop);
        // const frameCropInner: MultiPolygon = {
        //     type: 'MultiPolygon',
        //     coordinates: [[frameCrop.features[0].geometry.coordinates[1].reverse()]]
        // };
        // this.multiPolyline025 = PPGeometry.clipMultiPolyline(this.multiPolyline025, turf.feature(frameCropInner));
        // this.multiPolyline050 = PPGeometry.clipMultiPolyline(this.multiPolyline050, turf.feature(frameCropInner));

        const coordinateUL4326Inner = turf.toWgs84(this.coordinateUL3857Inner);
        const coordinateLR4326Inner = turf.toWgs84(this.coordinateLR3857Inner);

        // scale bar
        const scalebarCenterX3857 = (this.coordinateUL3857Inner[0] + this.coordinateLR3857Inner[0]) / 2;
        const centerCoord4326 = turf.toWgs84([
            scalebarCenterX3857,
            (this.coordinateUL3857Inner[1] + this.coordinateLR3857Inner[1]) / 2
        ]);
        const mercatorScale = 1 / Math.cos(centerCoord4326[1] * PPGeometry.GRAD_TO_RAD);

        const offsetMetersX = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000].map(o => o + this.layout.scalebarOff[0]);
        const offsetMetersYMin = this.layout.scalebarOff[1];
        const offsetMetersYMax = offsetMetersYMin + 50;
        offsetMetersX.forEach(offsetMetersX => {
            this.multiPolyline018.coordinates.push([
                [
                    scalebarCenterX3857 + offsetMetersX * mercatorScale,
                    this.coordinateLR3857Outer[1] - offsetMetersYMin
                ],
                [
                    scalebarCenterX3857 + offsetMetersX * mercatorScale,
                    this.coordinateLR3857Outer[1] - offsetMetersYMax
                ]
            ].map(c => turf.toWgs84(c)));
        });
        [offsetMetersYMin, offsetMetersYMax].forEach(offsetMetersY => {
            this.multiPolyline018.coordinates.push([
                [
                    scalebarCenterX3857 + offsetMetersX[0] * mercatorScale,
                    this.coordinateLR3857Outer[1] - offsetMetersY
                ],
                [
                    scalebarCenterX3857 + offsetMetersX[offsetMetersX.length - 1] * mercatorScale, // - 1000 * mercatorScale,
                    this.coordinateLR3857Outer[1] - offsetMetersY
                ]
            ].map(c => turf.toWgs84(c)));
        });
        for (let i = 0; i < offsetMetersX.length; i += 2) {
            this.multiPolyline018.coordinates.push([
                [
                    scalebarCenterX3857 + offsetMetersX[i] * mercatorScale,
                    this.coordinateLR3857Outer[1] - (offsetMetersYMin + offsetMetersYMax) / 2
                ],
                [
                    scalebarCenterX3857 + offsetMetersX[i + 1] * mercatorScale,
                    this.coordinateLR3857Outer[1] - (offsetMetersYMin + offsetMetersYMax) / 2
                ]
            ].map(c => turf.toWgs84(c)));
        }

        const mapMetersX = this.coordinateLR3857Crop[0] - this.coordinateUL3857Crop[0];
        const mapMetersY = this.coordinateUL3857Crop[1] - this.coordinateLR3857Crop[1];
        const mrcMetersX = mapMetersX / mercatorScale;
        const outMetersX = 0.176; // when portrait
        // const outMetersY = 0.245; // when landscape
        console.log('scale', mapMetersX, mrcMetersX, outMetersX, mapMetersX / outMetersX, mrcMetersX / outMetersX);

        const outMetersY = mapMetersY / (mapMetersX / outMetersX);
        console.log('outMetersY', outMetersY);

        let offsetMetersYLbl = offsetMetersYMin - 30
        await this.createLabel('SCALE ~1:25000', turf.toWgs84([
            scalebarCenterX3857 + offsetMetersX[offsetMetersX.length - 2] * mercatorScale - 320,
            this.coordinateLR3857Outer[1] - offsetMetersYLbl
        ]), turf.toWgs84([
            scalebarCenterX3857 + offsetMetersX[offsetMetersX.length - 2] * mercatorScale + 320,
            this.coordinateLR3857Outer[1] - offsetMetersYLbl
        ]));

        offsetMetersYLbl = offsetMetersYMax + 95
        await this.createLabel('0', turf.toWgs84([
            scalebarCenterX3857 + offsetMetersX[0] * mercatorScale - 8,
            this.coordinateLR3857Outer[1] - offsetMetersYLbl
        ]), turf.toWgs84([
            scalebarCenterX3857 + offsetMetersX[0] * mercatorScale + 100,
            this.coordinateLR3857Outer[1] - offsetMetersYLbl
        ]));
        await this.createLabel('1000', turf.toWgs84([
            scalebarCenterX3857 + offsetMetersX[offsetMetersX.length - 2] * mercatorScale - 100,
            this.coordinateLR3857Outer[1] - offsetMetersYLbl
        ]), turf.toWgs84([
            scalebarCenterX3857 + offsetMetersX[offsetMetersX.length - 2] * mercatorScale + 100,
            this.coordinateLR3857Outer[1] - offsetMetersYLbl
        ]));
        await this.createLabel('2000 METERS', turf.toWgs84([
            scalebarCenterX3857 + offsetMetersX[offsetMetersX.length - 1] * mercatorScale - 180,
            this.coordinateLR3857Outer[1] - offsetMetersYLbl
        ]), turf.toWgs84([
            scalebarCenterX3857 + offsetMetersX[offsetMetersX.length - 1] * mercatorScale + 400,
            this.coordinateLR3857Outer[1] - offsetMetersYLbl
        ]));

        offsetMetersYLbl = offsetMetersYMax + 200;
        await this.createLabel('CONTOUR INTERVAL 50 METERS', turf.toWgs84([
            scalebarCenterX3857 + offsetMetersX[offsetMetersX.length - 2] * mercatorScale - 750,
            this.coordinateLR3857Outer[1] - offsetMetersYLbl
        ]), turf.toWgs84([
            scalebarCenterX3857 + offsetMetersX[offsetMetersX.length - 2] * mercatorScale + 750,
            this.coordinateLR3857Outer[1] - offsetMetersYLbl
        ]));

        // await this.createLabel('GREIN', turf.toWgs84([
        //     this.coordinateLR3857Outer[0] - 2010,
        //     this.coordinateLR3857Outer[1] - offsetMetersYLbl + 150
        // ]), turf.toWgs84([
        //     this.coordinateLR3857Outer[0] - 1000,
        //     this.coordinateLR3857Outer[1] - offsetMetersYLbl + 150
        // ]), MapDefs.DEFAULT_TEXT_SCALE__LOCATION * 3.20);
        await this.createLabel('HALLEIN', turf.toWgs84([
            this.coordinateLR3857Outer[0] + this.layout.mapNameOff[0],
            this.coordinateLR3857Outer[1] + this.layout.mapNameOff[1]
        ]), turf.toWgs84([
            this.coordinateLR3857Outer[0] + this.layout.mapNameOff[0] + 1000,
            this.coordinateLR3857Outer[1] + this.layout.mapNameOff[1]
        ]), MapDefs.DEFAULT_TEXT_SCALE__LOCATION * 2.23);

        // offsetMetersYLbl = offsetMetersYMax + 95
        await this.createLabel('DATA: BASEMAP.AT', turf.toWgs84([
            this.coordinateLR3857Outer[0] + this.layout.creditsOff[0],
            this.coordinateLR3857Outer[1] + this.layout.creditsOff[1]
        ]), turf.toWgs84([
            this.coordinateLR3857Outer[0] + this.layout.creditsOff[0] + 1000,
            this.coordinateLR3857Outer[1] + this.layout.creditsOff[1]
        ]));

        // // offsetMetersYLbl = offsetMetersYMax + 200
        // await this.createLabel('@FleischerHannes', turf.toWgs84([
        //     this.coordinateLR3857Outer[0] - 3000,
        //     this.coordinateLR3857Outer[1] - offsetMetersYLbl
        // ]), turf.toWgs84([
        //     this.coordinateLR3857Outer[0] - 2000,
        //     this.coordinateLR3857Outer[1] - offsetMetersYLbl
        // ]));

        // border labels
        const frcToMin = 1 / 60;

        const minX = coordinateUL4326Inner[0] + frcToMin - coordinateUL4326Inner[0] % frcToMin;
        const maxX = coordinateLR4326Inner[0] - coordinateLR4326Inner[0] % frcToMin;

        let index = 0;
        for (let labelX = minX; labelX <= maxX + frcToMin / 2; labelX += frcToMin) {
            await this.createLabelX(labelX, index++);
        }

        const maxY = coordinateUL4326Inner[1] - coordinateUL4326Inner[1] % frcToMin;
        const minY = coordinateLR4326Inner[1] + frcToMin - coordinateLR4326Inner[1] % frcToMin;

        index = 0;
        for (let labelY = minY; labelY <= maxY + frcToMin / 2; labelY += frcToMin) {
            await this.createLabelY(labelY, index++);
        }

        const nortarrowRayA: Position[] = [
            [
                this.coordinateUL3857Inner[0] + this.layout.northArrOff[0],
                this.coordinateLR3857Outer[1] - this.layout.northArrOff[1]
            ],
            [
                this.coordinateUL3857Inner[0] + this.layout.northArrOff[0],
                this.coordinateLR3857Outer[1] - this.layout.northArrOff[1] + 400
            ],
            [
                this.coordinateUL3857Inner[0] + this.layout.northArrOff[0] - 25,
                this.coordinateLR3857Outer[1] - this.layout.northArrOff[1] + 325
            ],
            [
                this.coordinateUL3857Inner[0] + this.layout.northArrOff[0],
                this.coordinateLR3857Outer[1] - this.layout.northArrOff[1] + 324
            ],
        ];
        // const magneticNorth = 4.92; // https://www.magnetic-declination.com/Austria/Grein/102707.html#google_vignette
        const magneticNorth = this.magnNord; // https://www.magnetic-declination.com/Austria/Hallein/103450.html
        let nortarrowRayB = PPTransformation.transformPosition1(nortarrowRayA, PPTransformation.matrixTranslationInstance(- (this.coordinateUL3857Inner[0] + this.layout.northArrOff[0]), this.layout.northArrOff[1] - this.coordinateLR3857Outer[1]));
        nortarrowRayB = PPTransformation.transformPosition1(nortarrowRayB, PPTransformation.matrixScaleInstance(-0.9, 0.9));
        nortarrowRayB = PPTransformation.transformPosition1(nortarrowRayB, PPTransformation.matrixRotationInstance(-magneticNorth * PPGeometry.GRAD_TO_RAD));
        nortarrowRayB = PPTransformation.transformPosition1(nortarrowRayB, PPTransformation.matrixTranslationInstance(this.coordinateUL3857Inner[0] + this.layout.northArrOff[0], this.coordinateLR3857Outer[1] - this.layout.northArrOff[1]));

        await this.createLabel(`${magneticNorth > 0 ? '+' : '-'}${this.formatDeg(magneticNorth)}${this.formatMin(magneticNorth)}`, turf.toWgs84([
            this.coordinateUL3857Inner[0] + this.layout.northArrOff[0] + 25,
            this.coordinateLR3857Outer[1] - this.layout.northArrOff[1]
        ]), turf.toWgs84([
            this.coordinateUL3857Inner[0] + this.layout.northArrOff[0] + 300,
            this.coordinateLR3857Outer[1] - this.layout.northArrOff[1]
        ]));

        this.multiPolyline018.coordinates.push(nortarrowRayA.map(p => turf.toWgs84(p)));
        this.multiPolyline018.coordinates.push(nortarrowRayB.map(p => turf.toWgs84(p)));

        let legendPosX3857 = this.coordinateUL3857Inner[0] + this.layout.legendOffX;
        let legendPosYIndex = 0;

        const createRoadSymbol = async (label: string, roadCategoryIndex: number, dashArray?: [number, number]): Promise<void> => {

            const legendPosY3857 = this.layout.legendOffY[legendPosYIndex++];

            const targetContainer = roadCategoryIndex > 3 ? this.multiPolyline025 : this.multiPolyline035;
            const roadScale = roadCategoryIndex === 0 ? 2 : 1.2;

            const bufferDistance = MapLayerRoad2.bufferDistances[roadCategoryIndex];

            if (bufferDistance > MapLayerRoad2.bufferDistanceMin) {
                targetContainer.coordinates.push([
                    [
                        legendPosX3857 - 300,
                        this.coordinateLR3857Outer[1] - legendPosY3857 + 32 - bufferDistance * roadScale
                    ],
                    [
                        legendPosX3857 - 80,
                        this.coordinateLR3857Outer[1] - legendPosY3857 + 32 - bufferDistance * roadScale
                    ]
                ].map(c => turf.toWgs84(c)));
            }

            let polylineUpper: MultiLineString = {
                type: 'MultiLineString',
                coordinates: [[
                    [
                        legendPosX3857 - 300,
                        this.coordinateLR3857Outer[1] - legendPosY3857 + 32 + bufferDistance * roadScale
                    ],
                    [
                        legendPosX3857 - 80,
                        this.coordinateLR3857Outer[1] - legendPosY3857 + 32 + bufferDistance * roadScale
                    ]
                ].map(c => turf.toWgs84(c))]
            };
            if (dashArray) {
                polylineUpper = PPGeometry.dashMultiPolyline(polylineUpper, dashArray);
            }
            targetContainer.coordinates.push(...polylineUpper.coordinates);
            await this.createLabel(label, turf.toWgs84([
                legendPosX3857 - 8,
                this.coordinateLR3857Outer[1] - legendPosY3857
            ]), turf.toWgs84([
                legendPosX3857 + 1000,
                this.coordinateLR3857Outer[1] - legendPosY3857
            ]));

            if (legendPosYIndex >= this.layout.legendOffY.length) {
                legendPosX3857 += 1250;
                legendPosYIndex = 0;
            }

        }

        await createRoadSymbol("HIGHWAY", 0);
        await createRoadSymbol("MAIN ROAD", 3);
        await createRoadSymbol("SECONDARY ROAD", 4);
        await createRoadSymbol("OTHER ROAD", 5, [16, 24]);
        await createRoadSymbol("GRAVEL ROAD", 6);
        await createRoadSymbol("PEDESTRIAN, FOOTPATH", 7, [16, 20]);


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

    }

    formatDeg(deg: number): string {
        return `${Math.floor(deg)}°`;
    }

    formatMin(deg: number): string {
        return `${Math.floor((deg % 1) * 60)}'`;
    }

    async createLabelX(labelX: number, index: number): Promise<void> {

        await this.createLabelX2(labelX, index, turf.toWgs84([
            this.coordinateLR3857Outer[0],
            this.coordinateLR3857Outer[1] + 30
        ]));
        await this.createLabelX2(labelX, index, turf.toWgs84(this.coordinateUL3857Inner));

    }

    async createLabelX2(labelX: number, index: number, coordinate4326: Position): Promise<void> {

        this.multiPolyline025.coordinates.push([
            [
                labelX,
                coordinate4326[1] + 0.0001
            ],
            [
                labelX,
                coordinate4326[1] + 0.0006
            ]
        ])

        await this.createLabel(this.formatMin(labelX), [
            labelX + 0.0001,
            coordinate4326[1] + 0.00015
        ], [
            labelX + 0.01,
            coordinate4326[1] + 0.00015
        ]);

        if (index === 0) {

            await this.createLabel(this.formatDeg(labelX), [
                labelX - 0.0013,
                coordinate4326[1] + 0.00015
            ], [
                labelX + 0.0013,
                coordinate4326[1] + 0.00015
            ]);

        }

    }

    async createLabelY(labelY: number, index: number): Promise<void> {

        await this.createLabelY2(labelY, index, turf.toWgs84([
            this.coordinateLR3857Outer[0] - 20,
            this.coordinateLR3857Outer[1]
        ]));
        await this.createLabelY2(labelY, index, turf.toWgs84(this.coordinateUL3857Inner));

    }

    async createLabelY2(labelY: number, index: number, coordinate4326: Position): Promise<void> {

        this.multiPolyline025.coordinates.push([
            [
                coordinate4326[0] - 0.0002,
                labelY,
            ],
            [
                coordinate4326[0] - 0.0009,
                labelY,
            ]
        ]);

        await this.createLabel(this.formatMin(labelY), [
            coordinate4326[0] - 0.0003,
            labelY + 0.01
        ], [
            coordinate4326[0] - 0.0003,
            labelY + 0.0001
        ]);

        if (index === 0) {

            await this.createLabel(this.formatDeg(labelY), [
                coordinate4326[0] - 0.0003,
                labelY + 0.01
            ], [
                coordinate4326[0] - 0.0003,
                labelY - 0.0010
            ]);

        }

        // const labelLineFeature4326: TProjectableFeature<LineString, IProjectableProperties> = {
        //     type: 'Feature',
        //     geometry: labelLineFeature.geometry,
        //     properties: {
        //         metersPerUnit: 1,
        //         projType: '4326',
        //         unitAbbr: 'm',
        //         unitName: 'meters',
        //         projectors: {
        //             "4326": turf.toWgs84,
        //             "proj": turf.toMercator
        //         }
        //     }
        // };
        // const font = await FacetypeFont.getInstance(labelDef.fonttype, labelDef.txtscale);
        // const glyphSetter = GlyphSetter.alongLabelLine(labelLineFeature4326, labelDef.charsign);
        // const labelLength = font.getLength(name, glyphSetter);
        // console.log(name, labelLength)

        // add feature having name


    }

    async createLabel(name: string, position4326A: Position, position4326B: Position, txtscale: number = MapDefs.DEFAULT_TEXT_SCALE__LOCATION) {

        const labelLineFeatureDeg: Feature<LineString, GeoJsonProperties> = turf.feature({
            type: 'LineString',
            coordinates: [
                position4326A,
                position4326B
            ]
        }, {
            'name': name
        })
        const labelDefDeg: ILabelDefLineLabel = {
            tileName: name,
            plotName: name,
            distance: 0.01,
            vertical: 0,
            charsign: 1.2,
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

    // createMainLabel(): void {

    //     const arcCoordinates3857: Position[] = [];
    //     for (let i = Math.PI / 2; i <= Math.PI; i += Math.PI / 18) {
    //         arcCoordinates3857.push([
    //             this.coordinateLR3857Inner[0] + Math.cos(i) * this.radiusB * 0.65,
    //             this.coordinateLR3857Inner[1] + Math.sin(i) * this.radiusB * 0.65,
    //         ])
    //     };
    //     arcCoordinates3857.reverse();

    //     // add feature having name
    //     this.tileData.push(turf.feature({
    //         type: 'LineString',
    //         coordinates: arcCoordinates3857.map(c => turf.toWgs84(c))
    //     }, {
    //         'name': 'GREIN'
    //     }));

    //     this.labelDefs.push({
    //         tileName: 'GREIN',
    //         plotName: 'GREIN',
    //         distance: 0.01,
    //         vertical: 0,
    //         charsign: 1.2,
    //         txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION * 6,
    //         fonttype: 'noto_serif___bold_regular',
    //         idxvalid: JSONfn.stringify(() => true),
    //         fillprop: {
    //             type: 'none'
    //         }
    //     });

    // }



    async processPlot(): Promise<void> {
        // nothing
    }

}