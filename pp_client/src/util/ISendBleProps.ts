import { ICoordinateXYZR } from "./ICoordinateXYZR";
import { ILineXYZ } from "./ILineXYZ";

export interface ISendBleProps {
    lines: ILineXYZ[];
    handlePenDone: () => void;
    handlePositionExternal: (position: ICoordinateXYZR) => void;
    penId: string;
    // device?: BluetoothDevice;
    // handleConnectionState: (state: IConnBleProperties) => void;
}