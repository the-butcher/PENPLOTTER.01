import * as turf from '@turf/turf';
import { BBox, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";
import { Pen } from './Pen';


export class MapLayerBuildings extends AMapLayer {

    polygons: Polygon[];

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.polygons = [];
    }

    async openTile(): Promise<void> {
        this.polygons = [];
    }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {
        const polygons = VectorTileGeometryUtil.toPolygons(vectorTileKey, feature.coordinates).filter(p => Math.abs(turf.area(p)) > 100);
        this.polygons.push(...polygons);
    }

    async closeTile(): Promise<void> {

        if (this.polygons.length > 1) {

            // union of this specific tile
            const collA = turf.featureCollection(this.polygons.map(p => turf.feature(p)));
            const unionA = turf.union(collA)!;
            if (unionA.geometry.type === 'MultiPolygon') {
                unionA.geometry.coordinates.forEach(coordinates => {
                    this.multiPolygon.coordinates.push(coordinates);
                });
            } else if (unionA.geometry.type === 'Polygon') {
                this.multiPolygon.coordinates.push(unionA.geometry.coordinates);
            }

            // prebuffer, but has problems with union later
            // const inout: number[] = [2, -3];
            // const multiPolygonTile = VectorTileGeometryUtil.restructureMultiPolygon(this.polygons);
            // const polygonsIO: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(multiPolygonTile, ...inout);
            // polygonsIO.forEach(polygon => {
            //     this.multiPolygon.coordinates.push(polygon.coordinates);
            // });

        } else {
            this.polygons.forEach(polygon => {
                this.multiPolygon.coordinates.push(polygon.coordinates);
            })
        }

        // this.multiPolygon.coordinates.push(...this.polygons.map(p => p.coordinates));
    }

    async process(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing ...`);

        turf.simplify(this.multiPolygon, {
            mutate: true,
            tolerance: 0.000012,
            highQuality: true
        });
        turf.cleanCoords(this.multiPolygon);

        console.log(`${this.name}, clipping to bboxClp4326 ...`);
        this.multiPolygon = VectorTileGeometryUtil.bboxClipMultiPolygon(this.multiPolygon, bboxClp4326);

        // get an outer ring, all holes removed
        let polygons010: Polygon[] = VectorTileGeometryUtil.destructureMultiPolygon(this.multiPolygon);
        polygons010.forEach(polygonO => {
            polygonO.coordinates = polygonO.coordinates.slice(0, 1);
        });
        let multiPolygonO = VectorTileGeometryUtil.restructureMultiPolygon(polygons010);

        let polygonsI: Polygon[] = VectorTileGeometryUtil.destructureMultiPolygon(this.multiPolygon);
        const polygonsIFlat: Polygon[] = [];
        polygonsI.forEach(polygonI => {
            polygonI.coordinates.slice(1).forEach(ring => {
                polygonsIFlat.push({
                    type: 'Polygon',
                    coordinates: [ring.reverse()]
                });
            })
        });
        polygonsIFlat.forEach(polygonI => {
            turf.rewind(polygonI, {
                mutate: true
            });
        });
        let multiPolygonI = VectorTileGeometryUtil.restructureMultiPolygon(polygonsIFlat);

        console.log(`${this.name}, clipping to bboxClp4326 (1) ...`);
        // multiPolygonO = VectorTileGeometryUtil.bboxClipMultiPolygon(multiPolygonO, bboxClp4326);
        console.log(`${this.name}, clipping to bboxClp4326 (2) ...`);
        this.multiPolygon = VectorTileGeometryUtil.bboxClipMultiPolygon(this.multiPolygon, bboxClp4326);

        // let the polygons be a litte smaller than original to account for pen width
        const inout0 = 1;
        const polygonInset = -1.5;
        const polygonCount010 = 3;
        const polygonCount030 = 50;
        const polygonDelta010 = Pen.getPenWidthMeters(0.10, 25000) * -0.33;
        const polygonDelta030 = Pen.getPenWidthMeters(0.30, 25000) * -0.33;

        // outer polygon inset (to account for pen width)
        const inoutO: number[] = [inout0, polygonInset - inout0];
        console.log(`${this.name}, buffer in-out [${inoutO[0]}, ${inoutO[1]}] ...`);
        polygons010 = VectorTileGeometryUtil.bufferOutAndIn(multiPolygonO, ...inoutO);
        multiPolygonO = VectorTileGeometryUtil.restructureMultiPolygon(polygons010);

        const inoutI: number[] = [polygonInset - inout0, inout0];
        console.log(`${this.name}, buffer in-out [${inoutI[0]}, ${inoutI[1]}] ...`);
        polygonsI = VectorTileGeometryUtil.bufferOutAndIn(multiPolygonI, ...inoutI);
        multiPolygonI = VectorTileGeometryUtil.restructureMultiPolygon(polygonsI);

        const featureO = turf.feature(multiPolygonO);
        const featureI = turf.feature(multiPolygonI);
        const featureC = turf.featureCollection([featureO, featureI]);
        const difference = turf.difference(featureC)!.geometry;
        const polygonsD = VectorTileGeometryUtil.destructureUnionPolygon(difference);

        this.multiPolygon = VectorTileGeometryUtil.restructureMultiPolygon(polygonsD);

        // some rings with a thin pen for crispness
        const distances010: number[] = [];
        for (let i = 0; i < polygonCount010; i++) {
            distances010.push(polygonDelta010);
        }
        console.log(`${this.name}, buffer collect 010 ...`, distances010);
        polygons010 = VectorTileGeometryUtil.bufferCollect(this.multiPolygon, true, ...distances010);

        const distances030: number[] = [];
        for (let i = 0; i < polygonCount030; i++) {
            distances030.push(polygonDelta030);
        }
        console.log(`${this.name}, buffer collect 030 ...`, distances030);
        const polygons030 = VectorTileGeometryUtil.bufferCollect(this.multiPolygon, false, ...distances030);

        const coordinates010: Position[][] = polygons010.map(p => p.coordinates).reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline010.coordinates.push(...coordinates010);

        const coordinates030: Position[][] = polygons030.map(p => p.coordinates).reduce((prev, curr) => [...prev, ...curr], []);
        this.multiPolyline030.coordinates.push(...coordinates030);

        console.log(`${this.name}, clipping to bboxMap4326 ...`);
        this.bboxClip(bboxMap4326);
        console.log(`${this.name}, done`);

    }

    // drawToCanvas(context: CanvasRenderingContext2D, coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position): void {

    //     context.fillStyle = 'rgba(255, 0, 0, 0.10)';

    //     const drawRing = (ring: Position[]) => {
    //         let isMove = true;
    //         ring.forEach(coordinate => {
    //             const coordinateCanvas = coordinate4326ToCoordinateCanvas(coordinate);
    //             if (isMove) {
    //                 context.moveTo(coordinateCanvas[0], coordinateCanvas[1]);
    //             } else {
    //                 context.lineTo(coordinateCanvas[0], coordinateCanvas[1]);
    //             }
    //             isMove = false;
    //         });
    //     }

    //     const drawPolygon = (polygon: Position[][]) => {
    //         context.beginPath();
    //         polygon.forEach(ring => {
    //             drawRing(ring);
    //         });
    //         context.fill();
    //     }

    //     const drawPolyline = (polyline: Position[]) => {
    //         context.beginPath();
    //         drawRing(polyline);
    //         context.stroke();
    //     }



    //     // super.drawToCanvas(context, coordinate4326ToCoordinateCanvas);

    //     const ratio = 10;

    //     context.strokeStyle = 'rgba(0, 255, 0, 1)';
    //     context.lineWidth = 0.05 * ratio;
    //     this.multiPolyline010.coordinates.forEach(polyline005 => {
    //         drawPolyline(polyline005);
    //     });

    //     context.strokeStyle = 'rgba(255, 0, 0, 1)';
    //     context.lineWidth = 0.30 * ratio;
    //     this.multiPolyline030.coordinates.forEach(polyline030 => {
    //         drawPolyline(polyline030);
    //     });

    //     context.strokeStyle = 'rgba(0, 0, 255, 1)';
    //     context.lineWidth = 0.50 * ratio;
    //     this.multiPolyline050.coordinates.forEach(polyline050 => {
    //         drawPolyline(polyline050);
    //     });

    //     this.multiPolygon.coordinates.forEach(polygon => {
    //         drawPolygon(polygon);
    //     })

    // }

}