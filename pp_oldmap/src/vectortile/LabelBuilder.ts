import { MultiPolygon, Position } from "geojson";
import * as path from 'svg-path-properties';
import * as turf from '@turf/turf';
import { ITypefaceFont } from "../util/ITypeFace";

export class LabelBuilder {

    private typeface: ITypefaceFont;

    constructor(typeface: ITypefaceFont) {
        this.typeface = typeface;
    }

    getCharOffset(char: string, scale: number, textOffset: Position, charOffset: Position): Position {

        if (char === '\n') {
            return [
                textOffset[0],
                charOffset[1] + 50
            ];
        }

        const glyph = this.typeface.glyphs[char];
        return [
            charOffset[0] + glyph.ha * scale * 1.05,
            charOffset[1]
        ];

    }


    /**
     * glyph parsing as of https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/FontLoader.js
     * @param char
     * @param charOffset
     */
    getMultiPolygonChar(char: string, scale: number, charOffset: Position): MultiPolygon {

        const coordinates: Position[][][] = [];

        if (char === '\n') {
            return {
                type: 'MultiPolygon',
                coordinates
            };
        }

        // console.log('char', char);

        const glyphData = this.typeface.glyphs[char]?.o;
        const glyphCommands = glyphData.split(' ');

        let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2: number;
        let d = '';
        for (let i = 0, l = glyphCommands.length; i < l;) {

            const action = glyphCommands[i++];
            if (action === 'm') {

                if (d !== '') {
                    const ringCoordinates = this.getPolygonChar(d);
                    if (!turf.booleanClockwise(ringCoordinates)) { // an outer ring
                        coordinates.push([]);
                    }
                    coordinates[coordinates.length - 1].push(ringCoordinates);
                    d = '';
                }

                x = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                y = -parseInt(glyphCommands[i++]) * scale + charOffset[1];

                d = `${d}M${x} ${y}`;

            } else if (action === 'l') {

                x = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                y = -parseInt(glyphCommands[i++]) * scale + charOffset[1];

                d = `${d}L${x} ${y}`;

            } else if (action === 'q') {

                cpx = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                cpy = -parseInt(glyphCommands[i++]) * scale + charOffset[1];
                cpx1 = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                cpy1 = -parseInt(glyphCommands[i++]) * scale + charOffset[1];

                d = `${d}Q${cpx1} ${cpy1} ${cpx} ${cpy}`;

            } else if (action === 'b') {

                cpx = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                cpy = -parseInt(glyphCommands[i++]) * scale + charOffset[1];
                cpx1 = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                cpy1 = -parseInt(glyphCommands[i++]) * scale + charOffset[1];
                cpx2 = parseInt(glyphCommands[i++]) * scale + charOffset[0];
                cpy2 = -parseInt(glyphCommands[i++]) * scale + charOffset[1];

                d = `${d}Q${cpx1} ${cpy1} ${cpx2} ${cpy2} ${cpx} ${cpy}`;

            } else if (action === 'z') {

                const ringCoordinates = this.getPolygonChar(d);
                if (!turf.booleanClockwise(ringCoordinates)) { // an outer ring
                    coordinates.push([]);
                }
                coordinates[coordinates.length - 1].push(ringCoordinates);

            }


        }

        return {
            type: 'MultiPolygon',
            coordinates
        };

    }

    getPolygonChar(d: string): Position[] {

        // const svgPathElement: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const svgPathElement = new path.svgPathProperties(d);
        // svgPathElement.setAttribute('d', d);

        const pathLength = svgPathElement.getTotalLength();
        const pathSegmts = Math.ceil(pathLength / 0.2); // TODO :: better segment count, maybe depending on scale
        const segmtLength = pathLength / pathSegmts;

        interface Point {
            x: number;
            y: number;
        }

        let pointAtLength: Point;
        const coordinates: Position[] = [];
        for (let i = 0; i <= pathSegmts; i++) {
            pointAtLength = svgPathElement.getPointAtLength(i * segmtLength);
            coordinates.push([
                pointAtLength.x,
                pointAtLength.y
            ]);
        }

        return coordinates;

    }

}