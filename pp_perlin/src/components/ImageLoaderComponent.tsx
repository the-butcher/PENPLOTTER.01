import UploadFileIcon from '@mui/icons-material/UploadFile';
import { createRef, useEffect, useState } from "react";
import { ICoordinate, IParticle } from "../util/Interfaces";
import { ObjectUtil } from "../util/ObjectUtil";
import { PerlinGrid } from "../util/PerlinGrid";
import { Button } from "@mui/material";

export interface IBluetoothSenderProps {
    dummy?: never;
}

function ImageLoaderComponent(props: IBluetoothSenderProps) {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dummy } = { ...props };

    const canvasRef = createRef<HTMLCanvasElement>();
    const svgRef = createRef<SVGSVGElement>();

    const [d1, setD1] = useState<string>(``);
    const [sig, setSig] = useState<string>(``)
    const [perlinGrid0] = useState<PerlinGrid>(new PerlinGrid({
        cellCountX: 41,
        cellCountY: 21,
        cellSizeXY: 10
    }));
    const [perlinGrid1] = useState<PerlinGrid>(new PerlinGrid({
        cellCountX: 21,
        cellCountY: 11,
        cellSizeXY: 20
    }));
    const [perlinGrid2] = useState<PerlinGrid>(new PerlinGrid({
        cellCountX: 11,
        cellCountY: 6,
        cellSizeXY: 40
    }));


    const [particles, setParticles] = useState<IParticle[]>([]);

    const angleMult = 1;

    const exportSVG = () => {

        // https://stackoverflow.com/questions/60241398/how-to-download-and-svg-element-as-an-svg-file
        const svg = svgRef.current;

        if (svg) {

            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.style.width = `${svgRef.current.width}`;
            svg.style.height = `${svgRef.current.height}`;
            svg.style.maxWidth = `${svgRef.current.width}`;
            svg.style.maxHeight = `${svgRef.current.height}`;
            svg.style.transform = '';

            const outerSVG = svg!.outerHTML;

            svg.style.width = `${svgRef.current.width}`;
            svg.style.height = `${svgRef.current.height}`;
            svg.style.maxWidth = `${svgRef.current.width}`;
            svg.style.maxHeight = `${svgRef.current.height}`;

            const base64doc = btoa(unescape(encodeURIComponent(outerSVG)));
            const a = document.createElement('a');
            const e = new MouseEvent('click');
            a.download = `fold.svg`;
            a.href = 'data:image/svg+xml;base64,' + base64doc;
            a.dispatchEvent(e);

        }

    };

    const stepForward = () => {

        const canvasElement = canvasRef.current;
        const svgElement = svgRef.current;

        if (canvasElement && svgElement) {

            let done = true;
            particles.forEach(particle => {

                if (!particle.done) {

                    done = false;

                    const particlePosCur = particle.p;

                    const forceAngle0 = perlinGrid1.getRasterVal(particlePosCur.x, particlePosCur.y) * Math.PI * angleMult * particle.a;
                    const forceAngle1 = perlinGrid1.getRasterVal(particlePosCur.x, particlePosCur.y) * Math.PI * angleMult * particle.a;
                    const forceAngle2 = perlinGrid2.getRasterVal(particlePosCur.x, particlePosCur.y) * Math.PI * angleMult * particle.a;

                    particle.v.x += Math.cos(forceAngle0 * 0.14 + forceAngle1 * 0.28 + forceAngle2 * 0.56);
                    particle.v.y += Math.sin(forceAngle0 * 0.14 + forceAngle1 * 0.28 + forceAngle2 * 0.56);

                    // particle.v.x += Math.cos(forceAngle2);
                    // particle.v.y += Math.sin(forceAngle2);

                    particle.v.x *= 0.5
                    particle.v.y *= 0.5

                    const particlePosDst: ICoordinate = {
                        x: particlePosCur.x + particle.v.x,
                        y: particlePosCur.y + particle.v.y,
                    }

                    let wrap = false;
                    if (particlePosDst.x < 0) {
                        particlePosDst.x += perlinGrid1.getRasterDimX();
                        wrap = true;
                    }
                    if (particlePosDst.x > perlinGrid1.getRasterDimX()) {
                        particlePosDst.x -= perlinGrid1.getRasterDimX();
                        wrap = true;
                    }
                    if (particlePosDst.y < 0) {
                        particlePosDst.y += perlinGrid1.getRasterDimY();
                        wrap = true;
                    }
                    if (particlePosDst.y > perlinGrid1.getRasterDimY()) {
                        particlePosDst.y -= perlinGrid1.getRasterDimY();
                        wrap = true;
                    }

                    let command = 'L';
                    if (particle.c > 200) { // wrap ||
                        particle.done = true;
                        // particle.path = `${particle.path}M${particlePosDst.x} ${particlePosDst.y}`;
                    }
                    if (particle.c >= 0) {
                        if (wrap || particle.c == 0) {
                            command = 'M';
                        }
                        particle.path = `${particle.path}${command}${particlePosDst.x} ${particlePosDst.y}`;
                    }

                    particle.p = particlePosDst;
                    particle.c = particle.c + 1;

                }

            });

            if (!done) {
                setSig(ObjectUtil.createId());
            }


            // setParticle()



        }

    }

    useEffect(() => {

        console.log('⚙ updating ImageLoaderComponent (sig)', sig);

        window.setTimeout(() => {
            stepForward()
        }, 1);


    }, [sig]);

    useEffect(() => {

        console.debug('✨ building ImageLoaderComponent');

        console.log('perlinGrid0', perlinGrid0.getRasterDimX(), perlinGrid0.getRasterDimY());
        console.log('perlinGrid1', perlinGrid1.getRasterDimX(), perlinGrid1.getRasterDimY());
        console.log('perlinGrid2', perlinGrid2.getRasterDimX(), perlinGrid2.getRasterDimY());

        const canvasElement = canvasRef.current;
        const svgElement = svgRef.current;

        if (canvasElement && svgElement) {

            const canvasDimX = perlinGrid1.getRasterDimX();
            const canvasDimY = perlinGrid1.getRasterDimY();

            const ctx = canvasElement.getContext("2d")!;

            canvasElement.width = canvasDimX;
            canvasElement.height = canvasDimY;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvasDimX, canvasDimY);
            ctx.fill();

            svgElement.setAttribute('viewBox', `0, 0, ${canvasDimX}, ${canvasDimY}`);
            svgElement.style.width = `${canvasDimX}`;
            svgElement.style.height = `${canvasDimY}`;

            // console.log('rasterDimX', rasterDimX, 'rasterDimY', rasterDimY);
            const imageData = ctx.createImageData(canvasDimX, canvasDimY);

            let minDot = Number.MAX_VALUE;
            let maxDot = Number.MIN_VALUE;

            let _d1 = '';
            const _particles: IParticle[] = [];

            const density = 4;
            const deviate = 1;

            for (let pixelIndexY = density; pixelIndexY < canvasDimY - density; pixelIndexY++) {
                for (let pixelIndexX = density; pixelIndexX < canvasDimX - density; pixelIndexX++) {

                    if (pixelIndexX % density == 0 && pixelIndexY % density == 0) {
                        const x = pixelIndexX + (Math.random() - 0.5) * density;
                        const y = pixelIndexY + (Math.random() - 0.5) * density;
                        _particles[pixelIndexY * canvasDimX + pixelIndexX] = {
                            id: ObjectUtil.createId(),
                            p: {
                                x,
                                y
                            },
                            v: {
                                x: 0,
                                y: 0
                            },
                            a: ObjectUtil.mapValues(Math.random(), 0.0, deviate, 1, 1 / deviate), // (Math.random() + 1) * 0.5,
                            c: 0,
                            path: `M${x} ${y}`,
                            done: false
                        }
                    }

                    const dot03 = perlinGrid1.getRasterVal(pixelIndexX, pixelIndexY);

                    if (pixelIndexX % density == 0 && pixelIndexY % density == 0) {
                        const a = dot03 * Math.PI * angleMult; // (dot03 + 1) should make it 0-2 make it an angle
                        const v: ICoordinate = {
                            x: Math.cos(a),
                            y: Math.sin(a),
                        }
                        _d1 += `M${pixelIndexX} ${pixelIndexY}l${v.x * 10} ${v.y * 10}l${-v.x * 2 - v.y * 2} ${-v.y * 2 + v.x * 2}`;

                    }
                    minDot = Math.min(minDot, dot03);
                    maxDot = Math.max(maxDot, dot03);

                    const pixelIndex = (pixelIndexY * canvasDimX + pixelIndexX) * 4;
                    imageData.data[pixelIndex + 0] = (dot03 * 127) + 127;
                    imageData.data[pixelIndex + 1] = (dot03 * 127) + 127;
                    imageData.data[pixelIndex + 2] = (dot03 * 127) + 127;
                    imageData.data[pixelIndex + 3] = 0;

                }
            }

            setParticles(_particles);
            setSig(ObjectUtil.createId());
            setD1(_d1);

            ctx.putImageData(imageData, 0, 0);

        }

    }, []);

    return (
        <div>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    left: '100px',
                    top: '100px',
                }}
            >
            </canvas>
            <svg
                ref={svgRef}
                style={{
                    position: 'absolute',
                    left: '100px',
                    top: '100px',
                    backgroundColor: 'rgba(0,0,0,0.0)'
                }}
            >
                {/* <path
                    style={{
                        stroke: 'rgba(0, 0, 0, 0.05)',
                        strokeWidth: 1,
                        fill: 'none',
                        strokeLinejoin: 'round'
                    }}
                    d={d1}
                /> */}
                {
                    particles.map(p => <path
                        key={p.id}
                        style={{
                            stroke: 'rgba(0, 0, 0, 0.5)',
                            strokeWidth: 0.3,
                            fill: 'none',
                            strokeLinejoin: 'round'
                        }}
                        d={p.path}
                    />)
                }
            </svg>
            <Button
                sx={{
                    width: '200px',
                    marginLeft: '100px'
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

export default ImageLoaderComponent;