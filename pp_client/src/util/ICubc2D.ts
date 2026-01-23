import { ICoordinateXY } from "./ICoordinateXY";
import { ILineXY } from "./ILineXY";

export interface ICubc2D extends ILineXY {
    coordC: ICoordinateXY;
    coordD: ICoordinateXY;
}
