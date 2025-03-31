import { LineString, Position } from "geojson";
import { ObjectUtil } from "../util/ObjectUtil";
import { RasterUtil } from "../util/RasterUtil";
import { IHachure } from "./IHachure";
import { IHachureVertex } from "./IHachureVertex";
import { GeometryUtil } from "../util/GeometryUtil";
import * as turf from "@turf/turf";

export class Hachure implements IHachure {

    static readonly HACHURE_MIN_SPACING = 30; // per weighed length
    static readonly HACHURE_MAX_SPACING = 45; // per weighed length
    static readonly HACHURE_RAY__LENGTH = 4;

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
        this.vertices.push(vertex);
    };

    getLastVertex() {
        return this.vertices[this.vertices.length - 1];
    };

    setComplete() {
        this.complete = true;
        this.vertices.pop(); // remove the last vertex when closing
        // console.log(this.id, 'completed')
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

    getSvgDataFw(): string {

        const lastVertex = this.getLastVertex();
        const fwlength = 10;

        let d = `M${lastVertex.positionPixl[0]} ${lastVertex.positionPixl[1]}`;
        d += `l${Math.cos(lastVertex.aspect * RasterUtil.DEG2RAD) * 10} ${Math.sin(lastVertex.aspect * RasterUtil.DEG2RAD) * fwlength}`;

        return d;

    }

    getSvgData(): string {

        let command = 'M';
        let d = '';
        this.vertices.forEach(vertex => {
            d += `${command}${vertex.positionPixl[0]} ${vertex.positionPixl[1]} `;
            command = 'L';
        });

        return d;

    }

}