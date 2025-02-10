
import { useEffect, useRef, useState } from 'react';
import WaveComponent, { ICoordinate, IWaveProps } from './WaveComponent';

export interface ICanvasProps {
    nY: number;
}

function CanvasComponent(props: ICanvasProps) {

    const { nY } = props;

    const [dX] = useState<number>(800); // setDX
    const [dY] = useState<number>(600); // setDY
    const [d2, setD2] = useState<string>('');

    const [waveProps, setWaveProps] = useState<IWaveProps[]>([]);

    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {

        console.debug('✨ building CanvasComponent');

        const coordinates: ICoordinate[] = [];
        // coordinates.push({
        //     x: dX * 0.5,
        //     y: dY * 0.5,
        // })
        for (let k = 0; k < 5; k++) {
            coordinates.push({
                x: Math.round(dX * Math.random()),
                y: Math.round(dY * Math.random()),
                f: Math.random() * 4 - 0.5
            })
            // coordinates.push({
            //     x: Math.round(dX * 0.5) + Math.cos(k * Math.PI * 2 / 12) * 250,
            //     y: Math.round(dY * 0.5) + Math.sin(k * Math.PI * 2 / 12) * 250,
            // })
        }
        let _d2 = '';
        coordinates.forEach(coordinate => {
            _d2 += `M${coordinate.x} ${coordinate.y - 10}L${coordinate.x} ${coordinate.y + 10}M${coordinate.x - 10} ${coordinate.y}L${coordinate.x + 10} ${coordinate.y}`
        });
        // setD2(_d2);
        console.log('coordinates', coordinates);

        console.log('nY', nY);
        let _waves: IWaveProps[] = [];
        for (let iY = 0; iY < nY; iY++) {
            _waves.push({
                iY,
                nY,
                dX,
                dY,
                coordinates
            });
        }
        setWaveProps(_waves);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            a.download = `wave.svg`;
            a.href = 'data:image/svg+xml;base64,' + base64doc;
            a.dispatchEvent(e);



        }


        // eslint-disable-next-line react-hooks/exhaustive-deps
    };

    return (
        <svg
            ref={svgRef}
            style={{
                width: `${dX}`,
                height: `${dY}`,
            }}
            onClick={exportSVG}
            viewBox={`-100, -100, ${dX + 200}, ${dY + 200}`}
        >
            {
                waveProps.map(wave => <WaveComponent {...wave} />)
            }

            <path
                style={{
                    stroke: 'black',
                    strokeWidth: 1,
                    fill: 'none'
                }}
                d={d2}
            />
        </svg>
    );
}

export default CanvasComponent;