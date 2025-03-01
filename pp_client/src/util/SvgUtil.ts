import { GeometryUtil } from "./GeometryUtil";
import { ICoordinate2D, ICubc2D, ICubcPath, ILine2D, ILinePath, IFileSvgProperties, IExtent } from "./Interfaces";
import { ObjectUtil } from "./ObjectUtil";


export class SvgUtil {



    static async parseSvgPaths(svgNode: SVGSVGElement): Promise<Pick<IFileSvgProperties, 'linePaths' | 'cubcPaths' | 'extent'>> {

        const moveToCommand = 'M';
        const lineToCommand = 'L';
        const horiToCommand = 'H';
        const vertToCommand = 'V';
        const cubcToCommand = 'C';
        const cubcShCommand = 'S';
        const quadToCommand = 'Q';
        const closePCommand = 'Z';
        const upperCaseCommands = `${moveToCommand}${lineToCommand}${horiToCommand}${vertToCommand}${cubcToCommand}${cubcShCommand}${quadToCommand}${closePCommand}`;
        const lowerCaseCommands = upperCaseCommands.toLowerCase();

        const linePaths: ILinePath[] = [];
        const cubcPaths: ICubcPath[] = [];

        const closeLineSegments = (lineSegments: ILine2D[], penId: string): ILine2D[] => {
            if (lineSegments.length > 0) {
                linePaths.push({
                    id: ObjectUtil.createId(),
                    penId,
                    segments: lineSegments,
                    strokeWidth: GeometryUtil.PEN_____WIDTH,
                    stroke: 'black'
                });
            }
            return [];
        }
        const closeCubcSegments = (cubcSegments: ICubc2D[], penId: string): ICubc2D[] => {
            if (cubcSegments.length > 0) {
                cubcPaths.push({
                    id: ObjectUtil.createId(),
                    penId,
                    segments: cubcSegments
                });
            }
            return [];
        }

        const viewboxRaw = svgNode.getAttribute('viewBox');
        const viewboxTkn = viewboxRaw!.split(/[, ]/g);
        const viewboxVal = viewboxTkn.map(t => parseFloat(t));
        const extent: IExtent = {
            xMin: viewboxVal[0],
            yMin: viewboxVal[1],
            xMax: viewboxVal[0] + viewboxVal[2],
            yMax: viewboxVal[1] + viewboxVal[3]
        }
        console.log('extent', viewboxRaw, viewboxVal, extent);

        const paths = svgNode.getElementsByTagName('path');
        for (let i = 0; i < paths.length; i++) {

            // get path and tokenize
            const path = paths.item(i)!;
            const penId = path!.getAttribute('pen-id') ?? ObjectUtil.PEN_ID_DEFAULT;
            const tm = path.getCTM()!;
            const d = path!.getAttribute('d')!.replace(/\r?\n|\r/g, " ");
            const exp = `[${upperCaseCommands}${lowerCaseCommands}][0-9+-.,eE ]*`;
            // console.log('exp', exp, d);
            const regex = new RegExp(exp, 'g');
            const tokens = d!.match(regex); // d!.match(/[A-Za-z][0-9-., ]*/g)!;
            if (tokens) {

                let lineSegments = closeLineSegments([], penId);
                let cubcSegments = closeCubcSegments([], penId);

                // path reference coordinate
                let coordR: ICoordinate2D = {
                    x: 0,
                    y: 0
                };
                let coordC2: ICoordinate2D;

                // each token represents a subpath in terms of https://www.w3.org/TR/SVG11/paths.html#PathElement
                for (let j = 0; j < tokens!.length; j++) {

                    const command = tokens[j].substring(0, 1);

                    // subpath close coordinate
                    const coordZ = { ...coordR };

                    // https://stackoverflow.com/questions/46340156/svg-path-data-regex-c-sharp
                    const values = tokens![j].match(/[+-]?(\d*\.\d+|\d+\.?)([eE][+-]?\d+)*/g)!;

                    // console.log('tv', tokens[j], values)

                    const isRelative = lowerCaseCommands.indexOf(command) !== -1;

                    if (command.toUpperCase() === closePCommand) {

                        lineSegments.push({
                            id: ObjectUtil.createId(),
                            coordA: GeometryUtil.transformCoordinate2D(coordR, tm),
                            coordB: GeometryUtil.transformCoordinate2D(coordZ, tm)
                        });
                        coordR = coordZ;

                        // close segments calls needed here?

                    } else if (command.toUpperCase() === horiToCommand) {

                        cubcSegments = closeCubcSegments(cubcSegments, penId);

                        for (let k = 0; k < values.length; k++) {
                            const coordB = {
                                x: parseFloat(values[k]) + (isRelative ? coordR.x : 0),
                                y: coordR.y
                            };
                            lineSegments.push({
                                id: ObjectUtil.createId(),
                                coordA: GeometryUtil.transformCoordinate2D(coordR, tm),
                                coordB: GeometryUtil.transformCoordinate2D(coordB, tm)
                            });
                            coordR = coordB;
                        }

                    } else if (command.toUpperCase() === vertToCommand) {

                        cubcSegments = closeCubcSegments(cubcSegments, penId);

                        for (let k = 0; k < values.length; k++) {
                            const coordB = {
                                x: coordR.x,
                                y: parseFloat(values[k]) + (isRelative ? coordR.y : 0)
                            };
                            lineSegments.push({
                                id: ObjectUtil.createId(),
                                coordA: GeometryUtil.transformCoordinate2D(coordR, tm),
                                coordB: GeometryUtil.transformCoordinate2D(coordB, tm)
                            });
                            coordR = coordB;
                        }

                    } else if (command.toUpperCase() === moveToCommand) {

                        /**
                         * Start a new sub-path at the given (x,y) coordinates. M (uppercase) indicates that absolute coordinates will follow;
                         * m (lowercase) indicates that relative coordinates will follow.
                         * If a moveto is followed by multiple pairs of coordinates, the subsequent pairs are treated as implicit lineto commands.
                         * Hence, implicit lineto commands will be relative if the moveto is relative, and absolute if the moveto is absolute.
                         * If a relative moveto (m) appears as the first element of the path, then it is treated as a pair of absolute coordinates.
                         * In this case, subsequent pairs of coordinates are treated as relative even though the initial moveto is interpreted as an absolute moveto.
                         */

                        lineSegments = closeLineSegments(lineSegments, penId);
                        cubcSegments = closeCubcSegments(cubcSegments, penId);

                        for (let k = 0; k < values.length; k += 2) {
                            // const isFirstOfImplicitPath = values.length > 2 && k === 0;
                            // const isRelative2 = isRelative && k >= 2;
                            const coordB = {
                                x: parseFloat(values[k + 0]) + (isRelative ? coordR.x : 0),
                                y: parseFloat(values[k + 1]) + (isRelative ? coordR.y : 0)
                            };
                            if (coordB.x !== coordR.x && coordB.y !== coordR.y) {
                                if (k >= 2) { // implicit path elements
                                    lineSegments.push({
                                        id: ObjectUtil.createId(),
                                        coordA: GeometryUtil.transformCoordinate2D(coordR, tm),
                                        coordB: GeometryUtil.transformCoordinate2D(coordB, tm)
                                    });
                                }
                                coordR = coordB;

                            }
                        }

                    } else if (command.toUpperCase() === lineToCommand) {

                        cubcSegments = closeCubcSegments(cubcSegments, penId);

                        for (let k = 0; k < values.length; k += 2) {
                            const coordB = {
                                x: parseFloat(values[k + 0]) + (isRelative ? coordR.x : 0),
                                y: parseFloat(values[k + 1]) + (isRelative ? coordR.y : 0)
                            };
                            lineSegments.push({
                                id: ObjectUtil.createId(),
                                coordA: GeometryUtil.transformCoordinate2D(coordR, tm),
                                coordB: GeometryUtil.transformCoordinate2D(coordB, tm)
                            });
                            coordR = coordB;
                        }

                    } else if (command.toUpperCase() === cubcToCommand) {

                        lineSegments = closeLineSegments(lineSegments, penId);

                        /**
                         * https://www.w3.org/TR/SVG11/paths.html#PathDataCubicBezierCommands
                         */

                        for (let k = 0; k < values.length - 5; k += 6) {

                            const coordC1 = {
                                x: parseFloat(values[k + 0]) + (isRelative ? coordR.x : 0),
                                y: parseFloat(values[k + 1]) + (isRelative ? coordR.y : 0)
                            };
                            coordC2 = {
                                x: parseFloat(values[k + 2]) + (isRelative ? coordR.x : 0),
                                y: parseFloat(values[k + 3]) + (isRelative ? coordR.y : 0)
                            };
                            const coordD = {
                                x: parseFloat(values[k + 4]) + (isRelative ? coordR.x : 0),
                                y: parseFloat(values[k + 5]) + (isRelative ? coordR.y : 0)
                            };
                            cubcSegments.push({
                                id: ObjectUtil.createId(),
                                coordA: GeometryUtil.transformCoordinate2D(coordR, tm),
                                coordB: GeometryUtil.transformCoordinate2D(coordC1, tm),
                                coordC: GeometryUtil.transformCoordinate2D(coordC2, tm),
                                coordD: GeometryUtil.transformCoordinate2D(coordD, tm),
                            });
                            coordR = coordD;
                        }

                    } else if (command.toUpperCase() === cubcShCommand) {

                        /**
                         * https://www.w3.org/TR/SVG11/paths.html#PathDataCubicBezierCommands
                         *
                         * Draws a cubic Bézier curve from the current point to (x,y).
                         * The first control point is assumed to be the reflection of the second control point on the previous command relative to the current point.
                         * (If there is no previous command or if the previous command was not an C, c, S or s, assume the first control point is coincident with the current point.)
                         * (x2,y2) is the second control point (i.e., the control point at the end of the curve).
                         * S (uppercase) indicates that absolute coordinates will follow;
                         * s (lowercase) indicates that relative coordinates will follow.
                         * Multiple sets of coordinates may be specified to draw a polybézier.
                         * At the end of the command, the new current point becomes the final (x,y) coordinate pair used in the polybézier.
                         */

                        for (let k = 0; k < values.length; k += 4) {
                            const coordC1 = {
                                x: coordC2!.x,
                                y: coordC2!.y,
                            };
                            coordC2 = {
                                x: parseFloat(values[k + 0]) + (isRelative ? coordR.x : 0),
                                y: parseFloat(values[k + 1]) + (isRelative ? coordR.y : 0)
                            };
                            const coordD = {
                                x: parseFloat(values[k + 2]) + (isRelative ? coordR.x : 0),
                                y: parseFloat(values[k + 3]) + (isRelative ? coordR.y : 0)
                            };
                            cubcSegments.push({
                                id: ObjectUtil.createId(),
                                coordA: GeometryUtil.transformCoordinate2D(coordR, tm),
                                coordB: GeometryUtil.transformCoordinate2D(coordC1, tm),
                                coordC: GeometryUtil.transformCoordinate2D(coordC2, tm),
                                coordD: GeometryUtil.transformCoordinate2D(coordD, tm),
                            });
                            coordR = coordD;

                        }

                    }
                    else {
                        console.warn('unhandled command', command);
                    }

                }

                closeLineSegments(lineSegments, penId);
                closeCubcSegments(cubcSegments, penId);

            }

        }

        const polylines = svgNode.getElementsByTagName('polyline');
        for (let i = 0; i < polylines.length; i++) {

            const polyline = polylines.item(i)!;
            const tm = polyline.getCTM()!;
            const penId = polyline!.getAttribute('pen-id') ?? ObjectUtil.PEN_ID_DEFAULT;

            const points = polyline!.getAttribute('points')!.replace(/\r?\n|\r/g, " ");
            const valuesRaw = points.match(/[+-]?(\d*\.\d+|\d+\.?)([eE][+-]?\d+)*/g)!;
            const valuesNum = valuesRaw.map(v => parseFloat(v));

            const lineSegments: ILine2D[] = [];
            for (let k = 2; k < valuesRaw.length; k += 2) {
                const coordA = {
                    x: valuesNum[k - 2],
                    y: valuesNum[k - 1]
                };
                const coordB = {
                    x: valuesNum[k],
                    y: valuesNum[k + 1]
                };
                lineSegments.push({
                    id: ObjectUtil.createId(),
                    coordA: GeometryUtil.transformCoordinate2D(coordA, tm),
                    coordB: GeometryUtil.transformCoordinate2D(coordB, tm)
                });
            }
            linePaths.push({
                id: ObjectUtil.createId(),
                penId,
                segments: lineSegments,
                strokeWidth: GeometryUtil.PEN_____WIDTH,
                stroke: 'black'
            });

            // console.log('values', lineSegments);


        }

        return {
            linePaths,
            cubcPaths,
            extent
        };

    }

}