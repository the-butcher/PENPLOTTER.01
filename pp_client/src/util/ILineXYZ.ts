import { ICoordinateXYZ } from "./ICoordinateXYZ";

export interface ILineXYZ {
    id: string;
    penId: string;
    coordA: ICoordinateXYZ;
    coordB: ICoordinateXYZ;
    length: number; // length of this line (convenience, code must take care of this being up to date after any change to coordinates)
    speedB: number; // pen-plotter exit speed from this line (mm/s)
}