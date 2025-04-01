import * as turf from "@turf/turf";
import { LineString, Position } from "geojson";
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from "../util/ObjectUtil";
import { IHachure } from "./IHachure";
import { IHachureConfig } from "./IHachureConfig";
import { IHachureVertex } from "./IHachureVertex";

export class Hachure implements IHachure {

    static readonly CONFIG: IHachureConfig = {
        minSpacing: 5,
        maxSpacing: 7.5,
        blurFactor: 0.25,
        contourOff: 1, // vertical difference of contours
        contourDiv: 2.5, // the subdivisions along a contour
        hachureRay: 1.25 // larger value -> flatter surfaces get hachures
    }

    private id: string;
    private readonly vertices: IHachureVertex[];
    private complete: boolean;

    constructor(firstVertex: IHachureVertex) {
        this.id = ObjectUtil.createId();
        this.vertices = [];
        this.complete = false;
        this.vertices.push(firstVertex);
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
    };

    popLastVertex() {
        this.vertices.pop();
    };

    getLastVertex() {
        return this.vertices[this.vertices.length - 1];
    };

    setComplete() {
        this.complete = true;
        // this.vertices.pop(); // remove the last vertex when closing
    }

    isComplete() {
        return this.complete;
    }

    toLineString(): LineString {
        const lineString: LineString = {
            type: 'LineString',
            coordinates: []
        };
        const rasterOrigin4326 = turf.toWgs84(GeometryUtil.rasterOrigin3857);
        this.vertices.forEach(vertex => {
            const vertexFix: Position = [
                vertex.position4326[0],
                - (vertex.position4326[1] - rasterOrigin4326[1]) + rasterOrigin4326[1]
            ]
            lineString.coordinates.push(vertexFix);
        });
        return lineString;
    }

    // getSvgDataFw(): string {


    //     const lastVertex = this.getLastVertex();
    //     const fwlength = 10;

    //     let d = `M${lastVertex.positionPixl[0]} ${lastVertex.positionPixl[1]}`;
    //     d += `l${Math.cos(lastVertex.aspect * RasterUtil.DEG2RAD) * 10} ${Math.sin(lastVertex.aspect * RasterUtil.DEG2RAD) * fwlength}`;

    //     return d;

    // }

    getSvgData(): string {

        let command = 'M';
        let d = '';
        this.vertices.forEach(vertex => {
            d += `${command}${vertex.positionPixl[0]} ${vertex.positionPixl[1]} `;
            command = 'L';
        });
        return d;

    }

    getSvgDataSteep(): string {

        let command = 'M';
        let d = '';

        let position4326A: Position = this.vertices[0].position4326;
        d += `${command}${this.vertices[0].positionPixl[0]} ${this.vertices[0].positionPixl[1]}`;

        let position4326B: Position;
        for (let i = 1; i < this.vertices.length; i++) {

            position4326B = this.vertices[i].position4326;
            const distance = turf.distance(position4326A, position4326B, {
                units: 'meters'
            })
            if (distance < Hachure.CONFIG.contourDiv / 2) {
                command = 'L';
            } else {
                command = 'M';
            }
            d += `${command}${this.vertices[i].positionPixl[0]} ${this.vertices[i].positionPixl[1]}`;
            position4326A = position4326B;

        }

        return d;

    }

}