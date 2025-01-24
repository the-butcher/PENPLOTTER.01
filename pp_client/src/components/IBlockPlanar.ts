import { ICoordPlanar } from "./ICoordPlanar";

export interface IBlockPlanar extends ICoordPlanar {
    x0: number;
    y0: number;
    z0: number;
    l: number;
    vi: number; // entry speed (mm/s)
    vo: number; // exit speed (mm/s)
    bb: boolean;
}