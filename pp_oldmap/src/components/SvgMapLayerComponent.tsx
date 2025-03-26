import { Position } from "geojson";
import { useEffect, useState } from "react";
import { IMapLayerProps } from "./IMapLayerProps";

function SvgMapLayerComponent(props: IMapLayerProps) {

    const { id, visible, polylines013, polylines018, polylines025, polylines035, polylines050, coordinate4326ToCoordinateCanvas } = { ...props };

    const [d013, setD013] = useState<string>('');
    const [d018, setD018] = useState<string>('');
    const [d025, setD025] = useState<string>('');
    const [d035, setD035] = useState<string>('');
    const [d050, setD050] = useState<string>('');

    useEffect(() => {
        console.debug('✨ building map layer component');
    }, []);

    useEffect(() => {

        console.debug('⚙ updating map layer component (polylines013, polylines018, polylines025, polylines035, polylines050)', polylines013, polylines018, polylines025, polylines035, polylines050);

        let _d013 = '';
        let _d018 = '';
        let _d025 = '';
        let _d035 = '';
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

        polylines013.coordinates.forEach(polyline013 => {
            _d013 = drawPolyline(polyline013, _d013);
        });
        polylines018.coordinates.forEach(polyline018 => {
            _d018 = drawPolyline(polyline018, _d018);
        });
        polylines025.coordinates.forEach(polyline025 => {
            _d025 = drawPolyline(polyline025, _d025);
        });
        polylines035.coordinates.forEach(polyline035 => {
            _d035 = drawPolyline(polyline035, _d035);
        });
        polylines050.coordinates.forEach(polyline050 => {
            _d050 = drawPolyline(polyline050, _d050);
        });

        setD013(_d013);
        setD018(_d018);
        setD025(_d025);
        setD035(_d035);
        setD050(_d050);

    }, [polylines013, polylines018, polylines025, polylines035, polylines050]);

    const toStrokeWidth = (penWidth: number): number => {
        return penWidth * 3;
        // return 0.2;
    }
    const stroke = 'rgba(0, 0, 0, 1)';

    return (
        <g id={id}>
            <path
                style={{
                    stroke: 'rgba(0, 0, 0, 0.20)',
                    strokeWidth: toStrokeWidth(0.25),
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    fill: 'none',
                    visibility: visible ? 'visible' : 'hidden'
                }}
                // eslint-disable-next-line react/no-unknown-property
                pen-id='p013'
                d={d013}
            />
            <path
                style={{
                    stroke,
                    strokeWidth: toStrokeWidth(0.18),
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    fill: 'none',
                    visibility: visible ? 'visible' : 'hidden'
                }}
                // eslint-disable-next-line react/no-unknown-property
                pen-id='p018'
                d={d018}
            />
            <path
                style={{
                    stroke,
                    strokeWidth: toStrokeWidth(0.25),
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    fill: 'none',
                    visibility: visible ? 'visible' : 'hidden'
                }}
                // eslint-disable-next-line react/no-unknown-property
                pen-id='p025'
                d={d025}
            />
            <path
                style={{
                    stroke,
                    strokeWidth: toStrokeWidth(0.35),
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    fill: 'none',
                    visibility: visible ? 'visible' : 'hidden'
                }}
                // eslint-disable-next-line react/no-unknown-property
                pen-id='p035'
                d={d035}
            />
            <path
                style={{
                    stroke,
                    strokeWidth: toStrokeWidth(0.50),
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    fill: 'none',
                    visibility: visible ? 'visible' : 'hidden'
                }}
                // eslint-disable-next-line react/no-unknown-property
                pen-id='p050'
                d={d050}
            />
        </g>
    );
}

export default SvgMapLayerComponent
