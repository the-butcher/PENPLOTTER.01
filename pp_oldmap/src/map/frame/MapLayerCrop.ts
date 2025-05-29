import * as turf from '@turf/turf';
import { BBox, Feature, GeoJsonProperties, LineString, Position } from "geojson";
import { ISurface } from '../../util/ISurface';
import { JsonLoader } from '../../util/JsonLoader';
import { Surface } from '../../util/Surface';
import { AMapLayer } from "../AMapLayer";
import { MapLayerFrame } from './MapLayerFrame';

export class MapLayerCrop extends AMapLayer<LineString, GeoJsonProperties> {

    coordinateUL3857Outer: Position = [0, 0];
    coordinateLR3857Outer: Position = [0, 0];
    coordinateUL3857Inner: Position = [0, 0];
    coordinateLR3857Inner: Position = [0, 0];
    coordinateUL3857Crop: Position = [0, 0];
    coordinateLR3857Crop: Position = [0, 0];
    coordinateUL4326Crop: Position = [0, 0];
    coordinateLR4326Crop: Position = [0, 0];

    private surfacePath: string;

    constructor(name: string, surfacePath: string) {
        super(name, {
            accepts: () => {
                return false;
            }
        });
        this.surfacePath = surfacePath;
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
            this.coordinateLR3857Outer[1] - MapLayerFrame.FRAME_BASE_UNIT * 6
        ];
        this.coordinateLR4326Crop = turf.toWgs84(this.coordinateLR3857Crop);

        this.polyData = {
            type: 'MultiPolygon',
            coordinates: [

                [this.getRectCoordinates3857([ // upper frame bar
                    this.coordinateUL3857Inner[0],
                    this.coordinateUL3857Crop[1]
                ], [
                    this.coordinateLR3857Inner[0],
                    this.coordinateUL3857Inner[1]
                ]).map(c => turf.toWgs84(c))],
                [this.getRectCoordinates3857([ // right frame bar
                    this.coordinateLR3857Inner[0],
                    this.coordinateUL3857Crop[1]
                ], [
                    this.coordinateLR3857Crop[0],
                    this.coordinateLR3857Crop[1]
                ]).map(c => turf.toWgs84(c))],
                [this.getRectCoordinates3857([ // lower frame bar
                    this.coordinateUL3857Inner[0],
                    this.coordinateLR3857Inner[1]
                ], [
                    this.coordinateLR3857Inner[0],
                    this.coordinateLR3857Crop[1]
                ]).map(c => turf.toWgs84(c))],
                [this.getRectCoordinates3857([ // left frame bar
                    this.coordinateUL3857Crop[0],
                    this.coordinateUL3857Crop[1]
                ], [
                    this.coordinateUL3857Inner[0],
                    this.coordinateLR3857Crop[1]
                ]).map(c => turf.toWgs84(c))],

            ]
        };

    }

    async processLine(): Promise<void> {

        const coordinates018: Position[][] = []; // the hachure shadows
        const coordinates025: Position[][] = [];

        if (this.surfacePath !== '') {

            const surface = await new JsonLoader().load<ISurface>(this.surfacePath);
            const shadowCoordinates3857: Position[] = [
                turf.toWgs84([
                    this.coordinateUL3857Inner[0],
                    this.coordinateLR3857Inner[1]
                ]),
                turf.toWgs84([
                    this.coordinateLR3857Inner[0],
                    this.coordinateLR3857Inner[1]
                ]),
                turf.toWgs84([
                    this.coordinateLR3857Inner[0],
                    this.coordinateUL3857Inner[1]
                ])
            ];
            const shadowPolyline3857: Feature<LineString> = turf.feature({
                type: 'LineString',
                coordinates: shadowCoordinates3857
            });
            const length035 = turf.length(shadowPolyline3857, {
                units: 'meters'
            });
            let shedDist = 20;
            const shedCount = Math.ceil(length035 / shedDist);
            shedDist = length035 / shedCount;
            for (let i = 0; i <= shedCount; i++) {
                const position4326 = turf.along(shadowPolyline3857, i * shedDist, {
                    units: 'meters'
                }).geometry.coordinates;
                const position3857 = turf.toMercator(position4326);
                const surfaceValue = (Surface.getSurfaceValue(surface, position3857) - 200) * (i % 2 == 0 ? 0.60 : 0.60);
                if (surfaceValue > 0) {
                    coordinates025.push([
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

        }

        coordinates018.push([ // upper crop mark
            turf.toWgs84([
                this.coordinateUL3857Crop[0] + MapLayerFrame.FRAME_BASE_UNIT,
                this.coordinateUL3857Crop[1]
            ]),
            turf.toWgs84([
                this.coordinateUL3857Crop[0],
                this.coordinateUL3857Crop[1]
            ]),
            turf.toWgs84([
                this.coordinateUL3857Crop[0],
                this.coordinateUL3857Crop[1] - MapLayerFrame.FRAME_BASE_UNIT
            ]),
        ], [
            turf.toWgs84([
                this.coordinateLR3857Crop[0] - MapLayerFrame.FRAME_BASE_UNIT,
                this.coordinateLR3857Crop[1]
            ]),
            turf.toWgs84([
                this.coordinateLR3857Crop[0],
                this.coordinateLR3857Crop[1]
            ]),
            turf.toWgs84([
                this.coordinateLR3857Crop[0],
                this.coordinateLR3857Crop[1] + MapLayerFrame.FRAME_BASE_UNIT
            ]),
        ]);

        this.multiPolyline018 = {
            type: 'MultiLineString',
            coordinates: coordinates018
        };
        this.multiPolyline025 = {
            type: 'MultiLineString',
            coordinates: coordinates025
        };

    }

    async processPlot(): Promise<void> {
        // nothing
    }

}