export interface IConnBleProps {
    device?: BluetoothDevice;
    success: boolean;
    message: string;
    handleConnBleProperties: (connBleProperties: Pick<IConnBleProps, 'device' | 'message'>) => void;
}