import { Position } from "geojson";
import { useEffect, useState } from "react";
import { IMapLayerProps } from "./IMapLayerProps";
import { ColorOverrides } from "../map/color/PenOverrides";

function SvgMapLayerComponent(props: IMapLayerProps) {

    const { id, visible, polylines018, polylines025, polylines035, polylines050, coordinate4326ToCoordinateCanvas } = { ...props };

    const [d018, setD018] = useState<string>('');
    const [d025, setD025] = useState<string>('');
    const [d035, setD035] = useState<string>('');
    const [d050, setD050] = useState<string>('');

    useEffect(() => {
        console.debug('✨ building map layer component');
    }, []);

    useEffect(() => {

        console.debug('⚙ updating map layer component (polylines018, polylines025, polylines035, polylines050)', polylines018, polylines025, polylines035, polylines050);

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

        setD018(_d018);
        setD025(_d025);
        setD035(_d035);
        setD050(_d050);

    }, [polylines018, polylines025, polylines035, polylines050]);

    const toStrokeWidth = (penWidth: number): number => {
        return penWidth * 3;
        // return 0.2;
    }
    const stroke = 'rgba(0, 0, 0, 1)';

    return (
        <g id={id}>
            {
                d018 !== '' ? <path
                    style={{
                        stroke: ColorOverrides.getRgba(id, 'p018'),
                        strokeWidth: toStrokeWidth(0.18),
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        fill: 'none',
                        visibility: visible ? 'visible' : 'hidden'
                    }}
                    // eslint-disable-next-line react/no-unknown-property
                    pen-id={ColorOverrides.getPenName(id, 'p018')}
                    d={d018}
                /> : null
            }
            {
                d025 !== '' ? <path
                    style={{
                        stroke: ColorOverrides.getRgba(id, 'p025'),
                        strokeWidth: toStrokeWidth(0.25),
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        fill: 'none',
                        visibility: visible ? 'visible' : 'hidden'
                    }}
                    // eslint-disable-next-line react/no-unknown-property
                    pen-id={ColorOverrides.getPenName(id, 'p025')}
                    d={d025}
                /> : null
            }
            {
                d035 !== '' ? <path
                    style={{
                        stroke: ColorOverrides.getRgba(id, 'p035'),
                        strokeWidth: toStrokeWidth(0.35),
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        fill: 'none',
                        visibility: visible ? 'visible' : 'hidden'
                    }}
                    // eslint-disable-next-line react/no-unknown-property
                    pen-id={ColorOverrides.getPenName(id, 'p035')}
                    d={d035}
                /> : null
            }
            {
                d050 !== '' ? <path
                    style={{
                        stroke: ColorOverrides.getRgba(id, 'p050'),
                        strokeWidth: toStrokeWidth(0.50),
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        fill: 'none',
                        visibility: visible ? 'visible' : 'hidden'
                    }}
                    // eslint-disable-next-line react/no-unknown-property
                    pen-id={ColorOverrides.getPenName(id, 'p050')}
                    d={d050}
                /> : null
            }
        </g>
    );
}

export default SvgMapLayerComponent
