import { useEffect, useState } from "react";
import { IContentProps } from "./IContentProps";

function ContentComponent(props: IContentProps) {

    const { svgData, strokeWidth, complete } = { ...props };

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
                stroke: complete ? `rgba(100, 100, 100, 0.75)` : `rgba(255, 100, 100, 0.75)`,
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