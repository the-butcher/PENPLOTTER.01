import { ILineXY } from "./ILineXY";

export interface ILinePath {
    id: string;
    penId: string;
    segments: ILineXY[]; // a list of lines that this group is composed from
    strokeWidth: number;
    stroke: string;
}