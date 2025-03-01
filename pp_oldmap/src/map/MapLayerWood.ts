import * as turf from '@turf/turf';
import { BBox, MultiPoint, Polygon, Position } from "geojson";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { IVectorTileFeatureFilter } from '../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { AMapLayer } from "./AMapLayer";


export class MapLayerWood extends AMapLayer {

    hexpoints: MultiPoint;

    constructor(name: string, filter: IVectorTileFeatureFilter) {
        super(name, filter);
        this.hexpoints = {
            type: 'MultiPoint',
            coordinates: []
        };
    }

    async openTile(): Promise<void> { }

    async accept(vectorTileKey: IVectorTileKey, feature: IVectorTileFeature): Promise<void> {
        const polygons = VectorTileGeometryUtil.toPolygons(vectorTileKey, feature.coordinates);
        this.multiPolygon.coordinates.push(...polygons.map(p => p.coordinates));
    }

    async closeTile(): Promise<void> { }

    async process(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing ...`);

        turf.simplify(this.multiPolygon!, {
            mutate: true,
            tolerance: 0.00001,
            highQuality: true
        });
        turf.cleanCoords(this.multiPolygon, {
            mutate: true
        });

        const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(this.multiPolygon, -10, 10);
        this.multiPolygon = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA);

        console.log(`${this.name}, clipping ...`);
        this.multiPolygon = VectorTileGeometryUtil.bboxClipMultiPolygon(this.multiPolygon, bboxClp4326);

        const gridDim = 40;
        const hexgrid = turf.hexGrid(turf.bbox(this.multiPolygon), gridDim, {
            units: 'meters'
        });
        hexgrid.features.forEach(hexcell => {
            hexcell.geometry.coordinates.forEach(coordinates => {
                coordinates.forEach(coordinate => {
                    this.hexpoints.coordinates.push(coordinate);
                });
            });
        });

        const hexCoordinates: Position[] = [];
        const hexCoordinatesHas = (coordinate: Position): boolean => {
            return !!hexCoordinates.find(hexCoordinate => {
                const distance = turf.distance(hexCoordinate, coordinate, {
                    units: 'meters'
                });
                return distance < gridDim / 2;
            });
        }

        // filter coordinates to be within the wood polygons
        const pointsWithinMultiPolygon = turf.pointsWithinPolygon(turf.feature(this.hexpoints), this.multiPolygon);

        // remove duplicate points
        pointsWithinMultiPolygon.features.forEach(feature => {
            if (feature.geometry.type === 'MultiPoint') {
                feature.geometry.coordinates.forEach(coordinate => {
                    if (!hexCoordinatesHas(coordinate)) {
                        hexCoordinates.push(coordinate);
                    }
                });
            } else if (feature.geometry.type === 'Point') {
                if (!hexCoordinatesHas(feature.geometry.coordinates)) {
                    hexCoordinates.push(feature.geometry.coordinates);
                }
            }
        });

        // add some random offsets to all points
        const randomScale = 0.0001; //2;
        hexCoordinates.forEach(coordinate => {
            coordinate[0] += (Math.random() - 0.5) * randomScale;
            coordinate[1] += (Math.random() - 0.5) * randomScale;
        });

        // rebuild hexpoint instance
        this.hexpoints = {
            type: 'MultiPoint',
            coordinates: hexCoordinates
        };

        const baseRadius = 10;
        const startAngle = Math.PI / 2 + Math.PI / 4;
        const legLength = 2;

        const createTreeLine = (coordinate4326: Position): Position[] => {

            const coordinate3857 = turf.toMercator(coordinate4326);
            const randomRadius = baseRadius + (Math.random() - 0.33) * baseRadius / 2;

            const treeCoordinates3857: Position[] = [];
            treeCoordinates3857.push([
                coordinate3857[0] + Math.cos(startAngle) * randomRadius + Math.sin(startAngle) * randomRadius * legLength,
                coordinate3857[1] - Math.sin(startAngle) * randomRadius + Math.cos(startAngle) * randomRadius * legLength
            ]);
            for (let i = startAngle; i <= Math.PI * 2; i += Math.PI / 16) {
                treeCoordinates3857.push([
                    coordinate3857[0] + Math.cos(i) * randomRadius,
                    coordinate3857[1] - Math.sin(i) * randomRadius
                ]);
            }
            return treeCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857));
        };

        this.hexpoints.coordinates.forEach(coordinate => {
            this.multiPolyline010.coordinates.push(createTreeLine(coordinate));
        });
        turf.cleanCoords(this.multiPolyline010, {
            mutate: true
        });

        // const coordinates01a: Position[][] = this.multiPolygon.coordinates.reduce((prev, curr) => [...prev, ...curr], []);
        // this.multiPolyline01.coordinates.push(...coordinates01a);

        // // rebuild from polygonsB
        // const coordinatesB: Position[][][] = [];
        // const coordinatesC: Position[][] = [];
        // this.multiPolygon.coordinates.forEach(polygon => {
        //     coordinatesB.push(polygon);
        //     coordinatesC.push(...polygon)
        // });
        // this.multiPolygon = {
        //     type: 'MultiPolygon',
        //     coordinates: coordinatesB
        // }
        // this.multiPolyline01 = {
        //     type: 'MultiLineString',
        //     coordinates: coordinatesC
        // }

        this.bboxClip(bboxMap4326);
        console.log(`${this.name}, done`);

    }

    // drawToCanvas(context: CanvasRenderingContext2D, coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position): void {

    //     context.fillStyle = 'rgba(255, 0, 0, 0.75)';
    //     // context.strokeStyle = 'rgba(0, 0, 0, 0.50)';

    //     const rectSize = 4;
    //     const drawPoint = (coordinate: Position, label?: string) => {
    //         const coordinateCanvas = coordinate4326ToCoordinateCanvas(coordinate);
    //         context.fillRect(coordinateCanvas[0] - rectSize / 2, coordinateCanvas[1] - rectSize / 2, rectSize, rectSize);
    //         if (label) {
    //             context.strokeRect(coordinateCanvas[0] - rectSize / 2, coordinateCanvas[1] - rectSize / 2, rectSize, rectSize);
    //             context.fillText(label, coordinateCanvas[0] + 2, coordinateCanvas[1] - 2);
    //         }
    //     }

    //     super.drawToCanvas(context, coordinate4326ToCoordinateCanvas);

    //     console.log('this.hexpoints', this.hexpoints);
    //     this.hexpoints.coordinates.forEach(coordinate => {
    //         drawPoint(coordinate);
    //     })
    //     // drawPolyline(danube_canal.coordinates);

    //     // context.fillStyle = 'rgba(255,0,0,0.50)';
    //     // const fillPolysC = this.findFillPolygons(danube_canal, drawPoint);
    //     // fillPolysC.forEach(fillPolyC => {
    //     //     drawPolygon(fillPolyC.coordinates);
    //     // })

    // }

}