import { useEffect, useState } from "react";
import { ILine2D, ITimeSvgProperties } from "../util/Interfaces";
import LineSvgComponent from "./LineSvgComponent";
import { Stack, Typography } from "@mui/material";
import { GeometryUtil } from "../util/GeometryUtil";

function TimeSvgComponent(props: ITimeSvgProperties) {

    const { lines: _lines3D, selId, handleLineClick } = { ...props };

    const [times, setTimes] = useState<ILine2D[]>([]);
    const [brdrs, setBrdrs] = useState<ILine2D[]>([]);

    const [totalTime, setTotalTime] = useState<string>('');

    const [viewbox, setViewbox] = useState<string>('0, 0, 1, 1');
    const [width, setWidth] = useState<number>(1);
    const [height, setHeight] = useState<number>(1);

    const sX = 100;
    const sY = 10;
    const dimY = 400;

    useEffect(() => {

        console.debug('⚙ updating time svg component (_lines3D)', _lines3D);

        const _times: ILine2D[] = [];
        const _brdrs: ILine2D[] = [];

        let xA = 0;
        let yA = 0;
        let xB = 0;
        let yB = 0;

        let speedI = 0;
        let speedO: number;

        let scndsL: number;
        let scndsT = 0; // total seconds
        let mmsT = 0;
        let cntT = 0;

        for (let i = 0; i < _lines3D.length; i++) {

            if (i > 0) {
                speedI = _lines3D[i - 1].speedB;
            }
            speedO = _lines3D[i].speedB;
            scndsL = _lines3D[i].length * 2 / (speedI + speedO);
            scndsT += scndsL;

            if (_lines3D[i].coordA.z === GeometryUtil.Z_VALUE_PEN_D && _lines3D[i].coordB.z === GeometryUtil.Z_VALUE_PEN_D) {
                mmsT += _lines3D[i].length;
            } else if (_lines3D[i].coordA.z !== GeometryUtil.Z_VALUE_PEN_D && _lines3D[i].coordB.z === GeometryUtil.Z_VALUE_PEN_D) {
                cntT++;
            }


            if (speedI + speedO === 0) {
                console.warn('zero speeds', i, _lines3D[i]);
            }

            xB = xA + scndsL * sX;
            yA = dimY - speedI * sY;
            yB = dimY - speedO * sY;

            if (i < 1000) {
                _times.push({
                    id: _lines3D[i].id,
                    coordA: {
                        x: xA,
                        y: yA
                    },
                    coordB: {
                        x: xB,
                        y: yB
                    }
                });
                _brdrs.push({
                    id: _lines3D[i].id,
                    coordA: {
                        x: xB,
                        y: 0
                    },
                    coordB: {
                        x: xB,
                        y: dimY
                    }
                })
            }
            xA = xB;
        }

        setTimes(_times);
        setBrdrs(_brdrs);

        const _viewbox = `0, 0, ${xA},${dimY}`;
        setViewbox(_viewbox);

        // console.debug('setting width', xA);
        setWidth(xA);
        setHeight(dimY);

        const hrsT = Math.floor(scndsT / 3600)
        const minT = Math.floor((scndsT / 60) % 60);
        const secT = Math.round(scndsT % 60);
        setTotalTime(`${hrsT.toString().padStart(2, '0')}:${minT.toString().padStart(2, '0')}:${secT.toString().padStart(2, '0')} (${Math.round(scndsT)}s), ${cntT} lines, ${Math.round(mmsT).toLocaleString()}mm`);

    }, [_lines3D]);

    return (
        <Stack
            sx={{
                flexDirection: 'column'
            }}
        >
            <Typography>{totalTime}</Typography>
            {/* <svg
                style={{
                    height,
                    width
                }}
                viewBox={viewbox}
            >
                {
                    times.map(l => <LineSvgComponent key={l.id} {...l} strokeWidth={1} stroke={'black'} selId={selId} handleLineClick={handleLineClick} />)
                }
                {
                    brdrs.map(b => <LineSvgComponent key={b.id} {...b} strokeWidth={0.2} stroke={'red'} selId={selId} handleLineClick={handleLineClick} />)
                }
            </svg > */}
        </Stack>
    )
}

export default TimeSvgComponent
