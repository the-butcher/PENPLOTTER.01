import { BBox, Feature, GeoJsonProperties, Geometry, MultiLineString, MultiPolygon, Position } from "geojson";
import { PPGeometry } from "pp-geom";
import { TGeomentryType } from '../components/MapComponent';
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from "../vectortile/IVectorTileFeatureFilter";
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { ISkipOptions } from './ISkipOptions';
import { IWorkerClipInput } from './clip/IWorkerClipInput';
import { IWorkerClipOutput } from './clip/IWorkerClipOutput';
import { IWorkerLineOutput } from './common/IWorkerLineOutput';

export interface ILayerProps {
    createLayerInstance: () => AMapLayer<Geometry, GeoJsonProperties>;
}

export abstract class AMapLayer<F extends Geometry, P extends GeoJsonProperties> implements IVectorTileFeatureFilter {

    readonly name: string;
    readonly filter: IVectorTileFeatureFilter;

    /**
     * this layer's raw data, Polygons, LinesStrings or Points
     */
    tileData: Feature<F, P>[];
    polyData: MultiPolygon; // polygon (even for line and point layers) describing an area around this layer's features, meant to be ready after the processPoly method has run

    multiPolyline018: MultiLineString;
    multiPolyline025: MultiLineString;
    multiPolyline035: MultiLineString;
    multiPolyline050: MultiLineString;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        this.name = name;
        this.filter = filter;
        this.tileData = [];
        this.polyData = PPGeometry.emptyMultiPolygon();
        this.multiPolyline018 = PPGeometry.emptyMultiPolyline();
        this.multiPolyline025 = PPGeometry.emptyMultiPolyline();
        this.multiPolyline035 = PPGeometry.emptyMultiPolyline();
        this.multiPolyline050 = PPGeometry.emptyMultiPolyline();
    }

    accepts(vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature): boolean {
        return this.filter.accepts(vectorTileKey, vectorTileFeature);
    }

    abstract accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void>;

    async clipToLayerMultipolygon(layer: AMapLayer<Geometry, GeoJsonProperties>, distance: number, options: ISkipOptions = {
        skip018: false,
        skip025: false,
        skip035: false,
        skip050: false,
        skipMlt: true
    }): Promise<void> {

        const workerInput: IWorkerClipInput = {
            multiPolyline018Dest: this.multiPolyline018,
            multiPolyline025Dest: this.multiPolyline025,
            multiPolyline035Dest: this.multiPolyline035,
            multiPolyline050Dest: this.multiPolyline050,
            polyDataDest: this.polyData,
            polyDataClip: layer.polyData,
            distance: distance,
            options: options
        };

        return new Promise<void>((resolve, reject) => {
            const workerInstance = new Worker(new URL('../map/clip/worker_clip________misc.ts', import.meta.url), { type: 'module' });
            workerInstance.onmessage = (e) => {
                const workerOutput: IWorkerClipOutput = e.data;
                this.multiPolyline018 = workerOutput.multiPolyline018Dest;
                this.multiPolyline025 = workerOutput.multiPolyline025Dest;
                this.multiPolyline035 = workerOutput.multiPolyline035Dest;
                this.multiPolyline050 = workerOutput.multiPolyline050Dest;
                this.polyData = workerOutput.polyDataDest;
                workerInstance.terminate();
                resolve();
            };
            workerInstance.onerror = (e) => {
                workerInstance.terminate();
                reject(e);
            };
            workerInstance.postMessage(workerInput);
        });

    };

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

    abstract processPlot(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void>;

    drawToCanvas(context: CanvasRenderingContext2D, coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position, geometryTypes: Set<TGeomentryType>): void {

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

        const ratio = 6;

        // this.tileData.map(f => f.geometry).forEach(tileGeometry => {
        //     if (tileGeometry.type === 'Polygon') {
        //         const tilePolygon = (tileGeometry as unknown) as Polygon;
        //         drawPolygon(tilePolygon.coordinates);
        //     }
        // });

        if (geometryTypes.has('polygon')) {
            this.polyData.coordinates.forEach(polygon => {
                drawPolygon(polygon);
            });
        }


        if (geometryTypes.has('polyline')) {


            context.lineWidth = 0.18 * ratio;
            this.multiPolyline018.coordinates.forEach(polyline018 => {
                drawPolyline(polyline018);
            });

            context.lineWidth = 0.25 * ratio;
            this.multiPolyline025.coordinates.forEach(polyline025 => {
                drawPolyline(polyline025);
            });

            context.lineWidth = 0.35 * ratio;
            this.multiPolyline035.coordinates.forEach(polyline035 => {
                drawPolyline(polyline035);
            });

            context.lineWidth = 0.50 * ratio;
            this.multiPolyline050.coordinates.forEach(polyline050 => {
                drawPolyline(polyline050);
            });
        }

    }

    applyWorkerOutputLine(workerOutput: IWorkerLineOutput) {
        this.multiPolyline018 = workerOutput.multiPolyline018 ? this.mergeMultiPolylines(workerOutput.multiPolyline018, this.multiPolyline018) : this.multiPolyline018;
        this.multiPolyline025 = workerOutput.multiPolyline025 ? this.mergeMultiPolylines(workerOutput.multiPolyline025, this.multiPolyline025) : this.multiPolyline025;
        this.multiPolyline035 = workerOutput.multiPolyline035 ? this.mergeMultiPolylines(workerOutput.multiPolyline035, this.multiPolyline035) : this.multiPolyline035;
        this.multiPolyline050 = workerOutput.multiPolyline050 ? this.mergeMultiPolylines(workerOutput.multiPolyline050, this.multiPolyline050) : this.multiPolyline050;
    }

    mergeMultiPolylines(multiPolylineA: MultiLineString, multiPolylineB: MultiLineString): MultiLineString {
        const polylinesA = PPGeometry.destructurePolylines(multiPolylineA);
        const polylinesB = PPGeometry.destructurePolylines(multiPolylineB);
        return PPGeometry.restructurePolylines([
            ...polylinesA,
            ...polylinesB
        ])
    }

    bboxClipLayer(bboxMap4326: BBox): void {
        // console.log(`${this.name}, bbox-clip ...`);
        this.multiPolyline018 = PPGeometry.bboxClipMultiPolyline(this.multiPolyline018, bboxMap4326);
        this.multiPolyline025 = PPGeometry.bboxClipMultiPolyline(this.multiPolyline025, bboxMap4326);
        this.multiPolyline035 = PPGeometry.bboxClipMultiPolyline(this.multiPolyline035, bboxMap4326);
        this.multiPolyline050 = PPGeometry.bboxClipMultiPolyline(this.multiPolyline050, bboxMap4326);
    }

    connectPolylines(toleranceMeters: number, options: ISkipOptions = {
        skip018: false,
        skip025: false,
        skip035: false,
        skip050: false,
        skipMlt: true
    }): void {
        console.log(`${this.name}, connect-polylines ...`);
        if (!options.skip018) {
            this.multiPolyline018 = PPGeometry.connectMultiPolyline(this.multiPolyline018, toleranceMeters);
        }
        if (!options.skip025) {
            this.multiPolyline025 = PPGeometry.connectMultiPolyline(this.multiPolyline025, toleranceMeters);
        }
        if (!options.skip035) {
            this.multiPolyline035 = PPGeometry.connectMultiPolyline(this.multiPolyline035, toleranceMeters);
        }
        if (!options.skip050) {
            this.multiPolyline050 = PPGeometry.connectMultiPolyline(this.multiPolyline050, toleranceMeters);
        }
    }

    filterPolylinesShorterThan(minLength: number, options: ISkipOptions = {
        skip018: false,
        skip025: false,
        skip035: false,
        skip050: false,
        skipMlt: true
    }): void {
        console.log(`${this.name}, connect-polylines ...`);
        if (!options.skip018) {
            this.multiPolyline018 = PPGeometry.filterPolylinesShorterThan(this.multiPolyline018, minLength);
        }
        if (!options.skip025) {
            this.multiPolyline025 = PPGeometry.filterPolylinesShorterThan(this.multiPolyline025, minLength);
        }
        if (!options.skip035) {
            this.multiPolyline035 = PPGeometry.filterPolylinesShorterThan(this.multiPolyline035, minLength);
        }
        if (!options.skip050) {
            this.multiPolyline050 = PPGeometry.filterPolylinesShorterThan(this.multiPolyline050, minLength);
        }
    }

    cleanCoords() {
        console.log(`${this.name}, cleaning coords ...`);
        PPGeometry.cleanAndSimplify(this.multiPolyline018);
        PPGeometry.cleanAndSimplify(this.multiPolyline025);
        PPGeometry.cleanAndSimplify(this.multiPolyline035);
        PPGeometry.cleanAndSimplify(this.multiPolyline050);
        PPGeometry.cleanAndSimplify(this.polyData);
    }

}