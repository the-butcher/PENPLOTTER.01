import { LineString, Position } from "geojson";
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from "../util/ObjectUtil";
import { IHachure } from "./IHachure";
import { IHachureConfig } from "./IHachureConfig";
import { IHachureVertex } from "./IHachureVertex";
import { IPositionProperties } from "./IPositionProperties";
import * as turf from "@turf/turf";
import { Raster } from "../raster/Raster";

export class Hachure implements IHachure {

    static readonly CONFIG: IHachureConfig = {
        minSpacing: 6,
        maxSpacing: 8,
        blurFactor: 0.10,
        contourOff: 0.5, // vertical difference of contours
        contourDiv: 2, // the subdivisions along a contour
        hachureRay: (0.5 / Math.tan(2.5 * Raster.DEG2RAD)) / Raster.CONFIG.cellsize, // larger value -> flatter surfaces get hachures
        contourDsp: 50
    }

    // static readonly CONFIG: IHachureConfig = {
    //     minSpacing: 6,
    //     maxSpacing: 8,
    //     blurFactor: 1,
    //     contourOff: 2.5, // vertical difference of contours
    //     contourDiv: 5, // the subdivisions along a contour
    //     hachureRay: (2.5 / Math.tan(5 * Raster.DEG2RAD)) / Raster.CONFIG.cellsize, // larger value -> flatter surfaces get hachures
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
        this.svgData = '';

        this.vertices = [];
        this.complete = false;

        this.vertices.push(firstVertex);
        // this.svgData = `M${firstVertex.positionPixl[0].toFixed(2)} ${firstVertex.positionPixl[1].toFixed(2)}`;

        this.maxHeight = firstVertex.height + 100 + (Math.random() - 0.5) * 50;
        this.maxLength = 100 + (Math.random() - 0.5) * 50; // meters

    }

    getVertexCount(): number {
        return this.vertices.length;
    }

    buildOffsetPositions(smooth: boolean): IPositionProperties[] {

        const offsetScale = 0.03;

        let offsetPositionsA: IPositionProperties[] = [];
        for (let i = 0; i < this.vertices.length; i++) { // upwards
            // const offset = (this.vertices[this.vertices.length - 1].height - this.vertices[i].height) * offsetScale;
            const offset = (this.vertices[0].height - this.vertices[i].height) * offsetScale;
            offsetPositionsA.push(this.getOffsetPosition(this.vertices[i], offset));
        }

        let offsetPositionsB: IPositionProperties[] = [];
        for (let i = this.vertices.length - 1; i >= 0; i--) { // downwards
            // const offset = (this.vertices[this.vertices.length - 1].height - this.vertices[i].height) * offsetScale;
            const offset = (this.vertices[0].height - this.vertices[i].height) * offsetScale;
            offsetPositionsB.push(this.getOffsetPosition(this.vertices[i], -offset));
        }

        if (smooth) {
            offsetPositionsA = GeometryUtil.smoothPositions(offsetPositionsA);
            offsetPositionsB = GeometryUtil.smoothPositions(offsetPositionsB);
        }

        let mergedPositions: IPositionProperties[] = [
            ...offsetPositionsB,
            ...offsetPositionsA.slice(1),
        ];

        if (smooth) {
            mergedPositions = GeometryUtil.simplifyPositions(mergedPositions);
        }

        return mergedPositions;

    }

    rebuildSvgData() {

        let command = 'M';
        this.svgData = '';

        const offsetPositions = this.buildOffsetPositions(this.complete);
        for (let i = 0; i < offsetPositions.length; i++) {
            this.svgData += `${command}${offsetPositions[i].positionPixl[0].toFixed(2)} ${offsetPositions[i].positionPixl[1].toFixed(2)}`;
            command = 'L';
        }


    }

    addVertex(vertex: IHachureVertex) {

        this.complete = false;
        this.vertices.push(vertex);

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

    };

    getLastVertex() {
        return this.vertices[this.vertices.length - 1];
    };

    toLineString(): LineString {

        const lineString: LineString = {
            type: 'LineString',
            coordinates: []
        };

        const offsetPositions = this.buildOffsetPositions(true);
        for (let i = 0; i < offsetPositions.length; i++) {
            lineString.coordinates.push(offsetPositions[i].position4326);
        }

        return lineString;

    }

    getOffsetPosition(hachureVertex: IHachureVertex, offset: number): IPositionProperties {
        const positionPixl: Position = [
            hachureVertex.positionPixl[0] + Math.sin(hachureVertex.aspect * Raster.DEG2RAD) * offset / Raster.CONFIG.cellsize,
            hachureVertex.positionPixl[1] - Math.cos(hachureVertex.aspect * Raster.DEG2RAD) * offset / Raster.CONFIG.cellsize,
        ];
        const position4326 = GeometryUtil.pixelToPosition4326(positionPixl);
        return {
            positionPixl,
            position4326,
        };
    }

}