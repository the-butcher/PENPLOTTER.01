
import { useEffect, useRef, useState } from 'react';
import { CoordUtil } from '../util/CoordUtil';
import { IBlockPlanar } from './IBlockPlanar';

export interface IAccelerationChartProps {
    blocks: IBlockPlanar[];
}

function AccelerationChartComponent(props: IAccelerationChartProps) {

    const { blocks } = props;

    const [dY] = useState<number>(400); // setDY
    const [dX, setDX] = useState<number>(600);
    const [d0, setD0] = useState<string>("");
    const [d1, setD1] = useState<string>("");
    const [d2, setD2] = useState<string>("");
    const [d3, setD3] = useState<string>("");
    const [maxSecond, setMaxSecond] = useState<string>('')

    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {

        console.debug('✨ building BlockCoordsComponent');

    }, []);

    useEffect(() => {

        console.debug('⚙ updating BlockCoordsComponent (blocks)', blocks);

        if (blocks?.length > 1) {

            let _dX = 0;
            const sX = 100;
            const sY = 8;
            let _d0 = `M 0 ${dY}`;
            let _d1 = `M 0 ${dY}`;
            let _d2 = `M 0 ${dY}`;
            let _d3 = `M 0 ${dY - (dY - 20)}`;

            _dX = 0;
            let _maxSecond = 0;
            for (let index = 0; index < blocks.length; index++) {

                _d1 += `M${_dX} ${dY - blocks[index].vi * sY}`;

                const vBlock = (blocks[index].vo + blocks[index].vi) / 2;
                const tBlock = blocks[index].l / vBlock;
                _maxSecond += tBlock;

                _dX += tBlock * sX;

                _d1 += `L${_dX} ${dY - blocks[index].vo * sY}`;
                _d3 += `L${_dX} ${dY - blocks[index].z1 * 3 - (dY - 20)}`; // z-indicator

                _d0 += `M${_dX} 0`;
                if (blocks[index].bb) {

                    _d0 += `L${_dX} ${dY}`;
                } else {
                    _d0 += `L${_dX} ${dY / 2}`;
                }

                // doublecheck on acceleration
                // const aA = (blocks[index].vo * blocks[index].vo - blocks[index].vi * blocks[index].vi) * 0.5 / blocks[index].l;
                // console.log(`aA (${index})`, aA.toFixed(3).padStart(7, ' '), blocks[index].vi.toFixed(3).padStart(7, ' '), blocks[index].vo.toFixed(3).padStart(7, ' '));

                // console.log(`vv (${index})`, monoCoords[index].vi.toFixed(3).padStart(7, ' '), monoCoords[index].vo.toFixed(3).padStart(7, ' '));

            }

            for (let second = 0; second < _maxSecond; second += 1) {
                _dX = second * sX;
                _d2 += `M${_dX} 0`;
                _d2 += `L${_dX} ${dY}`;
            }
            _dX = _maxSecond * sX;

            // horizontal lines at min and max speed
            _d2 += `M${0} ${dY - CoordUtil.MIN_MMS * sY}`;;
            _d2 += `L${_dX} ${dY - CoordUtil.MIN_MMS * sY}`;
            _d2 += `M${0} ${dY - CoordUtil.MAX_MMS * sY}`;;
            _d2 += `L${_dX} ${dY - CoordUtil.MAX_MMS * sY}`;

            // console.log('_d', _d1);
            setDX(_dX);
            setD0(_d0);
            setD1(_d1);
            setD2(_d2);
            setD3(_d3);

            const minutes = Math.floor(_maxSecond / 60);
            const seconds = Math.floor(_maxSecond - minutes * 60);

            setMaxSecond(`${minutes}m, ${seconds}s`);

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocks]);

    return (
        <>
            <div style={{ overflow: 'auto' }}>
                <svg
                    ref={svgRef}
                    style={{
                        width: `${dX}`,
                        height: `${dY}`,
                        // position: 'relative'
                    }}
                    viewBox={`0, 0, ${dX},  ${dY}`}
                >
                    <path fill="none" stroke="gray" strokeWidth={0.2} d={d2} />

                    <path fill="none" stroke="red" strokeWidth={0.5} d={d0} />
                    <path fill="none" stroke="black" strokeWidth={1} d={d3} />
                    <path fill="none" stroke="black" strokeWidth={0.5} strokeLinejoin={'round'} strokeLinecap={'round'} d={d1} />
                </svg>
            </div>
            <div>{maxSecond}</div>
        </>
    );
}

export default AccelerationChartComponent;