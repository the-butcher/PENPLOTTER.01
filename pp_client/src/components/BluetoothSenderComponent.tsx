
import AdjustIcon from '@mui/icons-material/Adjust';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Divider, FormControl, Grid, IconButton, MenuItem, Select, Slider, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { BlockUtil } from '../util/BlockUtil';
import { GeometryUtil } from '../util/GeometryUtil';
import { IBlockPlanar, IConnBleProperties, ISendBleProperties } from '../util/Interfaces';
import { UNO_R4_SERVICE_UUID } from './PickDeviceComponent';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export const CHARACTERISTIC_BUFF_SIZE = '067c3c93-eb63-4905-b292-478642f8ae99';
export const CHARACTERISTIC_BUFF_VALS = 'd3116fb9-adc1-4fc4-9cb4-ceb48925fa1b';
export const CHARACTERISTIC__POSITION = "b7e24055-35c2-418e-be2e-b690a11cf3fa";

function BluetoothSenderComponent(props: IConnBleProperties & ISendBleProperties) {

    const { lines, device, handleConnBleProperties, handlePenDone } = props;

    // const [connectionState, setConnectionState] = useState<IConnBleProperties>({
    //     success: true,
    //     message: 'initial'
    // });
    const [gatt, setGatt] = useState<BluetoothRemoteGATTServer>();

    const [buffSizeCharacteristic, setBuffSizeCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
    const [buffValsCharacteristic, setBuffValsCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
    const [positionCharacteristic, setPositionCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();

    const [buffSize, setBuffSize] = useState<number>(GeometryUtil.BT___BUFF_MAX);
    const [position, setPosition] = useState<IBlockPlanar>();

    const [buffCoords, setBuffCoords] = useState<IBlockPlanar[]>([]);
    const [buffCoordsTotal, setBuffCoordsTotal] = useState<number>(0);

    const positionCallbackRef = useRef<(position: IBlockPlanar) => void>();

    const penDistances: number[] = [
        0.1,
        1,
        2
    ];
    const [penDistance, setPenDistance] = useState<number>(penDistances[0]);

    const gattOperationPendingRef = useRef<boolean>(false);
    const readBuffSizeTo = useRef<number>(-1);
    const readPositionTo = useRef<number>(-1);

    const abortPen = () => {
        setBuffCoords([]);
        setBuffCoordsTotal(0);
        setBuffSize(GeometryUtil.BT___BUFF_MAX);
        handlePenDone();
    }

    // const movePenDistance = 0.1;

    const movePenTo = (movePosition: IBlockPlanar) => {

        console.log('moving pen to', movePosition)
        const _buffCoords: IBlockPlanar[] = [];
        for (let i = 0; i < GeometryUtil.BT___BUFF_BLK; i++) {
            _buffCoords.push({
                ...movePosition,
                vi: 5,
                vo: 5
            });
        }
        // console.log('moving pen to', _buffCoords)
        setBuffCoords(_buffCoords);

    }

    const resetAtPosition = () => {

        const resetPposition: IBlockPlanar = {
            x: 0,
            y: 0,
            z: GeometryUtil.Z_VALUE_RESET,
            vi: 0,
            vo: 0
        };

        const _buffCoords: IBlockPlanar[] = [resetPposition];
        for (let i = 1; i < GeometryUtil.BT___BUFF_BLK; i++) {
            _buffCoords.push({
                x: 0,
                y: 0,
                z: GeometryUtil.Z_VALUE_PEN_U,
                vi: 0,
                vo: 0
            });
        }
        setBuffCoords(_buffCoords);

    }

    const movePenHome = () => {

        console.debug(`📞 moving pen home`);

        positionCallbackRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    x: 0,
                    y: 0,
                    z: 0,
                });
            }
        };
        readPosition();

    }

    const movePenYUp = () => {

        console.debug(`📞 moving pen y up by`, penDistance);

        positionCallbackRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    y: _position.y - penDistance,
                });
            }
        };
        readPosition();

    }

    const movePenYDown = () => {

        console.debug(`📞 moving pen y down by`, penDistance);

        positionCallbackRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    y: _position.y + penDistance,
                });
            }
        };
        readPosition();

    }

    const movePenXLeft = () => {

        console.debug(`📞 moving pen x left by`, penDistance);

        positionCallbackRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    x: _position.x - penDistance,
                });
            }
        };
        readPosition();

    }

    const movePenXRight = () => {

        console.log(`📞 moving pen x right by`, penDistance);

        positionCallbackRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    x: _position.x + penDistance,
                });
            }
        };
        readPosition();

    }

    const movePenZUp = () => {

        console.debug(`📞 moving pen z up by`, penDistance);

        positionCallbackRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    z: Math.min(GeometryUtil.Z_VALUE_PEN_U, _position.z + penDistance),
                });
            }
        };
        readPosition();

    }

    const movePenZDown = () => {

        console.debug(`📞 moving pen z down (1) by`, penDistance, 'from', position);

        positionCallbackRef.current = (_position: IBlockPlanar) => {
            console.debug(`📞 moving pen z down (2) by`, penDistance, 'from', _position);
            if (_position) {
                console.debug(`📞 moving pen z down (3) by`, penDistance, 'from', _position);
                movePenTo({
                    ..._position,
                    z: Math.max(GeometryUtil.Z_VALUE_PEN_D, _position.z - penDistance),
                })
            }
        };
        readPosition();

    }

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
                setPositionCharacteristic(undefined);
                window.clearTimeout(readBuffSizeTo.current);
                handleConnBleProperties({
                    // device implicitly undefined
                    message: 'disconnected'
                });
            }
        }).catch((e: unknown) => {
            window.clearTimeout(readBuffSizeTo.current);
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

                const positionCharacteristic = charateristics.filter(charateristic => charateristic.uuid === CHARACTERISTIC__POSITION)[0];
                setPositionCharacteristic(positionCharacteristic);

                handleConnBleProperties({
                    // device implicitly undefined
                    device,
                    message: 'failed to connect to gatt server',
                });

            }).catch((e: unknown) => {
                window.clearTimeout(readBuffSizeTo.current);
                handleConnBleProperties({
                    // device implicitly undefined
                    message: 'failed to retrieve charateristics',
                });
                console.error(e);
            });

        }).catch((e: unknown) => {
            window.clearTimeout(readBuffSizeTo.current);
            handleConnBleProperties({
                // device implicitly undefined
                message: 'failed to retrieve primary service',
            });
            console.error(e);
        });

    }, [gatt]);

    const readPosition = () => {

        if (positionCharacteristic) {

            if (!gattOperationPendingRef.current) {

                gattOperationPendingRef.current = true;
                positionCharacteristic.readValue().then(data => {
                    gattOperationPendingRef.current = false;
                    const position = BlockUtil.parseBlockBytes(data);
                    console.log('got new position', position);
                    setPosition(position);
                })

            } else {

                window.clearTimeout(readPositionTo.current);
                readPositionTo.current = window.setTimeout(() => {
                    readPosition();
                }, 250);

            }

        } else {
            throw (new Error("failed to read position due to undefined positionCharacteristic"));
        }

    }

    const readBuffSize = () => {

        if (buffSizeCharacteristic) {

            if (!gattOperationPendingRef.current) {

                gattOperationPendingRef.current = true;

                buffSizeCharacteristic.readValue().then(value => {

                    gattOperationPendingRef.current = false;

                    const _buffSize = value.getUint32(0, true);
                    // console.log('_buffSize', _buffSize);
                    setBuffSize(_buffSize);

                }).catch((e: unknown) => {
                    window.clearTimeout(readBuffSizeTo.current);
                    handleConnBleProperties({
                        // device implicitly undefined
                        message: 'failed to retrieve buffer size',
                    });
                    console.error(e);
                });

            }

            // skip and read the buffer size again as soon as possible
            window.clearTimeout(readBuffSizeTo.current);
            readBuffSizeTo.current = window.setTimeout(() => {
                readBuffSize();
            }, 250);

        }

    }

    useEffect(() => {

        console.log('⚙ updating BluetoothSenderComponent (position)', position);

        if (position && positionCallbackRef.current) {
            positionCallbackRef.current(position);
            positionCallbackRef.current = undefined;
            setPosition(undefined);
        }


    }, [position]);

    useEffect(() => {

        console.log('⚙ updating BluetoothSenderComponent (buffSize)', buffSize);

        if (!gattOperationPendingRef.current && buffCoords.length > 0 && buffSize > GeometryUtil.BT___BUFF_BLK * 4) { // if there is more blocks that can be sent and we are not waiting for other blocks to be sent

            gattOperationPendingRef.current = true;

            const _blockCoordsSplice = buffCoords.splice(0, GeometryUtil.BT___BUFF_BLK);
            // fill to GeometryUtil.BT___BUFF_BLK entries in case the splice command provided less than GeometryUtil.BT___BUFF_BLK (happens at the end of file)
            while (_blockCoordsSplice.length < GeometryUtil.BT___BUFF_BLK) {
                _blockCoordsSplice.push({
                    x: 0,
                    y: 0,
                    z: 0,
                    vi: 0,
                    vo: 0
                });
            };

            if (buffValsCharacteristic) {

                // console.log('buffValsRef.current', blockCoordsSpliceRef.current);
                const blockBytes = BlockUtil.createBlockBytes(_blockCoordsSplice);

                // console.log('before sending blockBytes, ...');
                buffValsCharacteristic?.writeValue(blockBytes).then(() => {

                    gattOperationPendingRef.current = false;

                }).catch((e: unknown) => {
                    window.clearTimeout(readBuffSizeTo.current);
                    handleConnBleProperties({
                        // device implicitly undefined
                        message: 'failed to write commands',
                    });
                    console.error(e);
                });

            }

        } else if (buffCoords.length === 0 && buffSize === GeometryUtil.BT___BUFF_MAX) {
            handlePenDone();
            // buffSkipRef.current++;
            // console.log("sending condition not fulfilled", buffCoords.length, buffSize, blockSendPendingRef.current)
        }

    }, [buffSize, buffCoords]);

    useEffect(() => {

        console.debug('⚙ updating BluetoothSenderComponent (characteristics)', buffSizeCharacteristic, buffValsCharacteristic, positionCharacteristic);

        if (buffSizeCharacteristic && buffValsCharacteristic && positionCharacteristic) {

            window.clearTimeout(readBuffSizeTo.current);
            readBuffSizeTo.current = window.setTimeout(() => {
                readBuffSize();
            }, 10);

        }

    }, [buffSizeCharacteristic, buffValsCharacteristic, positionCharacteristic]);

    return (

        <Grid container spacing={2} sx={{ alignItems: 'top' }}>

            <Grid item xs={12}>
                <Divider
                    style={{
                        margin: '10px 0px 10px 0px',
                        padding: '10px 0px 10px 0px'
                    }}
                />
            </Grid>

            <Grid item xs={12}>
                <FormControl sx={{
                    width: 'calc(100% - 10px)',

                }} size="small"
                >
                    <Select
                        value={penDistance}
                        style={{
                            width: '100%',
                            height: '32px'
                        }}
                        onChange={(e) => setPenDistance(e.target.value as number)}
                    >
                        {
                            penDistances.map(_penDistance =>
                                <MenuItem key={`p${_penDistance * 100}`} value={_penDistance}>{`${_penDistance.toFixed(2)} mm`}</MenuItem>
                            )
                        }

                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
                <IconButton disabled={!positionCharacteristic} aria-label="y-axis up" onClick={() => movePenYUp()}>
                    <KeyboardArrowUpIcon />
                </IconButton>
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
                <IconButton disabled={!positionCharacteristic} aria-label="pen up" onClick={() => movePenZUp()}>
                    <ArrowUpwardIcon />
                </IconButton>
            </Grid>

            <Grid item xs={3}>
                <IconButton disabled={!positionCharacteristic} aria-label="x-axis left" onClick={() => movePenXLeft()}>
                    <KeyboardArrowLeftIcon />
                </IconButton>
            </Grid>
            <Grid item xs={3}>
                <IconButton disabled={!positionCharacteristic} aria-label="pen home" onClick={() => movePenHome()}>
                    <AdjustIcon />
                </IconButton>
            </Grid>
            <Grid item xs={3}>
                <IconButton disabled={!positionCharacteristic} aria-label="x-axis right" onClick={() => movePenXRight()}>
                    <KeyboardArrowRightIcon />
                </IconButton>
            </Grid>
            <Grid item xs={3}></Grid>

            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
                <IconButton disabled={!positionCharacteristic} aria-label="y-axis down" onClick={() => movePenYDown()}>
                    <KeyboardArrowDownIcon />
                </IconButton>
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}>
                <IconButton disabled={!positionCharacteristic} aria-label="pen down" onClick={() => movePenZDown()}>
                    <ArrowDownwardIcon />
                </IconButton>
            </Grid>
            <Grid item xs={12}>
                <Button
                    disabled={!positionCharacteristic}
                    variant={'contained'}
                    onClick={() => resetAtPosition()}
                    startIcon={<RestartAltIcon />}
                    sx={{
                        width: 'calc(100% - 11px)',
                        margin: '0px 0px 10px 1px'
                    }}
                >
                    reset here
                </Button>
            </Grid>
            <Grid item xs={12}>
                <Divider
                    style={{
                        margin: '0px 0px 10px 0px'
                    }}
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant='caption'>{GeometryUtil.BT___BUFF_MAX - buffSize}/{GeometryUtil.BT___BUFF_MAX}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Slider
                    size='small'
                    disabled={buffSize === GeometryUtil.BT___BUFF_MAX}
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
            </Grid>
            <Grid item xs={12}>
                <Typography variant='caption'>{buffCoords.length}/{buffCoordsTotal}</Typography>
            </Grid>
            <Grid item xs={12}>
                <Slider
                    size='small'
                    disabled={buffCoords.length === 0}
                    value={buffCoords.length}
                    aria-labelledby="input-slider"
                    max={buffCoordsTotal}
                    min={0}
                />
            </Grid>
            <Grid item xs={12}>
                <Divider
                    style={{
                        padding: '10px 0px 10px 0px'
                    }}
                />
            </Grid>
            <Grid item xs={12}>
                <Button
                    disabled={buffCoords.length === 0}
                    variant="contained"
                    onClick={() => abortPen()}
                    sx={{
                        width: '100%'
                        // marginTop: '10px'
                    }}
                >
                    abort pen
                </Button>
            </Grid>
        </Grid >



    );
}

export default BluetoothSenderComponent;