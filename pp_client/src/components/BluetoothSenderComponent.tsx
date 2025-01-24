
import { Grid, Slider, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { CoordUtil } from '../util/CoordUtil';
import { BlockUtil } from '../util/BlockUtil';
import { UNO_R4_SERVICE_UUID } from './PickerComponent';
import { IBlockPlanar } from './IBlockPlanar';

export const CHARACTERISTIC_BUFF_SIZE = '067c3c93-eb63-4905-b292-478642f8ae99';
export const CHARACTERISTIC_BUFF_VALS = 'd3116fb9-adc1-4fc4-9cb4-ceb48925fa1b';

export interface IBluetoothSenderProps {
    monoCoords: IBlockPlanar[];
    device: BluetoothDevice;
    handleDeviceRemove: (device: BluetoothDevice) => void;
}

function BluetoothSenderComponent(props: IBluetoothSenderProps) {

    const { monoCoords, device } = props; /* handleDeviceRemove */

    const [connectionState, setConnectionState] = useState<string>('connecting');
    const [gatt, setGatt] = useState<BluetoothRemoteGATTServer>();

    const [buffSizeCharacteristic, setBuffSizeCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
    const [buffValsCharacteristic, setBuffValsCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();

    const [buffSize, setBuffSize] = useState<number>(-1);
    const [buffCoords, setBuffCoords] = useState<IBlockPlanar[]>([]);
    const [buffCoordsTotal, setBuffCoordsTotal] = useState<number>(-1);

    const blockSendPendingRef = useRef<boolean>(false);
    // const blockCoordsSpliceRef = useRef<IBlockPlanar[]>([]);
    // const buffSkipRef = useRef<number>(0);

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

            console.log('got service, fetching capabilities now ...', service);
            service.getCharacteristics().then(charateristics => {

                console.log('got charateristics', charateristics);

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
                }, 250);

            }).catch((e: any) => {
                setConnectionState('failed retrieving buffer size');
                console.error(e);
            });

        }

    }

    useEffect(() => {

        console.debug('⚙ updating CmdDestComponent (buffSize)', buffSize);

        // if there is enough space to send a new set of coordinates, if there was at least one skip (debounce), if there are more values to be sent
        // if (buffSize > CoordUtil.BUFF_LN * 2 && buffSkipRef.current > 0 && blockCoordsSpliceRef.current.length === 0 && buffCoords.length > 0) {
        if (buffCoords.length > 0 && buffSize > CoordUtil.BUFF_LN * 4 && !blockSendPendingRef.current) { // if there is more blocks that can be sent and we are not waiting for other blocks to be sent

            blockSendPendingRef.current = true;

            const _blockCoordsSplice = buffCoords.splice(0, CoordUtil.BUFF_LN);
            // fill to CoordUtil.BUFF_LN entries in case the splice command provided less than CoordUtil.BUFF_LN (happens at the end of file)
            while (_blockCoordsSplice.length < CoordUtil.BUFF_LN) {
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
            // blockCoordsSpliceRef.current = _blockCoordsSplice;

            if (buffValsCharacteristic) {

                // console.log('buffValsRef.current', blockCoordsSpliceRef.current);
                const blockBytes = BlockUtil.createBlockBytes(_blockCoordsSplice);

                console.log('before sending blockBytes, ...');
                buffValsCharacteristic?.writeValue(blockBytes).then(() => {

                    console.log('..., done sending blockBytes');
                    blockSendPendingRef.current = false;
                    // blockCoordsSpliceRef.current = [];
                    // buffSkipRef.current = 0;

                }).catch((e: any) => {
                    setConnectionState('failed writing commands');
                    console.error(e);
                });

            }

        } else {
            // buffSkipRef.current++;
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
                    disabled={buffSize < 0}
                    value={CoordUtil.BUFF_MAX - buffSize}
                    aria-labelledby="input-slider"
                    max={CoordUtil.BUFF_MAX}
                    min={0}
                    marks={
                        [
                            {
                                value: CoordUtil.BUFF_MAX - CoordUtil.BUFF_LN,
                                label: `${CoordUtil.BUFF_LN}`
                            },
                            {
                                value: CoordUtil.BUFF_MAX - CoordUtil.BUFF_LN * 2,
                                label: `${CoordUtil.BUFF_LN * 2}`
                            },
                            {
                                value: CoordUtil.BUFF_MAX - CoordUtil.BUFF_LN * 3,
                                label: `${CoordUtil.BUFF_LN * 3}`
                            },
                            {
                                value: CoordUtil.BUFF_MAX - CoordUtil.BUFF_LN * 4,
                                label: `${CoordUtil.BUFF_LN * 4}`
                            }
                        ]
                    }
                />
            </Grid>
            <Grid item xs={1}>
                <Typography >{CoordUtil.BUFF_MAX - buffSize}/{CoordUtil.BUFF_MAX}</Typography>
            </Grid>
            <Grid item xs={11}>
                <Slider
                    disabled={buffCoordsTotal < 0}
                    value={buffCoords.length}
                    aria-labelledby="input-slider"
                    max={buffCoordsTotal}
                    min={0}
                />
            </Grid>
            <Grid item xs={1}>
                <Typography >{buffCoords.length}/{buffCoordsTotal}</Typography>
            </Grid>
        </Grid>

    );
}

export default BluetoothSenderComponent;