import * as turf from '@turf/turf';
import { BBox, MultiLineString, MultiPolygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from "../vectortile/IVectorTileFeatureFilter";
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { ISkipOptions } from './ISkipOptions';

export interface ILayerProps {
    createLayerInstance: () => AMapLayer;
}

export abstract class AMapLayer implements IVectorTileFeatureFilter {

    readonly name: string;
    readonly filter: IVectorTileFeatureFilter;

    multiPolygon: MultiPolygon; // working object
    multiPolyline005: MultiLineString;
    multiPolyline010: MultiLineString;
    multiPolyline030: MultiLineString;
    multiPolyline050: MultiLineString;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        this.name = name;
        this.filter = filter;
        this.multiPolygon = {
            type: 'MultiPolygon',
            coordinates: []
        };
        this.multiPolyline005 = {
            type: 'MultiLineString',
            coordinates: []
        };
        this.multiPolyline010 = {
            type: 'MultiLineString',
            coordinates: []
        };
        this.multiPolyline030 = {
            type: 'MultiLineString',
            coordinates: []
        };
        this.multiPolyline050 = {
            type: 'MultiLineString',
            coordinates: []
        };
    }

    accepts(vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature): boolean {
        return this.filter.accepts(vectorTileKey, vectorTileFeature);
    }

    abstract openTile(vectorTileKey: IVectorTileKey): Promise<void>;
    abstract accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void>;
    abstract closeTile(vectorTileKey: IVectorTileKey): Promise<void>;

    clipToLayerMultipolygon(layer: AMapLayer, distance: number, options: ISkipOptions = {
        skip005: false,
        skip010: false,
        skip030: false,
        skip050: false,
        skipMlt: true
    }): void {

        if (layer?.multiPolygon && layer.multiPolygon.coordinates.length > 0) {

            // add some buffer margin for better readability
            const bufferResult = turf.buffer(layer.multiPolygon, distance, {
                units: 'meters'
            });
            turf.simplify(bufferResult!, {
                mutate: true,
                tolerance: 0.00001,
                highQuality: true
            });
            turf.cleanCoords(bufferResult, {
                mutate: true
            });

            if (!options?.skip005) {
                this.multiPolyline005 = VectorTileGeometryUtil.clipMultiPolyline(this.multiPolyline005, bufferResult!, distance);
            }
            if (!options?.skip010) {
                this.multiPolyline010 = VectorTileGeometryUtil.clipMultiPolyline(this.multiPolyline010, bufferResult!, distance);
            }
            if (!options?.skip030) {
                this.multiPolyline030 = VectorTileGeometryUtil.clipMultiPolyline(this.multiPolyline030, bufferResult!, distance);
            }
            if (!options?.skip050) {
                this.multiPolyline050 = VectorTileGeometryUtil.clipMultiPolyline(this.multiPolyline050, bufferResult!, distance);
            }
            if (!options?.skipMlt) {
                const featureC = turf.featureCollection([turf.feature(this.multiPolygon), bufferResult!]);
                const difference = turf.difference(featureC)!.geometry; // subtract inner polygons from outer
                const polygonsD = VectorTileGeometryUtil.destructureUnionPolygon(difference);
                this.multiPolygon = VectorTileGeometryUtil.restructureMultiPolygon(polygonsD);
            }

        }

    }

    abstract process(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void>;

    abstract postProcess(): Promise<void>;

    // abstract drawToCanvas(context: CanvasRenderingContext2D, coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position): void;
    drawToCanvas(context: CanvasRenderingContext2D, coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position): void {

        context.strokeStyle = 'rgba(0, 0, 0, 0.50)';

        const drawRing = (ring: Position[]) => {
            let isMove = true;
            ring.forEach(coordinate => {
                const coordinateCanvas = coordinate4326ToCoordinateCanvas(coordinate);
                if (isMove) {
                    context.moveTo(coordinateCanvas[0], coordinateCanvas[1]);
                } else {
                    context.lineTo(coordinateCanvas[0], coordinateCanvas[1]);
                }
                isMove = false;
            });
        }

        const drawPolyline = (polyline: Position[]) => {
            context.beginPath();
            drawRing(polyline);
            context.stroke();
        }

        const ratio = 10;

        context.lineWidth = 0.05 * ratio;
        this.multiPolyline005.coordinates.forEach(polyline005 => {
            drawPolyline(polyline005);
        });

        context.lineWidth = 0.10 * ratio;
        this.multiPolyline010.coordinates.forEach(polyline010 => {
            drawPolyline(polyline010);
        });

        context.lineWidth = 0.30 * ratio;
        this.multiPolyline030.coordinates.forEach(polyline030 => {
            drawPolyline(polyline030);
        });

        context.lineWidth = 0.50 * ratio;
        this.multiPolyline050.coordinates.forEach(polyline050 => {
            drawPolyline(polyline050);
        });

    }

    bboxClip(bboxMap4326: BBox): void {
        // console.log(`${this.name}, bbox-clip ...`);
        this.multiPolyline005 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline005, bboxMap4326);
        this.multiPolyline010 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline010, bboxMap4326);
        this.multiPolyline030 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline030, bboxMap4326);
        this.multiPolyline050 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline050, bboxMap4326);
    }

    connectPolylines(toleranceMeters: number, options: ISkipOptions = {
        skip005: false,
        skip010: false,
        skip030: false,
        skip050: false,
        skipMlt: true
    }): void {
        console.log(`${this.name}, connect-polylines ...`);
        if (!options.skip005) {
            this.multiPolyline005 = VectorTileGeometryUtil.connectMultiPolyline(this.multiPolyline005, toleranceMeters);
        }
        if (!options.skip010) {
            this.multiPolyline010 = VectorTileGeometryUtil.connectMultiPolyline(this.multiPolyline010, toleranceMeters);
        }
        if (!options.skip030) {
            this.multiPolyline030 = VectorTileGeometryUtil.connectMultiPolyline(this.multiPolyline030, toleranceMeters);
        }
        if (!options.skip050) {
            this.multiPolyline050 = VectorTileGeometryUtil.connectMultiPolyline(this.multiPolyline050, toleranceMeters);
        }
    }

    cleanCoords() {
        console.log(`${this.name}, cleaning coords ...`);
        turf.cleanCoords(this.multiPolyline005, {
            mutate: true
        });
        turf.cleanCoords(this.multiPolyline010, {
            mutate: true
        });
        turf.cleanCoords(this.multiPolyline030, {
            mutate: true
        });
        turf.cleanCoords(this.multiPolyline050, {
            mutate: true
        });
    }

}