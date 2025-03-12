import { TMapProcessing } from "../../components/IMapProcessing";
import { ISkipOptions } from "../ISkipOptions";

export interface IClipDef {
    layerNameDest: string;
    layerNameClip: string;
    distance: number;
    options?: ISkipOptions;
    status: TMapProcessing;
}