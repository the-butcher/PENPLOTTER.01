import * as turf from '@turf/turf';
import { BBox, Feature, Geometry, MultiLineString, MultiPolygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from "../vectortile/IVectorTileFeatureFilter";
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { UnionPolygon, VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { ISkipOptions } from './ISkipOptions';
import { IWorkerLineOutput } from './common/IWorkerLineOutput';

export interface ILayerProps {
    createLayerInstance: () => AMapLayer<Geometry>;
}

export abstract class AMapLayer<F extends Geometry> implements IVectorTileFeatureFilter {

    readonly name: string;
    readonly filter: IVectorTileFeatureFilter;

    /**
     * this layer's raw data, Polygons, LinesStrings or Points
     */
    tileData: Feature<F>[];
    polyData: MultiPolygon; // polygon (even for line and point layers) describing an area around this layer's features, meant to be ready after the processPoly method has run
    clipData: MultiPolygon; // polygon (even for line and point layers) describing an area around this layer's features, after clipping

    multiPolyline005: MultiLineString;
    multiPolyline010: MultiLineString;
    multiPolyline030: MultiLineString;
    multiPolyline050: MultiLineString;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        this.name = name;
        this.filter = filter;
        this.tileData = [];
        this.polyData = {
            type: 'MultiPolygon',
            coordinates: []
        };
        this.clipData = {
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

    abstract accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void>;

    clipToLayerMultipolygon(layer: AMapLayer<Geometry>, distance: number, options: ISkipOptions = {
        skip005: false,
        skip010: false,
        skip030: false,
        skip050: false,
        skipMlt: true
    }): void {

        if (layer?.polyData && layer.polyData.coordinates.length > 0) {

            // add some buffer margin for better readability
            const bufferResult = turf.buffer(layer.polyData, distance, {
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
                const featureC = turf.featureCollection([turf.feature(this.polyData), bufferResult!]);
                const difference: UnionPolygon = turf.difference(featureC)!.geometry; // subtract inner polygons from outer
                const polygonsD = VectorTileGeometryUtil.destructureUnionPolygon(difference);
                this.polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsD);
            }

        }

    }

    /**
     * meant to run after all data has been acquired,
     * build a base set of polygons from tile data
     * @param bboxClp4326
     * @param bboxMap4326
     */
    abstract processPoly(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void>;

    /**
     * build a base set of polylines, ready to be clipped
     * layers that rely on final lines after clipping should have their data ready in this step
     * @param bboxClp4326
     * @param bboxMap4326
     */
    abstract processLine(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void>;

    abstract postProcess(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void>;

    drawToCanvas(context: CanvasRenderingContext2D, coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position): void {

        context.strokeStyle = 'rgba(0, 0, 0, 0.50)';
        context.fillStyle = 'rgba(0, 0, 0, 0.10)';

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

        const drawPolygon = (polygon: Position[][]) => {
            context.beginPath();
            polygon.forEach(ring => {
                drawRing(ring);
            });
            context.fill();
            // context.stroke();
        }

        const ratio = 10;

        // this.tileData.map(f => f.geometry).forEach(tileGeometry => {
        //     if (tileGeometry.type === 'Polygon') {
        //         const tilePolygon = (tileGeometry as unknown) as Polygon;
        //         drawPolygon(tilePolygon.coordinates);
        //     }
        // });

        this.polyData.coordinates.forEach(polygon => {
            drawPolygon(polygon);
        });

        context.lineWidth = 0.05 * ratio;
        this.multiPolyline005.coordinates.forEach(polyline005 => {
            drawPolyline(polyline005);
        });

        context.lineWidth = 0.10 * ratio;
        this.multiPolyline010.coordinates.forEach(polyline010 => {
            drawPolyline(polyline010);
        });

        context.lineWidth = 0.20 * ratio;
        this.multiPolyline030.coordinates.forEach(polyline030 => {
            drawPolyline(polyline030);
        });

        context.lineWidth = 0.50 * ratio;
        this.multiPolyline050.coordinates.forEach(polyline050 => {
            drawPolyline(polyline050);
        });

    }

    applyWorkerOutputLine(workerOutput: IWorkerLineOutput) {
        this.multiPolyline005 = workerOutput.multiPolyline005 ?? this.multiPolyline005;
        this.multiPolyline010 = workerOutput.multiPolyline010 ?? this.multiPolyline010;
        this.multiPolyline030 = workerOutput.multiPolyline030 ?? this.multiPolyline030;
        this.multiPolyline050 = workerOutput.multiPolyline050 ?? this.multiPolyline050;
    }

    // bboxClipLayer(bboxMap4326: BBox): void {
    //     // console.log(`${this.name}, bbox-clip ...`);
    //     this.multiPolyline005 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline005, bboxMap4326);
    //     this.multiPolyline010 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline010, bboxMap4326);
    //     this.multiPolyline030 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline030, bboxMap4326);
    //     this.multiPolyline050 = VectorTileGeometryUtil.bboxClipMultiPolyline(this.multiPolyline050, bboxMap4326);
    // }

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
        turf.cleanCoords(this.polyData, {
            mutate: true
        });
    }

}