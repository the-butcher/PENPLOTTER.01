import { IBlockPlanar } from "./ICoordPlanar";

export interface IBuffValsProps {
    monoCoords: IBlockPlanar[];
    device: BluetoothDevice;
    handleDeviceRemove: (device: BluetoothDevice) => void;
}