import { LineString, Position } from "geojson";
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from "../util/ObjectUtil";
import { RasterUtil } from "../util/RasterUtil";
import { IHachure } from "./IHachure";
import { IHachureConfig } from "./IHachureConfig";
import { IHachureVertex } from "./IHachureVertex";
import { IPositionProperties } from "./IPositionProperties";

export class Hachure implements IHachure {

    static readonly CONFIG: IHachureConfig = {
        minSpacing: 6,
        maxSpacing: 6 * 1.66,
        blurFactor: 0.5,
        contourOff: 1, // vertical difference of contours
        contourDiv: 2.5, // the subdivisions along a contour
        hachureRay: (1 / Math.tan(5 * RasterUtil.DEG2RAD)) / GeometryUtil.cellSize, // larger value -> flatter surfaces get hachures
        contourDsp: 50
    }

    // static readonly CONFIG: IHachureConfig = {
    //     minSpacing: 6,
    //     maxSpacing: 6 * 1.66,
    //     blurFactor: 1.5,
    //     contourOff: 2.5, // vertical difference of contours
    //     contourDiv: 5, // the subdivisions along a contour
    //     hachureRay: (2.5 / Math.tan(5 * RasterUtil.DEG2RAD)) / GeometryUtil.cellSize, // larger value -> flatter surfaces get hachures
    //     contourDsp: 50
    // }


    private id: string;
    private readonly vertices: IHachureVertex[];
    private complete: boolean;
    private maxVertices: number;

    constructor(firstVertex: IHachureVertex) {
        this.id = ObjectUtil.createId();
        this.vertices = [];
        this.complete = false;
        this.vertices.push(firstVertex);
        this.maxVertices = 10000 + (Math.random() - 0.5) * 75;
    }

    getId(): string {
        return this.id;
    }

    getVertexCount(): number {
        return this.vertices.length;
    }

    addVertex(vertex: IHachureVertex) {

        this.complete = false;
        this.vertices.push(vertex);
        if (this.vertices.length >= this.maxVertices) {
            this.setComplete();
        }

    };

    popLastVertex() {
        this.vertices.pop();
    };

    getLastVertex() {
        return this.vertices[this.vertices.length - 1];
    };

    setComplete() {
        this.complete = true;
    }

    isComplete() {
        return this.complete;
    }

    toLineString(): LineString {

        const lineString: LineString = {
            type: 'LineString',
            coordinates: []
        };

        for (let i = this.vertices.length - 1; i >= 0; i--) {
            lineString.coordinates.push(this.vertices[i].position4326);
        }

        // const offsetMetersTop = this.getOffsetMeters(this.vertices[this.vertices.length - 1], 1)
        // if (offsetMetersTop > 1) { // if a rectangular edge would be visible
        //     lineString.coordinates.push(this.getOffsetPositionAlong(this.vertices[this.vertices.length - 1], offsetMetersTop / 2).position4326);
        // }

        // for (let i = this.vertices.length - 1; i >= 0; i--) {
        //     lineString.coordinates.push(this.getOffsetPosition(this.vertices[i], -1).position4326);
        // }

        // const offsetMetersBot = this.getOffsetMeters(this.vertices[0], 1);
        // if (offsetMetersBot > 1) { // if a rectangular edge would be visible
        //     lineString.coordinates.push(this.getOffsetPositionAlong(this.vertices[0], -offsetMetersBot / 2).position4326);
        // }

        // for (let i = 0; i < this.vertices.length; i++) {
        //     lineString.coordinates.push(this.getOffsetPosition(this.vertices[i], 1).position4326);
        // }

        // lineString.coordinates.push(lineString.coordinates[0]); // close polygon (actually is linestring, but for better shape)

        return lineString;

    }

    getOffsetPosition(hachureVertex: IHachureVertex, sign: -1 | 1): IPositionProperties {
        const offset = this.getOffsetMeters(hachureVertex, sign);
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

    getOffsetPositionAlong(hachureVertex: IHachureVertex, offset: number): IPositionProperties {
        const positionPixl: Position = [
            hachureVertex.positionPixl[0] + Math.cos(hachureVertex.aspect * RasterUtil.DEG2RAD) * offset / GeometryUtil.cellSize,
            hachureVertex.positionPixl[1] + Math.sin(hachureVertex.aspect * RasterUtil.DEG2RAD) * offset / GeometryUtil.cellSize,
        ];
        const position4326 = GeometryUtil.pixelToPosition4326(positionPixl);
        return {
            positionPixl,
            position4326
        };
    }

    getOffsetMeters(hachureVertex: IHachureVertex, sign: -1 | 1) {
        return ObjectUtil.mapValues(hachureVertex.slope, {
            min: 10,
            max: 90
        }, {
            min: 0,
            max: 2 * sign
        });
    }

    getSvgData(): string {

        let d = '';
        let command: string;

        // the line going down
        command = 'M';

        for (let i = this.vertices.length - 1; i >= 0; i--) {
            d += `${command}${this.vertices[i].positionPixl[0]} ${this.vertices[i].positionPixl[1]} `;
            command = 'L';
        }

        // const offsetMetersTop = this.getOffsetMeters(this.vertices[this.vertices.length - 1], 1)
        // if (offsetMetersTop > 1) { // if a rectangular edge would be visible
        //     const offsetPosition = this.getOffsetPositionAlong(this.vertices[this.vertices.length - 1], offsetMetersTop / 2);
        //     d += `${command}${offsetPosition.positionPixl[0]} ${offsetPosition.positionPixl[1]} `;
        //     command = 'L';
        // }

        // for (let i = this.vertices.length - 1; i >= 0; i--) {
        //     const offsetPosition = this.getOffsetPosition(this.vertices[i], -1);
        //     d += `${command}${offsetPosition.positionPixl[0]} ${offsetPosition.positionPixl[1]} `;
        //     command = 'L';
        // }

        // const offsetMetersBot = this.getOffsetMeters(this.vertices[0], 1);
        // if (offsetMetersBot > 1) { // if a rectangular edge would be visible
        //     const offsetPosition = this.getOffsetPositionAlong(this.vertices[0], -offsetMetersBot / 2);
        //     d += `${command}${offsetPosition.positionPixl[0]} ${offsetPosition.positionPixl[1]} `;
        //     command = 'L'; // first vertex closes the lower end
        // }

        // // the line going up
        // for (let i = 0; i < this.vertices.length; i++) {
        //     const offsetPosition = this.getOffsetPosition(this.vertices[i], 1);
        //     d += `${command}${offsetPosition.positionPixl[0]} ${offsetPosition.positionPixl[1]} `;
        //     command = 'L'; // first vertex closes the lower end
        // }

        // d += `Z`; // closing the upper end

        return d;

    }

    // getSvgDataSteep(): string {

    //     let command = 'M';
    //     let d = '';

    //     let position4326A: Position = this.vertices[0].position4326;
    //     d += `${command}${this.vertices[0].positionPixl[0]} ${this.vertices[0].positionPixl[1]}`;

    //     let position4326B: Position;
    //     for (let i = 1; i < this.vertices.length; i++) {

    //         position4326B = this.vertices[i].position4326;
    //         const distance = turf.distance(position4326A, position4326B, {
    //             units: 'meters'
    //         })
    //         if (distance < Hachure.CONFIG.contourDiv / 2) {
    //             command = 'L';
    //         } else {
    //             command = 'M';
    //         }
    //         d += `${command}${this.vertices[i].positionPixl[0]} ${this.vertices[i].positionPixl[1]}`;
    //         position4326A = position4326B;

    //     }

    //     return d;

    // }

}