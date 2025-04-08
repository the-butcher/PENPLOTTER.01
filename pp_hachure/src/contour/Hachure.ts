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
        hachureRay: (1 / Math.tan(4 * RasterUtil.DEG2RAD)) / GeometryUtil.cellSize, // larger value -> flatter surfaces get hachures
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


    id: string;
    svgData: string;
    private readonly vertices: IHachureVertex[];
    complete: boolean;
    private maxVertices: number;

    constructor(firstVertex: IHachureVertex) {

        this.id = ObjectUtil.createId();
        this.svgData = `M${firstVertex.positionPixl[0].toFixed(2)} ${firstVertex.positionPixl[1].toFixed(2)}`;
        this.vertices = [];
        this.complete = false;
        this.vertices.push(firstVertex);
        this.maxVertices = 10000 + (Math.random() - 0.5) * 75; // unlimited length, but could be used to limit


    }

    getVertexCount(): number {
        return this.vertices.length;
    }

    addVertex(vertex: IHachureVertex) {

        this.complete = false;
        this.vertices.push(vertex);
        if (this.vertices.length >= this.maxVertices) {
            this.complete = true;
        }
        this.svgData += `L${vertex.positionPixl[0].toFixed(2)} ${vertex.positionPixl[1].toFixed(2)}`;
        // this.id = ObjectUtil.createId();

    };

    popLastVertex() {
        this.vertices.pop();
        this.svgData = this.svgData.substring(0, this.svgData.lastIndexOf('L'));
    };

    getLastVertex() {
        return this.vertices[this.vertices.length - 1];
    };

    toLineString(): LineString {

        const lineString: LineString = {
            type: 'LineString',
            coordinates: []
        };

        for (let i = this.vertices.length - 1; i >= 0; i--) {
            lineString.coordinates.push(this.vertices[i].position4326);
        }

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

}