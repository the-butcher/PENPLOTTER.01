
import SettingsBluetoothIcon from '@mui/icons-material/SettingsBluetooth';
import { Button } from '@mui/material';
import { useEffect } from 'react';
import { IConnBleProperties } from '../util/Interfaces';

export const COMMAND_SERVICE___UUID = "791320d5-7f0a-4b58-89f6-cc2031479da5";

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
                    services: [COMMAND_SERVICE___UUID],
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