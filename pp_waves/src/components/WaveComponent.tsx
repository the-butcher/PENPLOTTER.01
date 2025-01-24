
import { useEffect, useState } from 'react';

export interface IWaveProps {
    iY: number;
    nY: number;
    dY: number;
    dX: number;
    coordinates: ICoordinate[];
}

export interface ICoordinate {
    x: number;
    y: number;
    f: number;

}

function WaveComponent(props: IWaveProps) {

    const { iY, nY, dX, dY, coordinates } = props;

    const [d1, setD1] = useState<string>('');


    useEffect(() => {

        console.debug('✨ building WaveComponent');

        const pY = dY * (iY + 0.5) / nY;

        let _d = ``;

        let pX: number;
        let nX: number = 100;
        let command = 'M';
        for (let iX = 0; iX <= nX; iX++) {

            pX = dX * iX / nX;

            let oX = 0;
            let oY = 0;
            for (let k = 0; k < coordinates.length; k++) {
                const dCX = coordinates[k].x - pX;
                const dCY = coordinates[k].y - pY;
                const cDist = Math.sqrt(dCX * dCX + dCY * dCY);
                const fAttr = Math.exp(-cDist / 60) * coordinates[k].f;
                oX -= dCX * fAttr;
                oY -= dCY * fAttr;
            };

            _d += `${command}${pX + oX} ${pY + oY}`;
            command = 'L';

        }
        setD1(_d);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    return (
        <>
            <path
                style={{
                    stroke: 'black',
                    strokeWidth: 1,
                    fill: 'none'
                }}
                d={d1}
            />

        </>
    );
}

export default WaveComponent;