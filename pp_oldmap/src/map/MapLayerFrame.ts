import { BBox, Position } from "geojson";
import { IVectorTileFeatureFilter } from "../vectortile/IVectorTileFeatureFilter";
import { AMapLayer } from "./AMapLayer";
import * as turf from '@turf/turf';

export class MapLayerFrame extends AMapLayer {

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
    }

    async openTile(): Promise<void> { }

    async accept(): Promise<void> { }

    async closeTile(): Promise<void> { }

    async process(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing ...`);

        const coordinateUL4326: Position = [
            bboxMap4326[0],
            bboxMap4326[3]
        ];
        const coordinateUL3857 = turf.toMercator(coordinateUL4326);

        const coordinateLR4326: Position = [
            bboxMap4326[2],
            bboxMap4326[1]
        ];
        const coordinateLR3857 = turf.toMercator(coordinateLR4326);

        const radius = 50;
        const getCircleCoordinates3857 = (center3857: Position): Position[] => {
            const coordinates3857: Position[] = [];
            for (let i = 0; i <= Math.PI * 2; i += Math.PI / 9) {
                coordinates3857.push([
                    center3857[0] + Math.cos(i) * radius * 2,
                    center3857[1] + Math.sin(i) * radius * 2,
                ])
            };
            return coordinates3857;
        }

        this.multiPolygon = {
            type: 'MultiPolygon',
            coordinates: [
                [getCircleCoordinates3857(coordinateUL3857).map(c => turf.toWgs84(c))],
                [getCircleCoordinates3857(coordinateLR3857).map(c => turf.toWgs84(c))]
            ]
        };

        // UL and RL corner markers
        this.multiPolyline030 = {
            type: 'MultiLineString',
            coordinates: [
                [
                    turf.toWgs84([
                        coordinateUL3857[0] + radius,
                        coordinateUL3857[1]
                    ]),
                    turf.toWgs84(coordinateUL3857),
                    turf.toWgs84([
                        coordinateUL3857[0],
                        coordinateUL3857[1] - radius
                    ])
                ],
                [
                    turf.toWgs84([
                        coordinateLR3857[0] - radius,
                        coordinateLR3857[1]
                    ]),
                    turf.toWgs84(coordinateLR3857),
                    turf.toWgs84([
                        coordinateLR3857[0],
                        coordinateLR3857[1] + radius
                    ])
                ]
            ]
        }

        // this.multiPolyline050 = {
        //     type: 'MultiLineString',
        //     coordinates: [
        //         [
        //             [bboxMap4326[0], bboxMap4326[1]], // LL
        //             [bboxMap4326[2], bboxMap4326[1]], // LR
        //             [bboxMap4326[2], bboxMap4326[3]], // UR
        //             [bboxMap4326[0], bboxMap4326[3]], // UL
        //             [bboxMap4326[0], bboxMap4326[1]], // LL
        //         ]
        //     ]
        // }

        console.log(`${this.name}, done`);

    }

}