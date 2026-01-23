import { ICubcPath } from "./ICubcPath";
import { IExtentXY } from "./IExtentXY";
import { ILinePath } from "./ILinePath";

export interface IFileSvgProps {
    fileLabel: string;
    extent: IExtentXY;
    linePaths: ILinePath[]; // each linegroup is a non-interrupted 'path', aka connected lines
    cubcPaths: ICubcPath[]; // each cubcgroup is a non-interrupted 'path', aka connected lines
}