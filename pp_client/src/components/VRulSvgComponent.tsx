import { useEffect, useState } from "react";
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from "../util/ObjectUtil";
import { ICoordinate2D, IRootSvgProperties } from "../util/Interfaces";

function VRulSvgComponent(props: IRootSvgProperties) {

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

    useEffect(() => {

        console.debug('⚙ updating vertical ruler component (_extent)', _extent);

        const _width = 40 / GeometryUtil.IMAGE___SCALE;
        const _pathsHeight = _extent.yMax - _extent.yMin;
        const _imageHeight = _extent.yMax - _extent.yMin + GeometryUtil.IMAGE_PADDING * 2;
        const _viewbox = `${0}, ${_extent.yMin}, ${_width},${_imageHeight}`;
        setViewbox(_viewbox);
        setWidth(_width * GeometryUtil.IMAGE___SCALE);
        setHeight(_imageHeight * GeometryUtil.IMAGE___SCALE);

        const yMin = _extent.yMin + GeometryUtil.IMAGE_PADDING;
        const yMax = _extent.yMin + _imageHeight - GeometryUtil.IMAGE_PADDING;
        const _d = `M${_width - 5} ${yMin}L${_width - 2} ${yMin}L${_width - 2} ${yMax}L${_width - 5} ${yMax}`;
        setD(_d);
        setTextPos({
            x: _width - 4,
            y: _extent.yMin + _imageHeight / 2,
        });
        setText(`${_pathsHeight.toLocaleString(undefined, ObjectUtil.NUMBER_OPTIONS_DEFAULT)}mm`)

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
                    strokeWidth: GeometryUtil.PEN_____WIDTH,
                    stroke: 'black',
                    fill: 'none'
                }}
                d={d}
            />
            <text
                transform={`translate(${textPos.x}, ${textPos.y}) rotate(-90)`}
                fontSize={4}
                textAnchor={'middle'}
            >{text}</text>
        </svg >
    )
}

export default VRulSvgComponent
