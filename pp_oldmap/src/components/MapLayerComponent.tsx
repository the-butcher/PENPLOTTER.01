import { MultiLineString, Position } from "geojson";
import { useEffect, useState } from "react";

export interface IMapLayerComponentProps {
    id: string;
    polylines005: MultiLineString;
    polylines010: MultiLineString;
    polylines030: MultiLineString;
    polylines050: MultiLineString;
    coordinate4326ToCoordinateCanvas: (coordinate4326: Position) => Position;
}

function MapLayerComponent(props: IMapLayerComponentProps) {

    const { id, polylines005, polylines010, polylines030, polylines050, coordinate4326ToCoordinateCanvas } = { ...props };

    const [d005, setD005] = useState<string>('');
    const [d010, setD010] = useState<string>('');
    const [d030, setD030] = useState<string>('');
    const [d050, setD050] = useState<string>('');

    useEffect(() => {
        console.debug('✨ building map layer component');
    }, []);

    useEffect(() => {

        console.log('⚙ updating map layer component (polylines01, polylines03, polylines05)', polylines010, polylines030, polylines050);

        let _d005 = '';
        let _d010 = '';
        let _d030 = '';
        let _d050 = '';
        const drawRing = (ring: Position[], d: string): string => {
            let command = 'M';
            ring.forEach(coordinate => {
                const coordinateCanvas = coordinate4326ToCoordinateCanvas(coordinate);
                d += `${command}${coordinateCanvas[0].toPrecision(8)} ${coordinateCanvas[1].toPrecision(8)}`
                command = 'L';
            });
            d += `M0 0`;
            return d;
        }

        const drawPolyline = (polyline: Position[], d: string): string => {
            return drawRing(polyline, d);
        }

        polylines005.coordinates.forEach(polyline005 => {
            _d005 = drawPolyline(polyline005, _d005);
        });
        polylines010.coordinates.forEach(polyline010 => {
            _d010 = drawPolyline(polyline010, _d010);
        });
        polylines030.coordinates.forEach(polyline030 => {
            _d030 = drawPolyline(polyline030, _d030);
        });
        polylines050.coordinates.forEach(polyline050 => {
            _d050 = drawPolyline(polyline050, _d050);
        });

        setD005(_d005);
        setD010(_d010);
        setD030(_d030);
        setD050(_d050);

    }, [polylines005, polylines010, polylines030, polylines050]);

    const toStrokeWidth = (penWidth: number): number => {
        return penWidth * 12;
        // return 0.2;
    }

    return (
        <g id={id}>
            <path
                style={{
                    stroke: 'black',
                    strokeWidth: toStrokeWidth(0.05),
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    fill: 'none'
                }}
                // eslint-disable-next-line react/no-unknown-property
                pen-id='p005'
                d={d005}
            />
            <path
                style={{
                    stroke: 'black',
                    strokeWidth: toStrokeWidth(0.1),
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    fill: 'none'
                }}
                // eslint-disable-next-line react/no-unknown-property
                pen-id='p010'
                d={d010}
            />
            <path
                style={{
                    stroke: 'black',
                    strokeWidth: toStrokeWidth(0.2),
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    fill: 'none' // 'rgba(0, 0, 0, 0.10)'
                }}
                // eslint-disable-next-line react/no-unknown-property
                pen-id='p030'
                d={d030}
            />
            <path
                style={{
                    stroke: 'black',
                    strokeWidth: toStrokeWidth(0.5),
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    fill: 'none'
                }}
                // eslint-disable-next-line react/no-unknown-property
                pen-id='p050'
                d={d050}
            />
        </g>
    );
}

export default MapLayerComponent
