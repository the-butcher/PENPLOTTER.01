import { useEffect, useState } from "react";
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from "../util/ObjectUtil";
import { ICoordinate2D, IRootSvgProperties } from "../util/Interfaces";

function HRulSvgComponent(props: IRootSvgProperties) {

    const { extent: _extent } = { ...props };

    const [viewbox, setViewbox] = useState<string>('0, 0, 1, 1');
    const [width, setWidth] = useState<number>(1);
    const [height, setHeight] = useState<number>(1);
    const [d, setD] = useState<string>('1');
    const [textPos, setTextPos] = useState<ICoordinate2D>({
        x: 0,
        y: 0
    });
    const [text, setText] = useState<string>('');

    // TODO :: svg navigation

    useEffect(() => {

        console.debug('⚙ updating horizontal ruler component (_extent)', _extent);

        const _pathsWidth = _extent.xMax - _extent.xMin;
        const _imageWidth = _pathsWidth + GeometryUtil.IMAGE_PADDING * 2;
        const _height = 40 / GeometryUtil.IMAGE___SCALE;
        const _viewbox = `${_extent.xMin}, ${0}, ${_imageWidth},${_height}`;
        setViewbox(_viewbox);
        setWidth(_imageWidth * GeometryUtil.IMAGE___SCALE);
        setHeight(_height * GeometryUtil.IMAGE___SCALE);

        const xMin = _extent.xMin + GeometryUtil.IMAGE_PADDING;
        const xMax = _extent.xMin + _imageWidth - GeometryUtil.IMAGE_PADDING;
        const _d = `M${xMin} 5L${xMin} 2L${xMax} 2L${xMax} 5`;
        setD(_d);

        setTextPos({
            x: _extent.xMin + _imageWidth / 2,
            y: 7
        });
        setText(`${_pathsWidth.toLocaleString(undefined, ObjectUtil.NUMBER_OPTIONS_DEFAULT)}mm`)

    }, [_extent]);

    return (
        <svg
            style={{
                height,
                width
            }}
            viewBox={viewbox}
        >
            <path
                style={{
                    strokeWidth: GeometryUtil.PEN_WIDTH_SEG,
                    stroke: 'black',
                    fill: 'none'
                }}
                d={d}
            />
            <text
                transform={`translate(${textPos.x}, ${textPos.y})`}
                fontSize={4}
                textAnchor={'middle'}
            >{text}</text>
        </svg >
    )
}

export default HRulSvgComponent
