
import SettingsBluetoothIcon from '@mui/icons-material/SettingsBluetooth';
import { Button } from '@mui/material';
import { useEffect } from 'react';

export const UNO_R4_SERVICE_UUID = '791320d5-7f0a-4b58-89f6-cc2031479da4'

export interface IPickerProps {
    handleDevicePicked: (device: BluetoothDevice) => void;
}

function PickerComponent(props: IPickerProps) {

    const { handleDevicePicked } = props;

    useEffect(() => {
        console.debug('✨ building PickerComponent');
    }, []);

    const requestDevices = () => {

        const bluetooth: Bluetooth = navigator.bluetooth;

        console.debug('bluetooth', bluetooth);
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
            handleDevicePicked(device);
        }).catch((e: any) => {
            console.error(e);
        });

    };


    return (
        <Button size='small' variant="outlined" endIcon={<SettingsBluetoothIcon />} onClick={requestDevices}>
            connect to device
        </Button>
    );
}

export default PickerComponent;