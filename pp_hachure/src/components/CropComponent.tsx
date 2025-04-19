import * as turf from "@turf/turf";

import { Position } from "geojson";
import { useEffect, useState } from "react";
import { GeometryUtil } from "../util/GeometryUtil";
import { ICropProps } from "./ICropProps";
import { IRasterConfigProps } from "./IRasterConfigProps";

function CropComponent(props: ICropProps & IRasterConfigProps) {

    const { minPosition3857, maxPosition3857 } = { ...props };

    const [cropMarkData, setCropMarkData] = useState<string>('');
    const [sizeMarkData, setSizeMarkData] = useState<string>('');

    const [minPositionPixl, setMinPositionPixl] = useState<Position>();
    const [maxPositionPixl, setMaxPositionPixl] = useState<Position>();

    useEffect(() => {

        console.debug('✨ building ContentComponent');

    }, []);

    useEffect(() => {

        // console.debug('⚙ updating ContentComponent (content)', content);

        if (minPosition3857 && maxPosition3857) {
            setMinPositionPixl(GeometryUtil.position4326ToPixel(turf.toWgs84(minPosition3857), props));
            setMaxPositionPixl(GeometryUtil.position4326ToPixel(turf.toWgs84(maxPosition3857), props));
        }

    }, [minPosition3857, maxPosition3857]);

    useEffect(() => {

        // console.debug('⚙ updating ContentComponent (content)', content);

        if (minPositionPixl && maxPositionPixl) {
            setCropMarkData(`M${minPositionPixl[0] - 20} ${minPositionPixl[1]}L${minPositionPixl[0]} ${minPositionPixl[1]}L${minPositionPixl[0]} ${minPositionPixl[1] - 20}M${maxPositionPixl[0] + 20} ${maxPositionPixl[1]}L${maxPositionPixl[0]} ${maxPositionPixl[1]}L${maxPositionPixl[0]} ${maxPositionPixl[1] + 20}`);
            setSizeMarkData(`M${minPositionPixl[0] + 10} ${minPositionPixl[1]}L${maxPositionPixl[0]} ${minPositionPixl[1]}L${maxPositionPixl[0]} ${maxPositionPixl[1] - 10}`);
        }

    }, [minPositionPixl, maxPositionPixl]);

    return (
        <>
            <path
                style={{
                    stroke: `rgba(50, 50, 50, 0.75)`,
                    strokeWidth: 1.00,
                    fill: 'none',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round'
                }}
                d={cropMarkData}
            />
            <path
                style={{
                    stroke: `rgba(50, 50, 50, 0.75)`,
                    strokeWidth: 0.50,
                    fill: 'none',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round'
                }}
                d={sizeMarkData}
            />
            {
                minPositionPixl ? <text
                    fontSize={7}
                    fontFamily={'Consolas'}
                    transform={`translate(${minPositionPixl[0] + 7}, ${minPositionPixl[1]}) rotate(-90)`}
                    textAnchor="start"
                >{minPosition3857[0].toFixed(2)}m</text> : null
            }
            {
                minPositionPixl ? <text
                    fontSize={7}
                    fontFamily={'Consolas'}
                    transform={`translate(${minPositionPixl[0]}, ${minPositionPixl[1] + 7})`}
                    textAnchor="end"
                >{minPosition3857[1].toFixed(2)}m</text> : null
            }
            {
                maxPositionPixl ? <text
                    fontSize={7}
                    fontFamily={'Consolas'}
                    transform={`translate(${maxPositionPixl[0] - 3}, ${maxPositionPixl[1]}) rotate(-90)`}
                    textAnchor="end"
                >{maxPosition3857[0].toFixed(2)}m</text> : null
            }
            {
                maxPositionPixl ? <text
                    fontSize={7}
                    fontFamily={'Consolas'}
                    transform={`translate(${maxPositionPixl[0]}, ${maxPositionPixl[1] - 3})`}
                    textAnchor="start"
                >{maxPosition3857[1].toFixed(2)}m</text> : null
            }
            {
                minPositionPixl && maxPositionPixl ? <text
                    fontSize={7}
                    fontFamily={'Consolas'}
                    transform={`translate(${maxPositionPixl[0]}, ${minPositionPixl[1] - 3})`}
                    textAnchor="end"
                >{(maxPosition3857[0] - minPosition3857[0]).toFixed(2)}m</text> : null
            }
            {
                minPositionPixl && maxPositionPixl ? <text
                    fontSize={7}
                    fontFamily={'Consolas'}
                    transform={`translate(${maxPositionPixl[0] + 7}, ${minPositionPixl[1]}) rotate(-90)`}
                    textAnchor="end"
                >{(minPosition3857[1] - maxPosition3857[1]).toFixed(2)}m</text> : null
            }
        </>
    );
}

export default CropComponent;