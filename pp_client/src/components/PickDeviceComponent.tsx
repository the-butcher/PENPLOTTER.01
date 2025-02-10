
import SettingsBluetoothIcon from '@mui/icons-material/SettingsBluetooth';
import { Button } from '@mui/material';
import { useEffect } from 'react';
import { IConnBleProperties } from '../util/Interfaces';

export const UNO_R4_SERVICE_UUID = '791320d5-7f0a-4b58-89f6-cc2031479da4'

function PickDeviceComponent(props: IConnBleProperties) {

    const { handleConnBleProperties } = props;

    useEffect(() => {
        console.debug('✨ building pick device component');
    }, []);

    const requestDevices = () => {

        const bluetooth: Bluetooth = navigator.bluetooth;

        bluetooth.requestDevice({
            acceptAllDevices: false,
            filters: [
                {
                    services: [UNO_R4_SERVICE_UUID],
                },
            ],
            optionalServices: [
                'device_information',
                'battery_service'
            ],
        }).then(device => {
            handleConnBleProperties({
                device,
                message: ''
            });
        }).catch((e: unknown) => {
            console.error(e);
        });

    };


    return (
        <Button
            sx={{
                width: 'inherit'
            }}
            variant="contained"
            startIcon={<SettingsBluetoothIcon />}
            onClick={requestDevices}>
            connect
        </Button>
    );
}

export default PickDeviceComponent;