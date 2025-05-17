export interface ILabelDefPointLabel {
    tileName: string;
    plotName: string;
    distance: number; // distance along the label line
    vertical: number; // vertical offset from the line
    charsign: number;
    txtscale: number;
    fonttype: 'regular' | 'italic';
}