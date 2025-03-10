export interface ILabelDef {
    tileName: string;
    plotName: string;
    distance: number; // distance along the label line
    vertical: number; // vertical offset from the line
    charsign: number;
    txtscale: number;
    idxvalid: (index: number) => boolean;
}