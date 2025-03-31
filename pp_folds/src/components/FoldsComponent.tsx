import { createRef, useEffect, useState } from "react";
import { ICoordinate } from "../util/Interfaces";
import { Button } from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';

export interface IFoldsProps {
    dummy?: never;
}

function FoldsComponent() {

    const svgRef = createRef<SVGSVGElement>();
    const [dX] = useState<number>(800); // setDX
    const [dY] = useState<number>(600); // setDY
    const [d, setD] = useState<string>(``);

    // const [raster, setRaster] = useState<ICoordinate[]>([]);

    const exportSVG = () => {

        // https://stackoverflow.com/questions/60241398/how-to-download-and-svg-element-as-an-svg-file
        const svg = svgRef.current;

        if (svg) {

            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.style.width = `${dX}`;
            svg.style.height = `${dY}`;
            svg.style.maxWidth = `${dX}`;
            svg.style.maxHeight = `${dY}`;
            svg.style.transform = '';

            const outerSVG = svg!.outerHTML;

            svg.style.width = `${dX}`;
            svg.style.height = `${dY}`;
            svg.style.maxWidth = `${dX}`;
            svg.style.maxHeight = `${dY}`;

            const base64doc = btoa(unescape(encodeURIComponent(outerSVG)));
            const a = document.createElement('a');
            const e = new MouseEvent('click');
            a.download = `fold.svg`;
            a.href = 'data:image/svg+xml;base64,' + base64doc;
            a.dispatchEvent(e);

        }

    };

    useEffect(() => {

        // console.log('⚙ updating FoldsComponent (lines)', d);


    }, [d]);



    useEffect(() => {

        console.debug('✨ building FoldsComponent');

        const rasterDimX = 11;
        const rasterDimY = 30;

        const rasterDstX = 60;
        const rasterDstY = 10;

        const _raster: ICoordinate[] = [];

        for (let y = 0; y < rasterDimY; y++) {
            for (let x = 0; x < rasterDimX; x++) {
                _raster[y * rasterDimX + x] = {
                    x: rasterDstX * x,
                    y: rasterDstY * y
                };
            }
        }

        for (let y = 1; y < rasterDimY - 1; y++) {
            for (let x = 2; x < rasterDimX - 2; x++) {
                _raster[y * rasterDimX + x].x += (0.5 - Math.random()) * 50;
                _raster[y * rasterDimX + x].y += (0.5 - Math.random()) * 7;
            }
        }

        let _d = '';
        let rasterIndexA: number;
        let rasterIndexB: number;
        let xA: number;
        let yA: number;
        let xB: number;
        let yB: number;
        let xI: number;
        let yI: number;
        const rasterDimI = 5;
        for (let i = 0; i < rasterDimI; i++) {
            for (let y = 0; y < rasterDimY - 1; y++) {
                let command = 'M';
                for (let x = 0; x < rasterDimX; x++) {

                    rasterIndexA = y * rasterDimX + x;
                    rasterIndexB = (y + 1) * rasterDimX + x;
                    xA = _raster[rasterIndexA].x;
                    yA = _raster[rasterIndexA].y;
                    xB = _raster[rasterIndexB].x;
                    yB = _raster[rasterIndexB].y;
                    xI = xA + (xB - xA) * i / rasterDimI;
                    yI = yA + (yB - yA) * i / rasterDimI;

                    _d += `${command}${xI} ${yI} `
                    if (x == 0 || x == rasterDimX - 2) {
                        command = 'L';
                    } else {
                        command = x % 2 == 1 ? 'S' : '';
                    }
                    // command = x == 0 ? 'C' : x > 2 && x % 2 == 1 ? 'S' : '';
                    // command = 'L';
                }

            }
        }

        console.log('_raster', _raster, _d);
        setD(_d);

    }, []);

    return (
        <div>
            <svg
                ref={svgRef}
                style={{
                    backgroundColor: 'rgba(0,0,0,0.0)'
                }}
                width={dX}
                height={dY}
            >
                <path
                    style={{
                        stroke: '#000000',
                        strokeWidth: 0.3,
                        fill: 'none'
                    }}
                    transform={'translate(40, 40)'}
                    d={d}
                />
            </svg>
            <Button
                sx={{
                    width: '200px'
                }}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<UploadFileIcon />}
                onClick={exportSVG}
            >download</Button>
        </div>
    );

}

export default FoldsComponent;