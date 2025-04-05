import { ILabelDefPointLabel } from "../point/ILabelDefPointLabel";

export interface ILabelDefLineLabel extends ILabelDefPointLabel {
    idxvalid: string;
    fonttype: 'regular' | 'italic';
}