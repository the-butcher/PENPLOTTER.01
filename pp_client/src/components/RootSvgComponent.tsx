import { useEffect, useState } from "react";
import { GeometryUtil } from "../util/GeometryUtil";
import { ObjectUtil } from "../util/ObjectUtil";
import LinepathSvgComponent from "./LinepathSvgComponent";
import { ILinePath, IRootSvgProperties } from "../util/Interfaces";



function RootSvgComponent(props: IRootSvgProperties) {

    const { lines: _lines, extent: _extent, selId, handleLineClick } = { ...props };

    const [viewbox, setViewbox] = useState<string>('0, 0, 1, 1');
    const [width, setWidth] = useState<number>(1);
    const [height, setHeight] = useState<number>(1);

    const [lines, setLines] = useState<JSX.Element[]>([]);
    const [bounds, setBounds] = useState<JSX.Element>();

    useEffect(() => {

        console.debug('⚙ updating root svg component (_linegroupProperties, _extent)', _lines, _extent);

        const _width = _extent.xMax - _extent.xMin + GeometryUtil.IMAGE_PADDING * 2;
        const _height = _extent.yMax - _extent.yMin + GeometryUtil.IMAGE_PADDING * 2;
        const _viewbox = `${_extent.xMin - GeometryUtil.IMAGE_PADDING}, ${_extent.yMin - GeometryUtil.IMAGE_PADDING}, ${_width},${_height}`;
        setViewbox(_viewbox);
        setWidth(_width * GeometryUtil.IMAGE___SCALE);
        setHeight(_height * GeometryUtil.IMAGE___SCALE);

        const _bounds: ILinePath = {
            id: ObjectUtil.createId(),
            penId: ObjectUtil.PEN_ID_DEFAULT,
            strokeWidth: GeometryUtil.PEN_____WIDTH / 2,
            stroke: 'red',
            segments: [
                { // upper border
                    id: ObjectUtil.createId(),
                    coordA: {
                        x: _extent.xMin,
                        y: _extent.yMin
                    },
                    coordB: {
                        x: _extent.xMax,
                        y: _extent.yMin
                    }
                },
                { // right border
                    id: ObjectUtil.createId(),
                    coordA: {
                        x: _extent.xMax,
                        y: _extent.yMin
                    },
                    coordB: {
                        x: _extent.xMax,
                        y: _extent.yMax
                    }
                },
                { // lower border
                    id: ObjectUtil.createId(),
                    coordA: {
                        x: _extent.xMax,
                        y: _extent.yMax
                    },
                    coordB: {
                        x: _extent.xMin,
                        y: _extent.yMax
                    }
                },
                { // right border
                    id: ObjectUtil.createId(),
                    coordA: {
                        x: _extent.xMin,
                        y: _extent.yMax
                    },
                    coordB: {
                        x: _extent.xMin,
                        y: _extent.yMin
                    }
                }
            ]
        };
        setBounds(<LinepathSvgComponent {..._bounds} selId={selId} handleLineClick={() => { }} />);
        setLines(_lines.map(l => <LinepathSvgComponent key={l.id} {...l} selId={selId} handleLineClick={handleLineClick} />));


    }, [_lines, _extent, selId]);

    return (
        <svg
            style={{
                height,
                width
            }}
            viewBox={viewbox}
        >
            {
                lines
            }
            {
                bounds
            }
        </svg >
    )
}

export default RootSvgComponent
