import { useEffect, useState } from "react";
import { IContentProps, TContentBackground } from "./IContentProps";

const COLORS_INCOMPLETE: { [K in TContentBackground]: string } = {
    dark: 'rgb(255, 217, 0)',
    light: 'rgba(221, 8, 8, 0.9)'
};
const COLORS_COMPLETE: { [K in TContentBackground]: string } = {
    dark: 'rgba(255, 255, 255, 0.9)',
    light: 'rgba(83, 83, 83, 0.9)'
};

/**
 * this component renders a single svg path for either an IContour or an IHachure
 *
 * @param props
 * @returns
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
function ContentComponent(props: IContentProps) {

    const { svgData, strokeWidth, complete, closed, background } = { ...props };

    const [data, setData] = useState<string>('');

    useEffect(() => {
        console.debug('✨ building ContentComponent');
    }, []);

    useEffect(() => {
        // console.debug('⚙ updating ContentComponent (content)', content);
        if (svgData) {
            setData(svgData);
        }
    }, [svgData]);

    return (
        <path
            style={{
                stroke: closed ? 'blue' : complete ? COLORS_COMPLETE[background] : COLORS_INCOMPLETE[background],
                strokeWidth: complete ? strokeWidth : strokeWidth,
                fill: 'none',
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
            }}
            d={data}
        />
    );
}

export default ContentComponent;