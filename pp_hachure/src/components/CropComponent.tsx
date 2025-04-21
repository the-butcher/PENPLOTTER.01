
import { Position } from "geojson";
import { useEffect, useState } from "react";
import { GeometryUtil } from "../util/GeometryUtil";
import { ICropProps } from "./ICropProps";
import { IRasterConfigProps } from "./IRasterConfigProps";

/**
 * this component adds crop marks and basic extent information to the preview svg
 *
 * @param props
 * @returns
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
function CropComponent(props: ICropProps & IRasterConfigProps) {

    const { minPositionProj, maxPositionProj, converter } = { ...props };

    const [cropMarkData, setCropMarkData] = useState<string>('');
    const [sizeMarkData, setSizeMarkData] = useState<string>('');

    const [minPositionPixl, setMinPositionPixl] = useState<Position>();
    const [maxPositionPixl, setMaxPositionPixl] = useState<Position>();

    useEffect(() => {

        console.debug('✨ building ContentComponent');

    }, []);

    useEffect(() => {

        // console.debug('⚙ updating ContentComponent (content)', content);

        if (minPositionProj && maxPositionProj) {
            setMinPositionPixl(GeometryUtil.positionProjToPixel(minPositionProj, props));
            setMaxPositionPixl(GeometryUtil.positionProjToPixel(maxPositionProj, props));
        }

    }, [minPositionProj, maxPositionProj]);

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
                    fontSize={5}
                    fontFamily={'Consolas'}
                    transform={`translate(${minPositionPixl[0] + 7}, ${minPositionPixl[1] - 2}) rotate(-90)`}
                    textAnchor="start"
                >{minPositionProj[0].toFixed(2)}&nbsp;{converter.projUnitAbbr}</text> : null
            }
            {
                minPositionPixl ? <text
                    fontSize={5}
                    fontFamily={'Consolas'}
                    transform={`translate(${minPositionPixl[0] - 2}, ${minPositionPixl[1] + 7})`}
                    textAnchor="end"
                >{minPositionProj[1].toFixed(2)} {converter.projUnitAbbr}</text> : null
            }
            {
                maxPositionPixl ? <text
                    fontSize={5}
                    fontFamily={'Consolas'}
                    transform={`translate(${maxPositionPixl[0] - 3}, ${maxPositionPixl[1] + 2}) rotate(-90)`}
                    textAnchor="end"
                >{maxPositionProj[0].toFixed(2)} {converter.projUnitAbbr}</text> : null
            }
            {
                maxPositionPixl ? <text
                    fontSize={5}
                    fontFamily={'Consolas'}
                    transform={`translate(${maxPositionPixl[0] + 2}, ${maxPositionPixl[1] - 3})`}
                    textAnchor="start"
                >{maxPositionProj[1].toFixed(2)} {converter.projUnitAbbr}</text> : null
            }
            {
                minPositionPixl && maxPositionPixl ? <text
                    fontSize={5}
                    fontFamily={'Consolas'}
                    transform={`translate(${maxPositionPixl[0] - 2}, ${minPositionPixl[1] - 3})`}
                    textAnchor="end"
                >{(maxPositionProj[0] - minPositionProj[0]).toFixed(2)} {converter.projUnitAbbr}</text> : null
            }
            {
                minPositionPixl && maxPositionPixl ? <text
                    fontSize={5}
                    fontFamily={'Consolas'}
                    transform={`translate(${maxPositionPixl[0] + 7}, ${minPositionPixl[1] + 2}) rotate(-90)`}
                    textAnchor="end"
                >{(minPositionProj[1] - maxPositionProj[1]).toFixed(2)} {converter.projUnitAbbr}</text> : null
            }
        </>
    );
}

export default CropComponent;