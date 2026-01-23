import { ICoordinateXYZR } from "./ICoordinateXYZR";
import { IExtentXY } from "./IExtentXY";
import { ILinePath } from "./ILinePath";

export interface IRootSvgProps {
    lines: ILinePath[]; // each linegroup is a non-interrupted 'path', aka connected lines
    position: ICoordinateXYZR;
    extent: IExtentXY;
    selId: string;
    handleLineClick: (id: string) => void;
}