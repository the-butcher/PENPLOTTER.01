import { LineString, Position } from "geojson";
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from "../util/ObjectUtil";
import { RasterUtil } from "../util/RasterUtil";
import { IHachure } from "./IHachure";
import { IHachureConfig } from "./IHachureConfig";
import { IHachureVertex } from "./IHachureVertex";
import { IPositionProperties } from "./IPositionProperties";
import * as turf from "@turf/turf";

export class Hachure implements IHachure {

    static readonly CONFIG: IHachureConfig = {
        minSpacing: 6,
        maxSpacing: 8,
        blurFactor: 1,
        contourOff: 1, // vertical difference of contours
        contourDiv: 2.5, // the subdivisions along a contour
        hachureRay: (1 / Math.tan(2.5 * RasterUtil.DEG2RAD)) / GeometryUtil.cellSize, // larger value -> flatter surfaces get hachures
        contourDsp: 50
    }

    // static readonly CONFIG: IHachureConfig = {
    //     minSpacing: 6,
    //     maxSpacing: 6 * 1.66,
    //     blurFactor: 0.5,
    //     contourOff: 2.5, // vertical difference of contours
    //     contourDiv: 5, // the subdivisions along a contour
    //     hachureRay: (2.5 / Math.tan(5 * RasterUtil.DEG2RAD)) / GeometryUtil.cellSize, // larger value -> flatter surfaces get hachures
    //     contourDsp: 50
    // }


    id: string;
    svgData: string;
    private readonly vertices: IHachureVertex[];
    complete: boolean;

    private maxHeight: number;
    private maxLength: number;

    constructor(firstVertex: IHachureVertex) {

        this.id = ObjectUtil.createId();

        this.vertices = [];
        this.complete = false;

        this.vertices.push(firstVertex);
        // this.svgData = `M${firstVertex.positionPixl[0].toFixed(2)} ${firstVertex.positionPixl[1].toFixed(2)}`;

        this.maxHeight = firstVertex.height + 100 + (Math.random() - 0.5) * 50; // (firstVertex.height + Hachure.CONFIG.contourDsp) - firstVertex.height % Hachure.CONFIG.contourDsp; // 25 + (Math.random() - 0.5) * 20; // unlimited length, but could be used to limit
        this.maxLength = 100 + (Math.random() - 0.5) * 50; // meters

    }

    getVertexCount(): number {
        return this.vertices.length;
    }

    buildOffsetPositions(): IPositionProperties[] {

        const offsetScale = 0.03;
        const offsetPositions: IPositionProperties[] = [];

        for (let i = 0; i < this.vertices.length; i++) { // upwards
            const offset = (this.vertices[this.vertices.length - 1].height - this.vertices[i].height) * offsetScale;
            offsetPositions.push(this.getOffsetPosition(this.vertices[i], offset));
        }
        for (let i = this.vertices.length - 2; i >= 0; i--) { // downwards
            const offset = (this.vertices[this.vertices.length - 1].height - this.vertices[i].height) * offsetScale;
            offsetPositions.push(this.getOffsetPosition(this.vertices[i], -offset));
        }
        return offsetPositions;

    }

    rebuildSvgData() {

        let command = 'M';
        this.svgData = '';

        const offsetPositions = this.buildOffsetPositions();
        for (let i = 0; i < offsetPositions.length; i++) {
            this.svgData += `${command}${offsetPositions[i].positionPixl[0].toFixed(2)} ${offsetPositions[i].positionPixl[1].toFixed(2)}`;
            command = 'L';
        }


    }

    addVertex(vertex: IHachureVertex) {

        this.complete = false;
        this.vertices.push(vertex);
        // this.svgData += `L${vertex.positionPixl[0].toFixed(2)} ${vertex.positionPixl[1].toFixed(2)}`;

        const polyline: LineString = {
            type: 'LineString',
            coordinates: this.vertices.map(c => c.position4326)
        }
        const length = turf.length(turf.feature(polyline), {
            units: 'meters'
        })
        if (vertex.height >= this.maxHeight || length >= this.maxLength) {
            this.complete = true;
        }

        this.rebuildSvgData();

    };

    popLastVertex() {

        this.vertices.pop();
        this.rebuildSvgData();
        // this.svgData = this.svgData.substring(0, this.svgData.lastIndexOf('L'));

    };

    getLastVertex() {
        return this.vertices[this.vertices.length - 1];
    };

    toLineString(): LineString {

        const lineString: LineString = {
            type: 'LineString',
            coordinates: []
        };

        const offsetPositions = this.buildOffsetPositions();
        for (let i = 0; i < offsetPositions.length; i++) {
            lineString.coordinates.push(offsetPositions[i].position4326);
        }

        return lineString;

    }

    getOffsetPosition(hachureVertex: IHachureVertex, offset: number): IPositionProperties {
        const positionPixl: Position = [
            hachureVertex.positionPixl[0] + Math.sin(hachureVertex.aspect * RasterUtil.DEG2RAD) * offset / GeometryUtil.cellSize,
            hachureVertex.positionPixl[1] - Math.cos(hachureVertex.aspect * RasterUtil.DEG2RAD) * offset / GeometryUtil.cellSize,
        ];
        const position4326 = GeometryUtil.pixelToPosition4326(positionPixl);
        return {
            positionPixl,
            position4326
        };
    }

    // getOffsetPositionAlong(hachureVertex: IHachureVertex, offset: number): IPositionProperties {
    //     const positionPixl: Position = [
    //         hachureVertex.positionPixl[0] + Math.cos(hachureVertex.aspect * RasterUtil.DEG2RAD) * offset / GeometryUtil.cellSize,
    //         hachureVertex.positionPixl[1] + Math.sin(hachureVertex.aspect * RasterUtil.DEG2RAD) * offset / GeometryUtil.cellSize,
    //     ];
    //     const position4326 = GeometryUtil.pixelToPosition4326(positionPixl);
    //     return {
    //         positionPixl,
    //         position4326
    //     };
    // }

    // getOffsetMeters(hachureVertex: IHachureVertex, sign: -1 | 1) {
    //     return ObjectUtil.mapValues(hachureVertex.slope, {
    //         min: 10,
    //         max: 90
    //     }, {
    //         min: 0,
    //         max: 2 * sign
    //     });
    // }

}