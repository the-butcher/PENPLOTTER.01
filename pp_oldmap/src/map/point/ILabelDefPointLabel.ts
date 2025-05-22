import { TPredefinedFontName } from "pp-font";
import { TFillProps } from "pp-geom";

export interface ILabelDefPointLabel {
    tileName: string;
    plotName: string;
    distance: number; // distance along the label line
    vertical: number; // vertical offset from the line
    charsign: number;
    txtscale: number;
    fonttype: TPredefinedFontName;
    fillprop: TFillProps;
}