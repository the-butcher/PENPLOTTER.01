import { IExtentXY } from "./IExtentXY";

export interface ICnfASvgProps {
    paperExtent: IExtentXY;
    connectSort: boolean;
    keepTopLeft: boolean;
    handleCnfASvgProperties: (confSvgProperties: Pick<ICnfASvgProps, 'paperExtent' | 'connectSort' | 'keepTopLeft'>) => void;
}