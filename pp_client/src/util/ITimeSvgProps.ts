import { ILineXYZ } from "./ILineXYZ";

export interface ITimeSvgProps {
    lines: ILineXYZ[];
    selId: string;
    handleLineClick: (id: string) => void;
}