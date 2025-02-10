
import { Slider, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { BlockUtil } from '../util/BlockUtil';
import { GeometryUtil } from '../util/GeometryUtil';
import { IBlockPlanar, IConnBleProperties, ISendBleProperties } from '../util/Interfaces';
import { UNO_R4_SERVICE_UUID } from './PickDeviceComponent';


export const CHARACTERISTIC_BUFF_SIZE = '067c3c93-eb63-4905-b292-478642f8ae99';
export const CHARACTERISTIC_BUFF_VALS = 'd3116fb9-adc1-4fc4-9cb4-ceb48925fa1b';

function BluetoothSenderComponent(props: IConnBleProperties & ISendBleProperties) {

    const { lines, device, handleConnBleProperties } = props;

    // const [connectionState, setConnectionState] = useState<IConnBleProperties>({
    //     success: true,
    //     message: 'initial'
    // });
    const [gatt, setGatt] = useState<BluetoothRemoteGATTServer>();

    const [buffSizeCharacteristic, setBuffSizeCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
    const [buffValsCharacteristic, setBuffValsCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();

    const [buffSize, setBuffSize] = useState<number>(-1);
    const [buffCoords, setBuffCoords] = useState<IBlockPlanar[]>([]);
    const [buffCoordsTotal, setBuffCoordsTotal] = useState<number>(-1);

    const blockSendPendingRef = useRef<boolean>(false);
    const writeAndReadTo = useRef<number>(-1);

    useEffect(() => {
        console.debug('✨ building BluetoothSenderComponent');
    }, []);

    useEffect(() => {

        console.debug('⚙ updating BluetoothSenderComponent (lines)', lines);

        if (lines.length > 0) {

            const _buffCords: IBlockPlanar[] = [];

            let vi = 0;
            let vo = 0;
            for (let i = 0; i < lines.length; i++) {
                vo = lines[i].speedB;
                _buffCords.push({
                    x: lines[i].coordB.x,
                    y: lines[i].coordB.y,
                    z: lines[i].coordB.z,
                    vi,
                    vo
                });
                vi = vo;
            }

            setBuffCoords(_buffCords);
            setBuffCoordsTotal(_buffCords.length);
        }

    }, [lines]);


    useEffect(() => {

        console.debug('⚙ updating BluetoothSenderComponent (device)', device);
        device?.gatt?.connect().then(gatt => {
            setGatt(gatt);
            device.ongattserverdisconnected = () => {
                setBuffSizeCharacteristic(undefined);
                setBuffValsCharacteristic(undefined);
                handleConnBleProperties({
                    // device implicitly undefined
                    message: 'disconnected'
                });
            }
        }).catch((e: unknown) => {
            handleConnBleProperties({
                // device implicitly undefined
                message: 'failed to connect to gatt server',
            });
            console.error(e);
        });

    }, [device]);


    useEffect(() => {

        console.debug('⚙ updating BluetoothSenderComponent (gatt)', gatt);
        gatt?.getPrimaryService(UNO_R4_SERVICE_UUID).then(service => {

            console.debug('got service, fetching capabilities now ...', service);
            service.getCharacteristics().then(charateristics => {

                console.debug('got charateristics', charateristics);

                const cmdSizeCharacteristic = charateristics.filter(charateristic => charateristic.uuid === CHARACTERISTIC_BUFF_SIZE)[0];
                setBuffSizeCharacteristic(cmdSizeCharacteristic);

                const cmdDestCharacteristic = charateristics.filter(charateristic => charateristic.uuid === CHARACTERISTIC_BUFF_VALS)[0];
                setBuffValsCharacteristic(cmdDestCharacteristic);

                handleConnBleProperties({
                    // device implicitly undefined
                    device,
                    message: 'failed to connect to gatt server',
                });

            }).catch((e: unknown) => {
                handleConnBleProperties({
                    // device implicitly undefined
                    message: 'failed to retrieve charateristics',
                });
                console.error(e);
            });

        }).catch((e: unknown) => {
            handleConnBleProperties({
                // device implicitly undefined
                message: 'failed to retrieve primary service',
            });
            console.error(e);
        });

    }, [gatt]);

    const readBuffSize = () => {

        if (buffSizeCharacteristic) {

            buffSizeCharacteristic?.readValue().then(value => {

                const _buffSize = value.getUint32(0, true);
                // console.log('_buffSize', _buffSize);
                setBuffSize(_buffSize);

                // skip and read the buffer size again as soon as possible
                window.clearTimeout(writeAndReadTo.current);
                writeAndReadTo.current = window.setTimeout(() => {
                    readBuffSize();
                }, 250);

            }).catch((e: unknown) => {
                handleConnBleProperties({
                    // device implicitly undefined
                    message: 'failed to retrieve buffer size',
                });
                console.error(e);
            });

        }

    }

    useEffect(() => {

        console.debug('⚙ updating BluetoothSenderComponent (buffSize)', buffSize);

        // if there is enough space to send a new set of coordinates, if there was at least one skip (debounce), if there are more values to be sent
        // if (buffSize > CoordUtil.BUFF_LN * 2 && buffSkipRef.current > 0 && blockCoordsSpliceRef.current.length === 0 && buffCoords.length > 0) {
        if (buffCoords.length > 0 && buffSize > GeometryUtil.BT___BUFF_BLK * 4 && !blockSendPendingRef.current) { // if there is more blocks that can be sent and we are not waiting for other blocks to be sent

            blockSendPendingRef.current = true;

            const _blockCoordsSplice = buffCoords.splice(0, GeometryUtil.BT___BUFF_BLK);
            // fill to CoordUtil.BUFF_LN entries in case the splice command provided less than CoordUtil.BUFF_LN (happens at the end of file)
            while (_blockCoordsSplice.length < GeometryUtil.BT___BUFF_BLK) {
                _blockCoordsSplice.push({
                    x: 0,
                    y: 0,
                    z: 0,
                    vi: 0,
                    vo: 0
                });
            };
            // blockCoordsSpliceRef.current = _blockCoordsSplice;

            if (buffValsCharacteristic) {

                // console.log('buffValsRef.current', blockCoordsSpliceRef.current);
                const blockBytes = BlockUtil.createBlockBytes(_blockCoordsSplice);

                // console.log('before sending blockBytes, ...');
                buffValsCharacteristic?.writeValue(blockBytes).then(() => {

                    // console.log('..., done sending blockBytes');
                    blockSendPendingRef.current = false;
                    // blockCoordsSpliceRef.current = [];
                    // buffSkipRef.current = 0;

                }).catch((e: unknown) => {
                    handleConnBleProperties({
                        // device implicitly undefined
                        message: 'failed to write commands',
                    });
                    console.error(e);
                });

            }

        } else {
            // buffSkipRef.current++;
            // console.log("sending condition not fulfilled", buffCoords.length, buffSize, blockSendPendingRef.current)
        }

    }, [buffSize, buffCoords]);

    useEffect(() => {

        console.debug('⚙ updating BluetoothSenderComponent (characteristics)', buffSizeCharacteristic, buffValsCharacteristic);

        if (buffSizeCharacteristic && buffValsCharacteristic) {

            window.clearTimeout(writeAndReadTo.current);
            writeAndReadTo.current = window.setTimeout(() => {
                readBuffSize();
            }, 10);

        }

    }, [buffSizeCharacteristic, buffValsCharacteristic]);

    return (
        // <div style={{ display: 'flex', flexDirection: 'row', flexGrow: '4' }}>
        <Stack>
            <Typography variant='caption'>{GeometryUtil.BT___BUFF_MAX - buffSize}/{GeometryUtil.BT___BUFF_MAX}</Typography>
            <Slider
                size='small'
                // disabled={buffSize < 0}
                value={GeometryUtil.BT___BUFF_MAX - buffSize}
                aria-labelledby="input-slider"
                max={GeometryUtil.BT___BUFF_MAX}
                min={0}
                marks={
                    [
                        {
                            value: GeometryUtil.BT___BUFF_MAX - GeometryUtil.BT___BUFF_BLK * 4,
                            label: `${GeometryUtil.BT___BUFF_BLK * 4}`
                        }
                    ]
                }
            />
            <Typography variant='caption'>{buffCoords.length}/{buffCoordsTotal}</Typography>
            <Slider
                size='small'
                // disabled={buffCoordsTotal < 0}
                value={buffCoords.length}
                aria-labelledby="input-slider"
                max={buffCoordsTotal}
                min={0}
            />
        </Stack>


    );
}

export default BluetoothSenderComponent;