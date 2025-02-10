import { useState } from "react";
import { ILine2D } from "../util/Interfaces";

export interface ILinestyleProperties {
    strokeWidth: number;
    stroke: string;
    selId: string;
    handleLineClick: (id: string) => void;
}

function LineSvgComponent(props: ILine2D & ILinestyleProperties) {

    const { id, coordA, coordB, strokeWidth: _strokeWidth, stroke: _stroke, selId, handleLineClick } = { ...props };

    const [strokeWidth] = useState<number>(_strokeWidth); // setStrokeWidth
    const [stroke] = useState<string>(_stroke); // setStroke

    return (
        <>
            <line
                style={{
                    stroke: id.startsWith(selId) ? 'red' : stroke,
                    strokeWidth: id.startsWith(selId) ? Math.max(1, strokeWidth * 3) : strokeWidth,
                    fill: 'none',
                    strokeLinecap: 'round'
                }}
                x1={coordA.x}
                y1={coordA.y}
                x2={coordB.x}
                y2={coordB.y}
                onClick={() => handleLineClick(id)}
            />
            <line
                style={{
                    stroke: 'rgba(0, 0, 0 , 0.0)',
                    strokeWidth: 5,
                    fill: 'none',
                    strokeLinecap: 'round'
                }}
                x1={coordA.x}
                y1={coordA.y}
                x2={coordB.x}
                y2={coordB.y}
                onClick={() => handleLineClick(id)}
            />
        </>

    )
}

export default LineSvgComponent
