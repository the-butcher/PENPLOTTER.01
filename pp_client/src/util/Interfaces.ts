export interface IStepDefProperties {
    label: string;
    valid: (fileSvgProperties: IFileSvgProperties, confSvgProperties: IConfSvgProperties, connBleProperties: IConnBleProperties) => boolean;
}

export interface ILoessData {
    x: number[];
    y: number[];
}

export interface IBlockPlanar {
    x: number;
    y: number;
    z: number;
    vi: number;
    vo: number;
}

export interface IConnBleProperties {
    device?: BluetoothDevice;
    success: boolean;
    message: string;
    handleConnBleProperties: (connBleProperties: Pick<IConnBleProperties, 'device' | 'message'>) => void;
}

export interface ISendBleProperties {
    lines: ILine3D[];
    // device?: BluetoothDevice;
    // handleConnectionState: (state: IConnBleProperties) => void;
}

// export interface IPickDeviceProperties {
//     handleDevicePicked: (device: IConnBleProperties) => void;
// }

/**
 * properties for the PickSVGComponent
 */
export interface IPickSvgProperties {
    handleFileSvgProperties: (fileSvgProperties: IFileSvgProperties) => void;
}

export interface IConfSvgProperties {
    paperExtent: IExtent;
    connectSort: boolean;
    done: boolean;
    handleConfSvgProperties: (confSvgProperties: Pick<IConfSvgProperties, 'paperExtent' | 'connectSort'>) => void;
}

export interface IFileSvgProperties {
    fileLabel: string;
    linePaths: ILinePath[]; // each linegroup is a 'path', aka connected lines
    cubcPaths: ICubcPath[]; // each cubcgroup is a 'path', aka connected lines
}

export interface IRootSvgProperties {
    lines: ILinePath[]; // each linegroup is a 'path', aka connected lines
    extent: IExtent;
    selId: string;
    handleLineClick: (id: string) => void;
}

export interface ITimeSvgProperties {
    lines: ILine3D[];
    selId: string;
    handleLineClick: (id: string) => void;
}

export interface ILinePath {
    id: string;
    segments: ILine2D[]; // a list of lines that this group is composed from
    strokeWidth: number;
    stroke: string;
}

export interface ICubcPath {
    id: string;
    segments: ICubc2D[];
}

export interface ILine2D {
    id: string;
    coordA: ICoordinate2D;
    coordB: ICoordinate2D;
}


export interface ICubc2D extends ILine2D {
    coordC: ICoordinate2D;
    coordD: ICoordinate2D;
}

export interface ICoordinate2D {
    x: number;
    y: number;
}

export interface ICoordinate3D extends ICoordinate2D {
    z: number;
}

export interface ILine3D {
    id: string;
    coordA: ICoordinate3D;
    coordB: ICoordinate3D;
    length: number; // length of this line (convenience, code must take care of this being up to date after any change to coordinates)
    speedB: number; // pen-plotter exit speed from this line (mm/s)
}

export interface IMatrix2D {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}

export interface IExtent {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
}

export type ELineDirection = "df" | "dr";
export const LINE_DIRECTIONS: ELineDirection[] = ['df', 'dr'];