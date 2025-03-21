import * as turf from '@turf/turf';
import { BBox, GeoJsonProperties, LineString, Position } from "geojson";
import { IVectorTileFeatureFilter } from "../../vectortile/IVectorTileFeatureFilter";
import { AMapLayer } from "../AMapLayer";

export class MapLayerFrame extends AMapLayer<LineString, GeoJsonProperties> {

    coordinateUL3857: Position = [0, 0];
    coordinateLR3857: Position = [0, 0];
    radius = 50;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
    }

    async accept(): Promise<void> { }

    async processPoly(_bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing ...`);

        const coordinateUL4326: Position = [
            bboxMap4326[0],
            bboxMap4326[3]
        ];
        this.coordinateUL3857 = turf.toMercator(coordinateUL4326);

        const coordinateLR4326: Position = [
            bboxMap4326[2],
            bboxMap4326[1]
        ];
        this.coordinateLR3857 = turf.toMercator(coordinateLR4326);

        const getCircleCoordinates3857 = (center3857: Position): Position[] => {
            const coordinates3857: Position[] = [];
            for (let i = 0; i <= Math.PI * 2; i += Math.PI / 9) {
                coordinates3857.push([
                    center3857[0] + Math.cos(i) * this.radius * 2,
                    center3857[1] + Math.sin(i) * this.radius * 2,
                ])
            };
            return coordinates3857;
        }

        this.polyData = {
            type: 'MultiPolygon',
            coordinates: [
                [getCircleCoordinates3857(this.coordinateUL3857).map(c => turf.toWgs84(c))],
                [getCircleCoordinates3857(this.coordinateLR3857).map(c => turf.toWgs84(c))]
            ]
        };

    }

    async processLine(): Promise<void> {

        const coordinates: Position[][] = [
            [
                turf.toWgs84([
                    this.coordinateUL3857[0] + this.radius,
                    this.coordinateUL3857[1]
                ]),
                turf.toWgs84(this.coordinateUL3857),
                turf.toWgs84([
                    this.coordinateUL3857[0],
                    this.coordinateUL3857[1] - this.radius
                ])
            ],
            [
                turf.toWgs84([
                    this.coordinateLR3857[0] - this.radius,
                    this.coordinateLR3857[1]
                ]),
                turf.toWgs84(this.coordinateLR3857),
                turf.toWgs84([
                    this.coordinateLR3857[0],
                    this.coordinateLR3857[1] + this.radius
                ])
            ]
        ]

        // UL and RL corner markers
        this.multiPolyline010 = {
            type: 'MultiLineString',
            coordinates
        }

        // UL and RL corner markers
        this.multiPolyline030 = {
            type: 'MultiLineString',
            coordinates
        }

    }

    async processPlot(): Promise<void> {
        // nothing
    }

}