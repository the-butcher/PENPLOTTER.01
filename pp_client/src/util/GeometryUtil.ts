import { ELineDirection, ICoordinate2D, ICoordinate3D, ICubcPath, IExtent, ILine2D, ILine3D, ILinePath, IMatrix2D, LINE_DIRECTIONS } from "./Interfaces";
import { ObjectUtil } from "./ObjectUtil";
// import Loess from 'loess';

export class GeometryUtil {

    static BT___BUFF_BLK = 24; // bluetooth buffer size
    static BT___BUFF_MAX = 512; // device buffer size

    static PEN___MIN_MMS = 1;

    static PEN_____WIDTH = 0.1; // mm
    static IMAGE___SCALE = 4;
    static IMAGE_PADDING = 2;
    static CONN___PREFIX = 'conn';
    static Z_VALUE_PEN_U = 0.0; // pen position when up (mm)
    static Z_VALUE_PEN_D = -7.0; // pen position when down (mm)
    static Z_VALUE_RESET = 9999; // z-value indicating reset


    static linepathsToPlotpaths(linepaths: ILinePath[], maxMMS: number): ILine3D[] {

        const maxACC = maxMMS * 3;

        // initial conversion
        const plotPaths1: ILine3D[] = [];
        let coordR3D: ICoordinate3D | undefined;
        let coordA3D: ICoordinate3D | undefined;
        let coordB3D: ICoordinate3D | undefined;
        const semiLift = (GeometryUtil.Z_VALUE_PEN_U - GeometryUtil.Z_VALUE_PEN_D) / 2;

        let penId = '';
        for (let i = 0; i < linepaths.length; i++) {
            const isMoveSegment = linepaths[i].id.indexOf(this.CONN___PREFIX) != -1;
            if (isMoveSegment) { // add up-movement

                const coordA2D = GeometryUtil.getEdgeCoord('df', linepaths[i]);
                const coordB2D = GeometryUtil.getEdgeCoord('dr', linepaths[i]);
                const segmentId = linepaths[i].segments[0].id;
                penId = linepaths[i].penId;
                const segmentLength2D = GeometryUtil.getDistance2D(coordA2D, coordB2D);
                const extraLift = Math.min(semiLift, segmentLength2D / 4);

                coordA3D = {
                    ...coordA2D,
                    z: GeometryUtil.Z_VALUE_PEN_D + semiLift + extraLift
                };
                coordB3D = {
                    ...coordB2D,
                    z: GeometryUtil.Z_VALUE_PEN_D + semiLift + extraLift
                };
                const fullMoveSegment: ILine3D = {
                    id: `${segmentId}_tr_full`,
                    penId,
                    coordA: coordA3D,
                    coordB: coordB3D,
                    length: GeometryUtil.getDistance3D(coordA3D, coordB3D),
                    speedB: maxMMS
                };
                const calcMoveSegment = GeometryUtil.trimLine3D('extr', fullMoveSegment, extraLift, fullMoveSegment.length - extraLift, maxMMS);

                // up to semi
                coordA3D = {
                    ...coordA2D,
                    z: GeometryUtil.Z_VALUE_PEN_D
                };
                coordB3D = {
                    ...coordA2D,
                    z: GeometryUtil.Z_VALUE_PEN_D + semiLift
                };
                plotPaths1.push({
                    id: `${segmentId}_tr_up_1`,
                    penId,
                    coordA: coordA3D,
                    coordB: coordB3D,
                    length: GeometryUtil.getDistance3D(coordA3D, coordB3D),
                    speedB: maxMMS
                });
                coordR3D = coordB3D;

                // up and move to semi + extra
                coordA3D = coordR3D;
                coordB3D = calcMoveSegment.coordA;
                plotPaths1.push({
                    id: `${segmentId}_tr_up_2`,
                    penId,
                    coordA: coordA3D,
                    coordB: coordB3D,
                    length: GeometryUtil.getDistance3D(coordA3D, coordB3D),
                    speedB: maxMMS
                });
                coordR3D = coordB3D;

                // move to end of calcMoveSegment
                coordA3D = coordR3D;
                coordB3D = calcMoveSegment.coordB;
                plotPaths1.push({
                    id: `${segmentId}_tr_move`,
                    penId,
                    coordA: coordA3D,
                    coordB: coordB3D,
                    length: GeometryUtil.getDistance3D(coordA3D, coordB3D),
                    speedB: maxMMS
                });
                coordR3D = coordB3D;

                // move and down to semi over coordB
                coordA3D = coordR3D;
                coordB3D = {
                    ...coordB2D,
                    z: GeometryUtil.Z_VALUE_PEN_D + semiLift
                };
                plotPaths1.push({
                    id: `${segmentId}_tr_dn_1`,
                    penId,
                    coordA: coordA3D,
                    coordB: coordB3D,
                    length: GeometryUtil.getDistance3D(coordA3D, coordB3D),
                    speedB: maxMMS
                });
                coordR3D = coordB3D;

                // down
                coordA3D = coordR3D;
                coordB3D = {
                    ...coordB2D,
                    z: GeometryUtil.Z_VALUE_PEN_D
                };
                plotPaths1.push({
                    id: `${segmentId}_tr_dn_2`,
                    penId,
                    coordA: coordA3D,
                    coordB: coordB3D,
                    length: GeometryUtil.getDistance3D(coordA3D, coordB3D),
                    speedB: maxMMS
                });
                coordR3D = coordB3D;

            } else {
                linepaths[i].segments.forEach(s => {
                    coordA3D = {
                        ...s.coordA,
                        z: GeometryUtil.Z_VALUE_PEN_D
                    };
                    coordB3D = {
                        ...s.coordB,
                        z: GeometryUtil.Z_VALUE_PEN_D
                    };
                    plotPaths1.push({
                        id: s.id,
                        penId: linepaths[i].penId,
                        coordA: coordA3D,
                        coordB: coordB3D,
                        length: GeometryUtil.getDistance3D(coordA3D, coordB3D),
                        speedB: maxMMS
                    });
                });
                coordR3D = coordB3D;
            }
        }
        // final pen-up
        coordA3D = {
            ...coordR3D!,
            z: GeometryUtil.Z_VALUE_PEN_D
        };
        coordB3D = {
            ...coordR3D!,
            z: GeometryUtil.Z_VALUE_PEN_U
        };
        plotPaths1.push({
            id: `${ObjectUtil.createId()}___up`,
            penId,
            coordA: coordA3D,
            coordB: coordB3D,
            length: GeometryUtil.getDistance3D(coordA3D, coordB3D),
            speedB: 0
        });

        const mapToSpeed = (dot: number) => {
            return GeometryUtil.mapValues(dot, 0, 1, GeometryUtil.PEN___MIN_MMS, maxMMS); // CoordUtil.mapVals(dot, CoordUtil.SEMI_PI, 0, CoordUtil.MIN_MMS, CoordUtil.MAX_MMS);
        }

        // calculate max junction speeds (roughly)
        for (let i = 0; i < plotPaths1.length - 1; i++) {

            const dotAB = mapToSpeed(GeometryUtil.getDotProduct3D(GeometryUtil.getUnitVector3D(plotPaths1[i]), GeometryUtil.getUnitVector3D(plotPaths1[i + 1])));
            plotPaths1[i].speedB = dotAB;

        }

        const maxDist = 5;
        const toWeight = (dist: number) => {
            return 1 / Math.exp(dist * 0.5); // (maxDist - dist) / maxDist; //
        }

        for (let i = 1; i < plotPaths1.length - 1; i++) {

            const plotPathA = plotPaths1[i];

            // skip for pen lifts
            if (plotPathA.id.indexOf('_tr_') != -1) {
                continue;
            }

            const speeds: number[] = [];
            const weights: number[] = [];

            // look backward
            let distB = 0;
            for (let j = i - 1; j > 0; j--) {
                const plotPathB = plotPaths1[j];
                if (plotPathB.coordA.z > GeometryUtil.Z_VALUE_PEN_D) {
                    break;
                }
                const speedB = mapToSpeed(GeometryUtil.getDotProduct3D(GeometryUtil.getUnitVector3D(plotPathB), GeometryUtil.getUnitVector3D(plotPathA)));
                speeds.push(speedB);
                weights.push(toWeight(distB));
                distB += plotPathB.length;
                if (distB > maxDist) {
                    // console.log('looked backward', i - j, distB)
                    break;
                }
            }

            // look forward
            let distF = 0;
            for (let j = i + 1; j < plotPaths1.length; j++) {
                const plotPathF = plotPaths1[j];
                if (plotPathF.coordB.z > GeometryUtil.Z_VALUE_PEN_D) {
                    break;
                }
                const speedF = mapToSpeed(GeometryUtil.getDotProduct3D(GeometryUtil.getUnitVector3D(plotPathA), GeometryUtil.getUnitVector3D(plotPathF)));
                speeds.push(speedF);
                weights.push(toWeight(distF));
                distF += plotPathF.length;
                if (distF > maxDist) {
                    // console.log('looked forward', j - i, distF)
                    break;
                }
            }

            let speedTotal = 0;
            let weightTotal = 0;
            for (let i = 0; i < speeds.length; i++) {
                speedTotal += speeds[i] * weights[i];
                weightTotal += weights[i];
            }
            const speedAvg = speedTotal / weightTotal;

            if (speedAvg < plotPathA.speedB) {
                plotPathA.speedB = speedAvg;
            }

        }

        // iterate backwards and reduce entry speed on blocks where entry speed is too high for deceleration within the block
        for (let i = plotPaths1.length - 1; i > 0; i--) {

            const plotPathA = plotPaths1[i - 1];
            const plotPathB = plotPaths1[i];
            const speedI = plotPathA.speedB;
            const speedO = plotPathB.speedB;

            if (speedO < speedI) { // deceleration
                const lViToVo = (speedO * speedO - speedI * speedI) / (2 * -maxACC); // distance needed to decelerate
                if (lViToVo > plotPathB.length) { // not possible :: need to adjust previous segments exit speed
                    plotPathA.speedB = Math.sqrt(plotPathB.length * 2 * maxACC + speedO * speedO);
                }
            }

        }

        // iterate forward and reduce exit speed on blocks where entry speed is too low for acceleration within the block
        for (let i = 0; i < plotPaths1.length - 1; i++) {

            const plotPathA = plotPaths1[i];
            const plotPathB = plotPaths1[i + 1];
            const speedI = plotPathA.speedB;
            const speedO = plotPathB.speedB;

            if (speedO > speedI) { // acceleration
                const lViToVo = (speedO * speedO - speedI * speedI) / (2 * maxACC); // distance needed to decelerate
                if (lViToVo > plotPathB.length) { // not possible :: need to adjust this segments exit speed
                    plotPathB.speedB = Math.sqrt(plotPathB.length * 2 * maxACC + speedI * speedI);
                }
            }

        }

        const plotPaths2: ILine3D[] = [];

        // entry and exit speeds should be sorted here, now do acceleration / deceleration within the blocks
        let speedI = 0;
        const mmm = maxMMS;
        const acc = maxACC;
        const mal = 0.1; // min accel/decel length, collapse segments otherwise

        for (let index = 0; index < plotPaths1.length; index++) {

            const speedO = plotPaths1[index].speedB;

            const lViToVm = (mmm * mmm - speedI * speedI) / (2 * acc); // distance travelled while accelerating from entry to full
            const lVmToVo = (speedO * speedO - mmm * mmm) / (2 * -acc); // distance travelled while decelarating from full to exit
            const lViToVmToVo = lViToVm + lVmToVo;

            let blockAcel: ILine3D | undefined;
            let blockFull: ILine3D | undefined;
            let blockDcel: ILine3D | undefined;

            if (lViToVmToVo < plotPaths1[index].length) { // needs an extra full speed segment

                const lDiff = (plotPaths1[index].length - lViToVmToVo);

                if (lViToVm < mal && lVmToVo < mal) {
                    blockFull = GeometryUtil.trimLine3D('mx_1', plotPaths1[index], 0, plotPaths1[index].length, speedO);
                } else if (lViToVm < mal) { // dont use accel segment, but decelerate
                    blockFull = GeometryUtil.trimLine3D('mx_1', plotPaths1[index], 0, lViToVm + lDiff, speedI); // stick with entry speed
                    blockDcel = GeometryUtil.trimLine3D('dc_1', plotPaths1[index], lViToVm + lDiff, plotPaths1[index].length, speedO); // decelerate (?) to exit speed
                } else if (lVmToVo < mal) { // dont use decel segment, but accelerate
                    blockAcel = GeometryUtil.trimLine3D('ac_1', plotPaths1[index], 0, lViToVm, speedO);
                    blockFull = GeometryUtil.trimLine3D('mx_1', plotPaths1[index], lViToVm, plotPaths1[index].length, speedO);
                } else {
                    blockAcel = GeometryUtil.trimLine3D('ac_1', plotPaths1[index], 0, lViToVm, mmm);
                    blockFull = GeometryUtil.trimLine3D('mx_1', plotPaths1[index], lViToVm, lViToVm + lDiff, mmm);
                    blockDcel = GeometryUtil.trimLine3D('dc_1', plotPaths1[index], lViToVm + lDiff, plotPaths1[index].length, speedO);
                }


            } else { // can not reach full speed, in and out must be shortened

                const lDiff = (lViToVmToVo - plotPaths1[index].length) / 2;
                const vS = Math.sqrt((lViToVm - lDiff) * 2 * acc + speedI * speedI);

                if ((lViToVm - lDiff) < mal || (plotPaths1[index].length - (lViToVm - lDiff)) < mal) {
                    blockFull = GeometryUtil.trimLine3D('mx_2', plotPaths1[index], 0, plotPaths1[index].length, speedO);
                } else {
                    blockAcel = GeometryUtil.trimLine3D('ac_2', plotPaths1[index], 0, lViToVm - lDiff, vS);
                    blockDcel = GeometryUtil.trimLine3D('dc_2', plotPaths1[index], lViToVm - lDiff, plotPaths1[index].length, speedO);
                }

            }

            if (blockAcel && blockAcel.length > 0.0) {
                plotPaths2.push(blockAcel); // accelerate to max
            }
            if (blockFull && blockFull.length > 0.0) {
                plotPaths2.push(blockFull); // full speed
            }
            if (blockDcel && blockDcel.length > 0.0) {
                plotPaths2.push(blockDcel); // decelerate to exit speed
            }

            speedI = speedO;

        }

        return plotPaths2;

    }

    static trimLine3D(idPostfix: string, line: ILine3D, mult0: number, mult1: number, speedB: number): ILine3D {
        const unitCoord: ICoordinate3D = GeometryUtil.getUnitVector3D(line);
        const coordA = {
            x: line.coordA.x + unitCoord.x * mult0,
            y: line.coordA.y + unitCoord.y * mult0,
            z: line.coordA.z + unitCoord.z * mult0
        };
        const coordB = {
            x: line.coordA.x + unitCoord.x * mult1,
            y: line.coordA.y + unitCoord.y * mult1,
            z: line.coordA.z + unitCoord.z * mult1
        };
        return {
            id: `${line.id}_${idPostfix}`,
            penId: line.penId,
            coordA,
            coordB,
            length: mult1 - mult0,
            speedB
        };
    }

    static getLinepathExtent(linepath: ILinePath): IExtent {

        let xMin: number = Number.MAX_VALUE;
        let yMin: number = Number.MAX_VALUE;
        let xMax: number = Number.MIN_VALUE;
        let yMax: number = Number.MIN_VALUE;

        linepath.segments.forEach(line => {
            xMin = Math.min(xMin, line.coordA.x, line.coordB.x);
            yMin = Math.min(yMin, line.coordA.y, line.coordB.y);
            xMax = Math.max(xMax, line.coordA.x, line.coordB.x);
            yMax = Math.max(yMax, line.coordA.y, line.coordB.y);
        });

        return {
            xMin,
            yMin,
            xMax,
            yMax
        };

    }

    static cubicgroupToLinegroup(cubicgroup: ICubcPath): ILinePath {

        const lines: ILine2D[] = [];

        cubicgroup.segments.forEach(c => {

            const svgPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            svgPathElement.setAttribute('d', `M${c.coordA.x} ${c.coordA.y}C${c.coordB.x} ${c.coordB.y} ${c.coordC.x} ${c.coordC.y}  ${c.coordD.x} ${c.coordD.y}`);

            const pathLength = svgPathElement.getTotalLength();
            // console.log('pathLength', pathLength);
            const pathSegmts = Math.ceil(pathLength / 1); // TODO :: constant for segment length, consider scale
            const segmtLength = pathLength / pathSegmts;

            let pointAtLength: DOMPoint = svgPathElement.getPointAtLength(0);
            let coordA: ICoordinate2D = {
                x: pointAtLength.x,
                y: pointAtLength.y
            };
            let coordB: ICoordinate2D;
            for (let i = 1; i <= pathSegmts; i++) {
                pointAtLength = svgPathElement.getPointAtLength(i * segmtLength);
                coordB = {
                    x: pointAtLength.x,
                    y: pointAtLength.y
                };
                lines.push({
                    id: ObjectUtil.createId(),
                    coordA: { ...coordA },
                    coordB: { ...coordB }
                });
                coordA = coordB;
            }

        });

        return {
            id: ObjectUtil.createId(),
            penId: cubicgroup.penId,
            segments: lines,
            strokeWidth: GeometryUtil.PEN_____WIDTH,
            stroke: 'black'
        };

    }

    static scaleExtent(scale: number, extent: IExtent): IExtent {
        return {
            xMin: extent.xMin * scale,
            yMin: extent.yMin * scale,
            xMax: extent.xMax * scale,
            yMax: extent.yMax * scale
        };
    }

    /**
     * apply translation to an array of linepaths
     * @param translation
     * @param linepaths
     * @returns
     */
    static translateLinepaths(translation: ICoordinate2D, linepaths: ILinePath[]): ILinePath[] {
        return linepaths.map(g => GeometryUtil.translateLinepath(translation, g));
    }

    /**
     * apply translation to a single linepath
     * @param translation
     * @param linepath
     * @returns
     */
    static translateLinepath(translation: ICoordinate2D, linepath: ILinePath): ILinePath {
        return {
            id: linepath.id,
            penId: linepath.penId,
            strokeWidth: linepath.strokeWidth,
            stroke: linepath.stroke,
            segments: linepath.segments.map(l => GeometryUtil.translateLine2D(translation, l))
        };
    }

    /**
     * apply translation to a single line
     * @param translation
     * @param line
     * @returns
     */
    static translateLine2D(translation: ICoordinate2D, line: ILine2D): ILine2D {
        return {
            id: line.id,
            coordA: GeometryUtil.translateCoordinate2D(translation, line.coordA),
            coordB: GeometryUtil.translateCoordinate2D(translation, line.coordB),
        };
    }

    /**
     * apply translation to a single coordinate
     * @param translation
     * @param coordinate
     * @returns
     */
    static translateCoordinate2D(translation: ICoordinate2D, coordinate: ICoordinate2D): ICoordinate2D {
        return {
            x: coordinate.x + translation.x,
            y: coordinate.y + translation.y
        };
    }

    /**
     * apply scale to an array of linepaths
     * @param scale
     * @param linepaths
     * @returns
     */
    static scaleLinepaths(scale: number, linepaths: ILinePath[]): ILinePath[] {
        return linepaths.map(g => GeometryUtil.scaleLinepath(scale, g));
    }

    /**
     * apply scale to a single linepath
     * @param scale
     * @param linepath
     * @returns
     */
    static scaleLinepath(scale: number, linepath: ILinePath): ILinePath {
        return {
            id: linepath.id,
            penId: linepath.penId,
            strokeWidth: linepath.strokeWidth,
            stroke: linepath.stroke,
            segments: linepath.segments.map(l => GeometryUtil.scaleLine(scale, l))
        };
    }

    /**
     * apply sccale to a single line
     * @param scale
     * @param line
     * @returns
     */
    static scaleLine(scale: number, line: ILine2D): ILine2D {
        return {
            id: line.id,
            coordA: GeometryUtil.scaleCoordinate(scale, line.coordA),
            coordB: GeometryUtil.scaleCoordinate(scale, line.coordB),
        };
    }

    /**
     * apply scale to a single coordinate
     * @param scale
     * @param coordinate
     * @returns
     */
    static scaleCoordinate(scale: number, coordinate: ICoordinate2D): ICoordinate2D {
        return {
            x: coordinate.x * scale,
            y: coordinate.y * scale
        };
    }

    static removeShortSegments(minLength: number, linePath: ILinePath): ILinePath {

        const linepathNoShorts: ILinePath = {
            ...linePath,
            segments: [...linePath.segments]
        }

        let segmentA: ILine2D;
        let segmentB: ILine2D;
        let segmentC: ILine2D;
        // let intersection: ICoordinate2D | undefined;
        let lengthB: number;

        if (linepathNoShorts.segments.length > 2) {
            for (let i = linepathNoShorts.segments.length - 2; i > 0; i--) {
                segmentA = linepathNoShorts.segments[i - 1];
                segmentB = linepathNoShorts.segments[i];
                segmentC = linepathNoShorts.segments[i + 1];
                lengthB = GeometryUtil.getDistance2D(segmentB.coordA, segmentB.coordB);
                // if a connecting segment is short, remove it and connect neighbouring segmets by intersection
                if (lengthB < minLength) {

                    const midpoint: ICoordinate2D = {
                        x: (segmentB.coordA.x + segmentB.coordB.x) / 2,
                        y: (segmentB.coordA.y + segmentB.coordB.y) / 2,
                    };
                    segmentA.coordB = midpoint;
                    segmentC.coordA = midpoint;
                    linepathNoShorts.segments.splice(i, 1);
                    // intersection = GeometryUtil.intersectLines(segmentA, segmentC);
                    // if (intersection) {
                    //     segmentA.coordB = intersection;
                    //     segmentC.coordA = intersection;
                    //     linepathNoShorts.segments.splice(i, 1);
                    // }

                }
            }
        }
        // remove last segment if too short
        if (linepathNoShorts.segments.length > 0) {
            segmentB = linepathNoShorts.segments[linepathNoShorts.segments.length - 1];
            lengthB = GeometryUtil.getDistance2D(segmentB.coordA, segmentB.coordB);
            if (lengthB < minLength) {
                linepathNoShorts.segments.splice(linepathNoShorts.segments.length - 1, 1);
            }
        }
        if (linepathNoShorts.segments.length > 0) {
            // remove first segment if too short
            segmentB = linepathNoShorts.segments[0];
            lengthB = GeometryUtil.getDistance2D(segmentB.coordA, segmentB.coordB);
            if (lengthB < minLength) {
                linepathNoShorts.segments.splice(0, 1);
            }
        }

        return linepathNoShorts;

    }

    static intersectLines(lineA: ILine2D, lineB: ILine2D): ICoordinate2D | undefined {

        const x1 = lineA.coordA.x;
        const y1 = lineA.coordA.y;
        const x2 = lineA.coordB.x;
        const y2 = lineA.coordB.y;

        const x3 = lineB.coordA.x;
        const y3 = lineB.coordA.y;
        const x4 = lineB.coordB.x;
        const y4 = lineB.coordB.y;

        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return undefined;
        }

        const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

        // Lines are parallel
        if (denominator === 0) {
            return undefined;
        }

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
        // const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

        // is the intersection along the segments
        // if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        //     return false
        // }

        // Return a object with the x and y coordinates of the intersection
        // let x = x1 + ua * (x2 - x1)
        // let y = y1 + ua * (y2 - y1)

        return {
            x: x1 + ua * (x2 - x1),
            y: y1 + ua * (y2 - y1)
        }

    }

    static connectLinepaths(coordR: ICoordinate2D, linePaths: ILinePath[], connectSort: boolean): ILinePath[] {

        const connectedLinePaths: ILinePath[] = [];

        while (linePaths.length > 0) {

            // find closest path
            let coordE: ICoordinate2D; // edge coordinate
            let distE: number; // edge distance
            let distMin: number = Number.MAX_VALUE;
            let pathMin: ILinePath;
            let drctMin: ELineDirection;
            let indxMin: number;

            for (let pathIndex = 0; pathIndex < linePaths.length; pathIndex++) {
                if (connectSort) {
                    LINE_DIRECTIONS.forEach(direction => {
                        coordE = GeometryUtil.getEdgeCoord(direction, linePaths[pathIndex]);
                        distE = GeometryUtil.getDistance2D(coordR, coordE);
                        if (distE < distMin && pathMin?.id !== linePaths[pathIndex].id) { //
                            if (pathMin?.id === linePaths[pathIndex].id) {
                                console.log('self connect!')
                            }
                            distMin = distE;
                            pathMin = linePaths[pathIndex];
                            drctMin = direction;
                            indxMin = pathIndex;
                        }
                    });
                } else {
                    coordE = GeometryUtil.getEdgeCoord('df', linePaths[pathIndex]);
                    distMin = GeometryUtil.getDistance2D(coordR, coordE);
                    pathMin = linePaths[pathIndex];
                    drctMin = 'df';
                    indxMin = pathIndex;
                    break;
                }
            }

            // remove element from searchable list
            const removedPenId = linePaths.splice(indxMin!, 1)[0].penId;

            coordE = GeometryUtil.getEdgeCoord(drctMin!, pathMin!);
            if (coordR.x !== coordE.x || coordR.y !== coordE.y) {

                // add connecting element
                connectedLinePaths.push({
                    id: `${ObjectUtil.createId()}_${this.CONN___PREFIX}`,
                    penId: removedPenId,
                    strokeWidth: 0.05,
                    stroke: 'black',
                    segments: [
                        {
                            id: ObjectUtil.createId(),
                            coordA: coordR,
                            coordB: GeometryUtil.getEdgeCoord(drctMin!, pathMin!)
                        }
                    ]
                });

            }

            connectedLinePaths.push(GeometryUtil.dirLinegroup(drctMin!, pathMin!));

            // get new reference coord
            coordR = GeometryUtil.getEdgeCoord(drctMin! === 'df' ? 'dr' : 'df', pathMin!);

        }

        return connectedLinePaths;

    }

    static getLinepathsExtent(linepaths: ILinePath[]): IExtent {
        return GeometryUtil.mergeExtents(linepaths.map(g => GeometryUtil.getLinepathExtent(g)));
    }

    static mergeExtents(extents: IExtent[]): IExtent {

        let xMin: number = Number.MAX_VALUE;
        let yMin: number = Number.MAX_VALUE;
        let xMax: number = Number.MIN_VALUE;
        let yMax: number = Number.MIN_VALUE;

        for (let i = 0; i < extents.length; i++) {
            xMin = Math.min(xMin, extents[i].xMin, extents[i].xMax);
            yMin = Math.min(yMin, extents[i].yMin, extents[i].yMax);
            xMax = Math.max(xMax, extents[i].xMin, extents[i].xMax);
            yMax = Math.max(yMax, extents[i].yMin, extents[i].yMax);
        }

        return {
            xMin,
            yMin,
            xMax,
            yMax
        };

    }

    /**
     * create a unique 6-digit id
     * @returns
     */
    static transformCoordinate2D(coordinate: ICoordinate2D, transform: IMatrix2D): ICoordinate2D {
        return {
            x: coordinate.x * transform.a + coordinate.y * transform.c + transform.e,
            y: coordinate.x * transform.b + coordinate.y * transform.d + transform.f
        };
    }

    static getDistance2D(coordinateA: ICoordinate2D, coordinateB: ICoordinate2D) {
        const xD = coordinateB.x - coordinateA.x;
        const yD = coordinateB.y - coordinateA.y;
        return Math.sqrt(xD * xD + yD * yD);
    }

    static getDistance3D(coordinateA: ICoordinate3D, coordinateB: ICoordinate3D) {
        const xD = coordinateB.x - coordinateA.x;
        const yD = coordinateB.y - coordinateA.y;
        const zD = coordinateB.z - coordinateA.z;
        return Math.sqrt(xD * xD + yD * yD + zD * zD);
    }

    static getUnitVector3D(line: ILine3D): ICoordinate3D {
        const xD = line.coordB.x - line.coordA.x;
        const yD = line.coordB.y - line.coordA.y;
        const zD = line.coordB.z - line.coordA.z;
        const len = Math.sqrt(xD * xD + yD * yD + zD * zD);
        return {
            x: xD / len,
            y: yD / len,
            z: zD / len
        }
    }

    static getDotProduct3D(vectorA: ICoordinate3D, vectorB: ICoordinate3D): number {
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;
    }

    static getEdgeCoord(direction: ELineDirection, linegroup: ILinePath): ICoordinate2D {
        if (direction === 'df') {
            return linegroup.segments[0].coordA;
        } else {
            return linegroup.segments[linegroup.segments.length - 1].coordB;
        }
    }

    static dirLinegroup(direction: ELineDirection, linegroup: ILinePath): ILinePath {
        if (direction === 'df') {
            return linegroup;
        } else {
            return {
                id: linegroup.id,
                penId: linegroup.penId,
                strokeWidth: linegroup.strokeWidth,
                stroke: linegroup.stroke,
                segments: [...linegroup.segments].reverse().map(line => {
                    return {
                        id: line.id,
                        coordA: line.coordB,
                        coordB: line.coordA
                    }
                })
            };
        }
    }

    /**
     * Ramer–Douglas–Peucker algorithm
     * code ported from: https://github.com/seabre/simplify-geometry/blob/master/simplifygeometry-0.0.2.js
     */
    static simplifyLinepath(tolerance: number, linegroupRaw: ILinePath): ILinePath {

        const coordsRaw: ICoordinate2D[] = [GeometryUtil.getEdgeCoord('df', linegroupRaw)];
        linegroupRaw.segments.forEach(line => {
            coordsRaw.push(line.coordB);
        });
        const coordsSmp = GeometryUtil.simplifyCoordinates(coordsRaw, tolerance);
        const segments: ILine2D[] = [];
        for (let i = 1; i < coordsSmp.length; i++) {
            segments.push({
                id: ObjectUtil.createId(),
                coordA: coordsSmp[i - 1],
                coordB: coordsSmp[i]
            });
        }
        return {
            id: linegroupRaw.id,
            penId: linegroupRaw.penId,
            strokeWidth: linegroupRaw.strokeWidth,
            stroke: linegroupRaw.stroke,
            segments: segments
        }

    }

    static simplifyCoordinates(points: ICoordinate2D[], tolerance: number): ICoordinate2D[] {

        let dmax = 0;
        let index = 0;

        for (let i = 1; i <= points.length - 2; i++) {
            const d = GeometryUtil.lineDist({
                id: '',
                coordA: points[0],
                coordB: points[points.length - 1],
            }, points[i]); // new Line(points[0], points[points.length - 1]).perpendicularDistance(points[i]);
            if (d > dmax) {
                index = i;
                dmax = d;
            }
        }

        let results: ICoordinate2D[];
        if (dmax > tolerance) {
            const results_one = GeometryUtil.simplifyCoordinates(points.slice(0, index), tolerance);
            const results_two = GeometryUtil.simplifyCoordinates(points.slice(index, points.length), tolerance);
            results = results_one.concat(results_two);
        } else if (points.length > 1) {
            results = [points[0], points[points.length - 1]];
        } else {
            results = [points[0]];
        }

        return results;

    }

    private static lineDiffY(line: ILine2D): number {
        return line.coordB.y - line.coordA.y;
    }

    private static lineDiffX(line: ILine2D): number {
        return line.coordB.x - line.coordA.x;
    }

    private static lineSlope(line: ILine2D): number {
        return GeometryUtil.lineDiffY(line) / GeometryUtil.lineDiffX(line);
    }

    private static lineYIntercept(line: ILine2D): number {
        return line.coordA.y - (line.coordA.x * GeometryUtil.lineSlope(line));
    }

    private static lineIsVertical(line: ILine2D): boolean {
        return !isFinite(GeometryUtil.lineSlope(line));
    }

    private static lineIsHorizontal(line: ILine2D): boolean {
        return line.coordA.y === line.coordB.y;
    }

    private static lineDistY(line: ILine2D, point: ICoordinate2D): number {
        return Math.abs(line.coordA.y - point.y);
    }

    private static lineDistX(line: ILine2D, point: ICoordinate2D): number {
        return Math.abs(line.coordA.x - point.x);
    }

    private static lineDistSlope(line: ILine2D, point: ICoordinate2D): number {
        const slope = GeometryUtil.lineSlope(line);
        const y_intercept = GeometryUtil.lineYIntercept(line);;
        return Math.abs((slope * point.x) - point.y + y_intercept) / Math.sqrt((Math.pow(slope, 2)) + 1);
    }

    private static lineDist(line: ILine2D, point: ICoordinate2D): number {
        if (GeometryUtil.lineIsVertical(line)) {
            return GeometryUtil.lineDistX(line, point);
        } else if (GeometryUtil.lineIsHorizontal(line)) {
            return GeometryUtil.lineDistY(line, point);
        } else {
            return GeometryUtil.lineDistSlope(line, point);
        }
    }

    static mapValues(valI: number, minI: number, maxI: number, minO: number, maxO: number): number {
        return Math.max(minO, Math.min(maxO, minO + (valI - minI) * (maxO - minO) / (maxI - minI))); // Math.max(minO, Math.min(maxO, minO + (valI - minI) * (maxO - minO) / (maxI - minI)));
    }

}