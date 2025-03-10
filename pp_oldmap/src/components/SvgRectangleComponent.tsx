import { BBox, Position } from "geojson";
import { useEffect, useState } from "react";

export interface ISvgRectangleComponentProps {
    id: string;
    bbox: BBox;
    stroke: string;
    penWidth: number;
    strokeDasharray?: string | number;
    coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position;
}

function SvgRectangleComponent(props: ISvgRectangleComponentProps) {

    const { id, bbox, stroke, penWidth, strokeDasharray, coordinate4326ToCoordinateCanvas } = { ...props };

    const [x, setX] = useState<number>(0);
    const [y, setY] = useState<number>(0);
    const [w, setW] = useState<number>(0);
    const [h, setH] = useState<number>(0);

    useEffect(() => {
        console.debug('✨ building map rectangle component');
    }, []);

    useEffect(() => {

        console.log('⚙ updating map rectangle component (bbox)', bbox);

        const coordinateLL = coordinate4326ToCoordinateCanvas([
            bbox[0],
            bbox[1]
        ]);
        const coordinateUR = coordinate4326ToCoordinateCanvas([
            bbox[2],
            bbox[3]
        ]);
        setX(coordinateLL[0]);
        setY(coordinateUR[1]);
        setW(coordinateUR[0] - coordinateLL[0]);
        setH(coordinateLL[1] - coordinateUR[1]);


    }, [bbox]);

    const toStrokeWidth = (penWidth: number): number => {
        return penWidth * 12;
        // return 0.2;
    }

    return (
        <g id={id}>
            <rect
                style={{
                    stroke,
                    strokeWidth: toStrokeWidth(penWidth),
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeDasharray,
                    fill: 'none'
                }}
                x={x}
                y={y}
                width={w}
                height={h}
            />
        </g>
    );
}

export default SvgRectangleComponent
