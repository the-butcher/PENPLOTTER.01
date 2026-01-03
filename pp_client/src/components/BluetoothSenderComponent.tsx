
import AdjustIcon from '@mui/icons-material/Adjust';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DrawIcon from '@mui/icons-material/Draw';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, Grid, IconButton, MenuItem, Select, Slider, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { BlockUtil } from '../util/BlockUtil';
import { GeometryUtil } from '../util/GeometryUtil';
import { IBlockPlanar, IConnBleProperties, ISendBleProperties } from '../util/Interfaces';
import { UNO_R4_SERVICE_UUID } from './PickDeviceComponent';

export const CHARACTERISTIC_BUFF_SIZE = '067c3c93-eb63-4905-b292-478642f8ae99';
export const CHARACTERISTIC_BUFF_VALS = 'd3116fb9-adc1-4fc4-9cb4-ceb48925fa1b';
export const CHARACTERISTIC__POSITION = "b7e24055-35c2-418e-be2e-b690a11cf3fa";

export type GATT_OPERATION_TYPE = 'buffsize' | 'position' | 'blockbytes' | 'none';

function BluetoothSenderComponent(props: IConnBleProperties & ISendBleProperties) {

    const { lines, penId, device, handleConnBleProperties, handlePenDone, handlePositionExternal } = props;

    const [gatt, setGatt] = useState<BluetoothRemoteGATTServer>();

    const [buffSizeCharacteristic, setBuffSizeCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
    const [buffValsCharacteristic, setBuffValsCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
    const [positionCharacteristic, setPositionCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();

    const [buffSize, setBuffSize] = useState<number>(GeometryUtil.BT___BUFF_MAX);
    const [position, setPosition] = useState<IBlockPlanar>();

    // temporary storage for blocks
    const [buffCoordCache, setBuffCoordCache] = useState<IBlockPlanar[]>([]);

    // actual feed for blocks
    const [buffCoordQueue, setBuffCoordQueue] = useState<IBlockPlanar[]>([]);
    const [buffCoordTotal, setBuffCoordTotal] = useState<number>(0);

    const blockBytesRef = useRef<Uint8Array<ArrayBufferLike>>();

    const handlePositionInternalRef = useRef<(position: IBlockPlanar) => void>();

    const timeoutMillis = 50;

    const penDistances: number[] = [
        0.1,
        1,
        2
    ];
    const [penDistance, setPenDistance] = useState<number>(penDistances[0]);

    const gattOperationPendingRef = useRef<GATT_OPERATION_TYPE>('none');
    const readBuffSizeTo = useRef<number>(-1);
    const readPositionTo = useRef<number>(-1);
    const writeBlockBytesTo = useRef<number>(-1);

    const abortPen = () => {
        setBuffCoordQueue([]);
        setBuffCoordTotal(0);
        setBuffSize(GeometryUtil.BT___BUFF_MAX);
        handlePenDone();
    }

    // const movePenDistance = 0.1;

    const ADJUST_PEN_SPEED = 5;

    const movePenTo = (movePosition: IBlockPlanar) => {

        console.log('moving pen to', movePosition)
        const _buffCoords: IBlockPlanar[] = [];
        for (let i = 0; i < GeometryUtil.BT___BUFF_BLK; i++) {
            _buffCoords.push({
                ...movePosition,
                vi: movePosition.vi > 0 ? Math.min(movePosition.vi, 20) : 1,
                vo: movePosition.vo > 0 ? Math.min(movePosition.vo, 20) : 1
            });
        }
        // console.log('moving pen to', _buffCoords)
        setBuffCoordQueue(_buffCoords);

    }

    const flushCacheToQueue = () => {

        setBuffCoordQueue([...buffCoordCache]);

    }

    const resetAtPosition = () => {

        const resetPosition: IBlockPlanar = {
            x: 0,
            y: 0,
            z: GeometryUtil.Z_VALUE_RESET,
            vi: 0,
            vo: 0
        };

        const _buffCoords: IBlockPlanar[] = [resetPosition];
        for (let i = 1; i < GeometryUtil.BT___BUFF_BLK; i++) {
            _buffCoords.push({
                x: 0,
                y: 0,
                z: GeometryUtil.Z_VALUE_PEN_U,
                vi: 5,
                vo: 5
            });
        }
        setBuffCoordQueue(_buffCoords);

    }

    const movePenHome = () => {

        console.debug(`📞 moving pen home`);

        handlePositionInternalRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    x: 0,
                    y: 0,
                    z: 0,
                    vi: ADJUST_PEN_SPEED,
                    vo: ADJUST_PEN_SPEED
                });
            }
        };
        readPosition();

    }

    const movePenYUp = () => {

        console.debug(`📞 moving pen y up by`, penDistance);

        handlePositionInternalRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    y: _position.y - penDistance,
                    vi: ADJUST_PEN_SPEED,
                    vo: ADJUST_PEN_SPEED
                });
            }
        };
        readPosition();

    }

    const movePenYDown = () => {

        console.debug(`📞 moving pen y down by`, penDistance);

        handlePositionInternalRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    y: _position.y + penDistance,
                    vi: ADJUST_PEN_SPEED,
                    vo: ADJUST_PEN_SPEED
                });
            }
        };
        readPosition();

    }

    const movePenXLeft = () => {

        console.debug(`📞 moving pen x left by`, penDistance);

        handlePositionInternalRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    x: _position.x - penDistance,
                    vi: ADJUST_PEN_SPEED,
                    vo: ADJUST_PEN_SPEED
                });
            }
        };
        readPosition();

    }

    const movePenXRight = () => {

        console.log(`📞 moving pen x right by`, penDistance);

        handlePositionInternalRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    x: _position.x + penDistance,
                    vi: ADJUST_PEN_SPEED,
                    vo: ADJUST_PEN_SPEED
                });
            }
        };
        readPosition();

    }

    const movePenZUp = () => {

        console.debug(`📞 moving pen z up by`, penDistance);

        handlePositionInternalRef.current = (_position: IBlockPlanar) => {
            if (_position) {
                movePenTo({
                    ..._position,
                    z: Math.min(GeometryUtil.Z_VALUE_PEN_U, _position.z + penDistance),
                    vi: ADJUST_PEN_SPEED,
                    vo: ADJUST_PEN_SPEED
                });
            }
        };
        readPosition();

    }

    const movePenZDown = () => {

        console.debug(`📞 moving pen z down (1) by`, penDistance, 'from', position);

        handlePositionInternalRef.current = (_position: IBlockPlanar) => {
            console.debug(`📞 moving pen z down (2) by`, penDistance, 'from', _position);
            if (_position) {
                console.debug(`📞 moving pen z down (3) by`, penDistance, 'from', _position);
                movePenTo({
                    ..._position,
                    z: Math.max(GeometryUtil.Z_VALUE_PEN_D, _position.z - penDistance),
                    vi: ADJUST_PEN_SPEED,
                    vo: ADJUST_PEN_SPEED
                })
            }
        };
        readPosition();

    }

    useEffect(() => {
        console.log('✨ building BluetoothSenderComponent');


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

            console.log('_buffCords', _buffCords);

            setBuffCoordCache(_buffCords);
            setBuffCoordTotal(_buffCords.length);
        }

    }, [lines]);


    useEffect(() => {

        console.log('⚙ updating BluetoothSenderComponent (device)', device);
        device?.gatt?.connect().then(gatt => {
            setGatt(gatt);
            device.ongattserverdisconnected = () => {
                setBuffSizeCharacteristic(undefined);
                setBuffValsCharacteristic(undefined);
                setPositionCharacteristic(undefined);
                window.clearTimeout(readBuffSizeTo.current);
                window.clearTimeout(readPositionTo.current);
                handleConnBleProperties({
                    // device implicitly undefined
                    message: 'disconnected'
                });
            }
        }).catch((e: unknown) => {
            window.clearTimeout(readBuffSizeTo.current);
            window.clearTimeout(readPositionTo.current);
            handleConnBleProperties({
                // device implicitly undefined
                message: 'failed to connect to gatt server',
            });
            console.error(e);
        });

    }, [device]);


    useEffect(() => {

        console.log('⚙ updating BluetoothSenderComponent (gatt)', gatt);
        gatt?.getPrimaryService(UNO_R4_SERVICE_UUID).then(service => {

            // service.oncharacteristicvaluechanged = () => {
            //     console.log('ch changed');
            // }

            console.log('got service, fetching capabilities now ...', service);
            service.getCharacteristics().then(charateristics => {

                console.log('got charateristics', charateristics);

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
                window.clearTimeout(readPositionTo.current);
                handleConnBleProperties({
                    // device implicitly undefined
                    message: 'failed to retrieve charateristics',
                });
                console.error(e);
            });

        }).catch((e: unknown) => {
            window.clearTimeout(readBuffSizeTo.current);
            window.clearTimeout(readPositionTo.current);
            handleConnBleProperties({
                // device implicitly undefined
                message: 'failed to retrieve primary service',
            });
            console.error(e);
        });

    }, [gatt]);

    const readPosition = () => {

        if (positionCharacteristic) {

            if (gattOperationPendingRef.current === 'none') {

                gattOperationPendingRef.current = 'position';
                positionCharacteristic.readValue().then(data => {
                    gattOperationPendingRef.current = 'none';
                    const position = BlockUtil.parseBlockBytes(data);
                    console.log('got new position', position);
                    setPosition(position);
                }).catch((e: unknown) => {
                    window.clearTimeout(readPositionTo.current);
                    handleConnBleProperties({
                        // device implicitly undefined
                        message: 'failed to retrieve position',
                    });
                    console.error(e);
                });


            }

            // skip and read the buffer size again after a while
            window.clearTimeout(readPositionTo.current);
            readPositionTo.current = window.setTimeout(() => {
                readPosition();
            }, 250);

            // else {

            //     window.clearTimeout(readPositionTo.current);
            //     readPositionTo.current = window.setTimeout(() => {
            //         readPosition();
            //     }, 500);

            // }

        }
        //  else {
        //     throw (new Error("failed to read position due to undefined positionCharacteristic"));
        // }

    }

    const readBuffSize = () => {

        if (buffSizeCharacteristic) {

            if (gattOperationPendingRef.current === 'none') {

                gattOperationPendingRef.current = 'buffsize';
                buffSizeCharacteristic.readValue().then(value => {
                    gattOperationPendingRef.current = 'none';

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

            // skip and read the buffer size again after a while
            window.clearTimeout(readBuffSizeTo.current);
            readBuffSizeTo.current = window.setTimeout(() => {
                readBuffSize();
            }, 200);

        }

    }

    const writeBlockBytes = () => {

        if (buffValsCharacteristic) {

            if (gattOperationPendingRef.current === 'none') {

                console.log('writing block bytes');

                gattOperationPendingRef.current = 'blockbytes';
                buffValsCharacteristic!.writeValue(blockBytesRef.current!).then(() => { // Buffer.from(blockBytesRef.current!) >> test
                    gattOperationPendingRef.current = 'none';
                    blockBytesRef.current = undefined;
                }).catch((e: unknown) => {
                    window.clearTimeout(readBuffSizeTo.current);
                    handleConnBleProperties({
                        // device implicitly undefined
                        message: 'failed to write block bytes',
                    });
                    console.error(e);
                });

            } else {

                console.log('delay writing block bytes', gattOperationPendingRef.current);

                window.clearTimeout(writeBlockBytesTo.current);
                writeBlockBytesTo.current = window.setTimeout(() => {
                    writeBlockBytes();
                }, timeoutMillis);

            }

        } else {
            throw (new Error("failed to write block bytes due to undefined buffValsCharacteristic"));
        }

    }

    useEffect(() => {

        console.log('⚙ updating BluetoothSenderComponent (position)', position);

        if (position) {
            if (handlePositionInternalRef.current) {
                handlePositionInternalRef.current(position);
                handlePositionInternalRef.current = undefined;
            }
            handlePositionExternal(position);
            setPosition(undefined);
        }


    }, [position]);

    useEffect(() => {

        console.log('⚙ updating BluetoothSenderComponent (buffSize)', buffSize);

        if (!blockBytesRef.current && buffCoordQueue.length > 0 && buffSize > GeometryUtil.BT___BUFF_BLK * 4) {

            blockBytesRef.current = new Uint8Array(); // assign,something right awys, so another buff size read does not get the opportunity to rewrite

            const _blockCoordsSplice = buffCoordQueue.splice(0, GeometryUtil.BT___BUFF_BLK);
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

            // console.log('_blockCoordsSplice', _blockCoordsSplice);

            blockBytesRef.current = BlockUtil.createBlockBytes(_blockCoordsSplice);
            writeBlockBytes();

        } else if (buffCoordQueue.length === 0 && buffSize === GeometryUtil.BT___BUFF_MAX) {
            handlePenDone();
        }

    }, [buffSize, buffCoordQueue]);

    useEffect(() => {

        console.log('⚙ updating BluetoothSenderComponent (characteristics)', buffSizeCharacteristic, buffValsCharacteristic, positionCharacteristic);

        if (buffSizeCharacteristic && buffValsCharacteristic && positionCharacteristic) {

            window.clearTimeout(readBuffSizeTo.current);
            readBuffSizeTo.current = window.setTimeout(() => {
                readBuffSize();
            }, 10);
            window.clearTimeout(readPositionTo.current);
            readPositionTo.current = window.setTimeout(() => {
                readPosition();
            }, 100);

        }

    }, [buffSizeCharacteristic, buffValsCharacteristic, positionCharacteristic]);

    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (

        <>

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
                    <Button
                        disabled={buffCoordCache.length === 0 || buffCoordQueue.length > 0}
                        variant="contained"
                        onClick={() => handleClickOpen()}
                        startIcon={<DrawIcon />}
                        sx={{
                            width: 'calc(100% - 11px)',
                            margin: '0px 0px 10px 1px'
                        }}
                    >
                        flush pen
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
                    <Typography variant='caption'>{buffCoordQueue.length}/{buffCoordTotal}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Slider
                        size='small'
                        disabled={buffCoordQueue.length === 0}
                        value={buffCoordQueue.length}
                        aria-labelledby="input-slider"
                        max={buffCoordTotal}
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

            </Grid >
            <Grid item xs={12}>
                <Button
                    disabled={buffCoordQueue.length === 0}
                    variant="contained"
                    onClick={() => abortPen()}
                    sx={{
                        width: 'calc(100% - 11px)',
                        margin: '10px 0px 10px 1px'
                    }}
                >
                    abort pen
                </Button>
            </Grid>

            <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>
                    {`flush to device?`}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {`there are ${buffCoordTotal} blocks from pen ${penId} ready to be flushed. by clicking 'yes' these blocks will be transferred to the device.`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>no</Button>
                    <Button onClick={() => {
                        handleClose();
                        flushCacheToQueue();
                    }} autoFocus>
                        yes
                    </Button>
                </DialogActions>
            </Dialog>

        </>

    );
}

export default BluetoothSenderComponent;