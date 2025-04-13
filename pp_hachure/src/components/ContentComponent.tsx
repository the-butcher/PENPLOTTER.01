import { useEffect, useState } from "react";

export interface IContentComponentProps {
    svgData: string;
    strokeWidth: number;
    complete: boolean;
}

function ContentComponent(props: IContentComponentProps) {

    const { svgData, strokeWidth, complete } = { ...props };

    const [data, setData] = useState<string>('');

    useEffect(() => {

        console.debug('✨ building ContentComponent');

    }, []);

    useEffect(() => {

        // console.log('⚙ updating ContentComponent (content)', content);

        if (svgData) {
            setData(svgData);
        }

    }, [svgData]);

    return (
        <path
            style={{
                stroke: complete ? `rgba(50, 50, 50, 0.75)` : `rgba(255, 50, 50, 0.75)`,
                strokeWidth: complete ? strokeWidth : strokeWidth * 2,
                fill: 'none',
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
            }}
            d={data}
        />
    );
}

export default ContentComponent;