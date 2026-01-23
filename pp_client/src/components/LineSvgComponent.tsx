import { useState } from "react";
import { ILineXY } from "../util/ILineXY";

export interface ILinestyleProperties {
    strokeWidth: number;
    stroke: string;
    selId: string;
    handleLineClick: (id: string) => void;
}

function LineSvgComponent(props: ILineXY & ILinestyleProperties) {

    const { coordA, coordB, strokeWidth: _strokeWidth, stroke: _stroke } = { ...props };

    const [strokeWidth] = useState<number>(_strokeWidth); // setStrokeWidth
    const [stroke] = useState<string>(_stroke); // setStroke

    return (
        <>
            <line
                style={{
                    stroke,
                    strokeWidth,
                    fill: 'none',
                    strokeLinecap: 'round'
                }}
                x1={coordA.x}
                y1={coordA.y}
                x2={coordB.x}
                y2={coordB.y}
            />
        </>

    )
}

export default LineSvgComponent
