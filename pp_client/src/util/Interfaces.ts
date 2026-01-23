import { ICnfASvgProps } from "./ICnfASvgProps";
import { ICnfBSvgProps } from "./ICnfBSvgProps";
import { IConnBleProps } from "./IConnBleProps";
import { IFileSvgProps } from "./IFileSvgProps";
import { ISendBleProps } from "./ISendBleProps";

export interface IConnectSettings {
    linePathCount: number;
    cubcPathCount: number;
    paperDimX: number;
    penId: string;
}

export interface IStepDefProperties {
    label: string;
    valid: (
        fileSvgProperties: IFileSvgProps,
        cnfASvgProperties: ICnfASvgProps,
        connBleProperties: IConnBleProps,
        cnfBSvgProperties: ICnfBSvgProps,
        sendBleProperties: ISendBleProps
    ) => boolean;
}

export interface ILoessData {
    x: number[];
    y: number[];
}

// export interface IPickDeviceProperties {
//     handleDevicePicked: (device: IConnBleProperties) => void;
// }

export interface IMatrix2D {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}

export type ELineDirection = "df" | "dr";
// export const LINE_DIRECTIONS: ELineDirection[] = ['df', 'dr'];
export const LINE_DIRECTIONS: ELineDirection[] = ['df']; // forward only to draw hachures only upwards