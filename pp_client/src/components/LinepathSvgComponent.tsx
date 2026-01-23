import { useEffect, useState } from "react";
import LineSvgComponent from "./LineSvgComponent";
import { ILinePath } from "../util/ILinePath";

export interface ILinepathstyleProperties {
    selId: string;
    handleLineClick: (id: string) => void;
}

/**
 * a set of connected lines, in terms of the pen-plotter no pen-up or pen-down is needed to draw all lines
 * @param props
 * @returns
 */
function LinepathSvgComponent(props: ILinePath & ILinepathstyleProperties) {

    const { segments, strokeWidth, stroke, selId, handleLineClick } = { ...props };

    const [lineSvgComponents, setLineSvgComponents] = useState<JSX.Element[]>([]);

    useEffect(() => {

        console.debug('⚙ updating line path svg component (segments)', segments);
        setLineSvgComponents(segments.map(s => <LineSvgComponent key={s.id} {...s} strokeWidth={strokeWidth} stroke={stroke} selId={selId} handleLineClick={handleLineClick} />));

    }, [segments, selId]);

    return (
        <>
            {
                lineSvgComponents
            }
        </>
    )
}

export default LinepathSvgComponent
