
import { Grid, Slider, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { CoordUtil } from '../util/CoordUtil';
import { CoordPlanarUtil } from './CoordPlanarUtil';
import { IBuffValsProps } from './IBuffValsProps';
import { IBlockPlanar } from './ICoordPlanar';
import { UNO_R4_SERVICE_UUID } from './PickerComponent';

export const CHARACTERISTIC_BUFF_SIZE = '067c3c93-eb63-4905-b292-478642f8ae99';
export const CHARACTERISTIC_BUFF_VALS = 'd3116fb9-adc1-4fc4-9cb4-ceb48925fa1b';

function BuffCoordsComponent(props: IBuffValsProps) {

    const { monoCoords, device, handleDeviceRemove } = props;

    const [connectionState, setConnectionState] = useState<string>('connecting');
    const [gatt, setGatt] = useState<BluetoothRemoteGATTServer>();

    const [buffSizeCharacteristic, setBuffSizeCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
    const [buffValsCharacteristic, setBuffValsCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();

    const [buffSize, setBuffSize] = useState<number>(0);
    const [buffCoords, setBuffCoords] = useState<IBlockPlanar[]>([]);
    const [buffCoordsTotal, setBuffCoordsTotal] = useState<number>(0);

    const blockCoordsSpliceRef = useRef<IBlockPlanar[]>([]);
    const buffSkipRef = useRef<number>(0);

    const writeAndReadTo = useRef<number>(-1);

    useEffect(() => {
        console.debug('✨ building CmdDestComponent');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {

        console.debug('⚙ updating CmdDestComponent (monoCoords)', monoCoords);

        if (monoCoords.length > 0) {
            setBuffCoords([...monoCoords]);
            setBuffCoordsTotal(monoCoords.length);
        }

    }, [monoCoords]);

    useEffect(() => {
        console.debug('⚙ updating CmdDestComponent (device)', device);
        device.gatt?.connect().then(gatt => {
            setGatt(gatt);
        }).catch((e: any) => {
            setConnectionState('failed connecting to gatt server');
            console.error(e);
        });
    }, [device]);

    useEffect(() => {
        console.debug('⚙ updating CmdDestComponent (connectionState)', connectionState);
    }, [connectionState]);

    useEffect(() => {

        console.debug('⚙ updating CmdDestComponent (gatt)', gatt);
        gatt?.getPrimaryService(UNO_R4_SERVICE_UUID).then(service => {

            console.debug('service', service);
            service.getCharacteristics().then(charateristics => {

                console.debug('charateristics', charateristics);

                const cmdSizeCharacteristic = charateristics.filter(charateristic => charateristic.uuid === CHARACTERISTIC_BUFF_SIZE)[0];
                setBuffSizeCharacteristic(cmdSizeCharacteristic);

                const cmdDestCharacteristic = charateristics.filter(charateristic => charateristic.uuid === CHARACTERISTIC_BUFF_VALS)[0];
                setBuffValsCharacteristic(cmdDestCharacteristic);

                setConnectionState('connected');

            }).catch((e: any) => {
                setConnectionState('failed retrieving charateristics');
                console.error(e);
            });

        }).catch((e: any) => {
            setConnectionState('failed retrieving primary service');
            console.error(e);
        });

    }, [gatt]);

    const readBuffSize = () => {

        if (buffSizeCharacteristic) {

            buffSizeCharacteristic?.readValue().then(value => {

                const _buffSize = value.getUint32(0, true);
                console.log('_buffSize', _buffSize);
                setBuffSize(_buffSize);

                // skip and read the buffer size again as soon as possible
                window.clearTimeout(writeAndReadTo.current);
                writeAndReadTo.current = window.setTimeout(() => {
                    readBuffSize();
                }, 1);

            }).catch((e: any) => {
                setConnectionState('failed retrieving buffer size');
                console.error(e);
            });

        }

    }

    useEffect(() => {

        console.debug('⚙ updating CmdDestComponent (buffSize)', buffSize);

        // if there is enough space to send a new set of coordinates, if there was at least one skip (debounce), if there are more values to be sent
        if (buffSize > CoordUtil.BUFF_LN * 2 && buffSkipRef.current > 0 && blockCoordsSpliceRef.current.length === 0 && buffCoords.length > 0) {

            const _blockCoordsSplice = buffCoords.splice(0, CoordUtil.BUFF_LN);
            // fill to 16 entries in case the splice command provided less than 16 (happens at the end of file)
            while (_blockCoordsSplice.length < 16) {
                _blockCoordsSplice.push({
                    x0: 0,
                    y0: 0,
                    z0: 0,
                    x1: 0,
                    y1: 0,
                    z1: 0,
                    l: 0,
                    vi: 0,
                    vo: 0,
                    bb: false
                });
            };
            blockCoordsSpliceRef.current = _blockCoordsSplice;

            if (buffValsCharacteristic) {

                console.log('buffValsRef.current', blockCoordsSpliceRef.current);
                const cmdDestBytes = CoordPlanarUtil.createBuffValsBytes(blockCoordsSpliceRef.current);
                buffValsCharacteristic?.writeValue(cmdDestBytes).then(() => {

                    // console.log('done sending buff vals');
                    blockCoordsSpliceRef.current = [];
                    buffSkipRef.current = 0;

                }).catch((e: any) => {
                    setConnectionState('failed writing commands');
                    console.error(e);
                });

            }

        } else {
            buffSkipRef.current++;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buffSize]);

    useEffect(() => {

        console.debug('⚙ updating CmdDestComponent (characteristics)', buffSizeCharacteristic, buffValsCharacteristic);

        if (buffSizeCharacteristic && buffValsCharacteristic) {

            window.clearTimeout(writeAndReadTo.current);
            writeAndReadTo.current = window.setTimeout(() => {
                readBuffSize();
            }, 10);

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [buffSizeCharacteristic, buffValsCharacteristic]);

    return (
        // <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '4' }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid item xs={11}>
                <Slider
                    value={buffSize}
                    aria-labelledby="input-slider"
                    max={512}
                    min={0}
                    marks={
                        [
                            {
                                value: CoordUtil.BUFF_LN,
                                label: `${CoordUtil.BUFF_LN}`
                            },
                            {
                                value: CoordUtil.BUFF_LN * 2,
                                label: `${CoordUtil.BUFF_LN * 2}`
                            }
                        ]
                    }
                />
            </Grid>
            <Grid item xs={1}>
                <Typography >{buffSize}</Typography>
            </Grid>
            <Grid item xs={11}>
                <Slider
                    value={buffCoords.length}
                    aria-labelledby="input-slider"
                    max={buffCoordsTotal}
                    min={0}
                />
            </Grid>
            <Grid item xs={1}>
                <Typography >{buffCoords.length}</Typography>
            </Grid>
        </Grid>

    );
}

export default BuffCoordsComponent;