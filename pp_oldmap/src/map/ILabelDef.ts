import { TPredefinedFontName } from "pp-font";
import { TFillProps } from "pp-geom";

export interface ILabelDef {
    tileName: string;
    plotName: string;
    distance: number; // distance along the label line, or x-offset
    vertical: number; // vertical offset from the line, or y-offset
    charsign: number;
    txtscale: number;
    idxvalid: (index: number) => boolean;
    fonttype: TPredefinedFontName;
    fillprop: TFillProps;
}