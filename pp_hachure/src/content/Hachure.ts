import * as turf from "@turf/turf";
import { LineString, Position } from "geojson";
import { IRasterConfigProps } from "../components/IRasterConfigProps";
import { Raster } from "../raster/Raster";
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from "../util/ObjectUtil";
import { IHachure } from "./IHachure";
import { IHachureVertex } from "./IHachureVertex";
import { IPositionProperties } from "./IPositionProperties";
import { IHachureConfigProps } from "../components/IHachureConfigProps";

/**
 * container for a single hachure line
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
export class Hachure implements IHachure {

    id: string;
    svgData: string;
    private readonly vertices: IHachureVertex[];
    complete: boolean;
    closed: boolean = false;
    private rasterConfig: IRasterConfigProps;
    private hachureConfig: IHachureConfigProps;

    private maxHeight: number;
    private maxLength: number;

    constructor(firstVertex: IHachureVertex, rasterConfig: IRasterConfigProps, hachureConfig: IHachureConfigProps) {

        this.id = ObjectUtil.createId();
        this.rasterConfig = rasterConfig;
        this.hachureConfig = hachureConfig;
        this.svgData = '';

        this.vertices = [];
        this.complete = false;

        this.vertices.push(firstVertex);
        // this.svgData = `M${firstVertex.positionPixl[0].toFixed(2)} ${firstVertex.positionPixl[1].toFixed(2)}`;

        const hachureDimH = this.hachureConfig.hachureDim * rasterConfig.converter.metersPerUnit;
        const hachureDimL = this.hachureConfig.hachureDim;
        this.maxHeight = firstVertex.height + hachureDimH + (Math.random() - 0.5) * hachureDimH * 0.5;
        this.maxLength = hachureDimL + (Math.random() - 0.5) * hachureDimL * 0.5; // meters
        // console.log('hachureDimH', hachureDimH, 'hachureDimL', hachureDimL);

    }

    getVertexCount(): number {
        return this.vertices.length;
    }

    buildOffsetPositions(smooth: boolean): IPositionProperties[] {

        const offsetScale = this.hachureConfig.hachureArr ? 0.03 : 0.00;

        let offsetPositionsA: IPositionProperties[] = [];
        for (let i = 0; i < this.vertices.length; i++) { // upwards
            const offset = (this.vertices[0].height - this.vertices[i].height) * offsetScale;
            offsetPositionsA.push(this.getOffsetPosition(this.vertices[i], offset));
        }

        let offsetPositionsB: IPositionProperties[] = [];
        if (this.hachureConfig.hachureArr) {
            for (let i = this.vertices.length - 1; i >= 0; i--) { // downwards
                const offset = (this.vertices[0].height - this.vertices[i].height) * offsetScale;
                offsetPositionsB.push(this.getOffsetPosition(this.vertices[i], -offset));
            }
        }

        if (smooth) {
            offsetPositionsA = GeometryUtil.smoothPositions(offsetPositionsA, this.rasterConfig);
            if (this.hachureConfig.hachureArr) {
                offsetPositionsB = GeometryUtil.smoothPositions(offsetPositionsB, this.rasterConfig);
            }
        }

        let mergedPositions: IPositionProperties[] = [
            ...offsetPositionsB,
            ...offsetPositionsA.slice(1),
        ];

        if (smooth) {
            mergedPositions = GeometryUtil.simplifyPositions(mergedPositions, this.rasterConfig);
        }

        return mergedPositions;

    }

    rebuildSvgData() {

        // const ray = 10 * (this.hachureConfig.contourOff / Math.tan(this.hachureConfig.hachureDeg * Raster.DEG2RAD)) / (this.rasterConfig.cellsize * this.rasterConfig.converter.metersPerUnit);


        let command = 'M';
        this.svgData = '';

        // this.vertices.forEach(vertex => {
        //     this.svgData += `${command}${vertex.positionPixl[0].toFixed(2)} ${vertex.positionPixl[1].toFixed(2)} `;
        //     command = 'L';
        // });
        // const vertex = this.vertices[this.vertices.length - 1];
        // if (!this.complete) {
        //     this.svgData += `L${vertex.positionPixl[0] + Math.cos(vertex.aspect * Raster.DEG2RAD) * ray} ${vertex.positionPixl[1] + Math.sin(vertex.aspect * Raster.DEG2RAD) * ray} `;
        //     this.svgData += `M${vertex.positionPixl[0].toFixed(2)} ${vertex.positionPixl[1].toFixed(2)} `;
        // }

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
        };
        const length = turf.length(turf.feature(polyline), {
            units: 'meters'
        });
        if (vertex.height >= this.maxHeight || length >= this.maxLength) {
            this.complete = true;
        }

        this.rebuildSvgData();

    };

    popLastVertex() {

        this.vertices.pop();
        this.rebuildSvgData();

    };

    getFirstVertex() {
        return this.vertices[0];
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
            hachureVertex.positionPixl[0] + Math.sin(hachureVertex.aspect * Raster.DEG2RAD) * offset / this.rasterConfig.cellsize,
            hachureVertex.positionPixl[1] - Math.cos(hachureVertex.aspect * Raster.DEG2RAD) * offset / this.rasterConfig.cellsize,
        ];
        const position4326 = GeometryUtil.pixelToPosition4326(positionPixl, this.rasterConfig);
        return {
            positionPixl,
            position4326,
        };
    }

}