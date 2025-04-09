import { LineString } from "geojson";
import { ISymbolProperties } from "../common/ISymbolProperties";
import { IWorkerLineInput } from "../common/IWorkerLineInput";

export interface IWorkerLineInputLine extends IWorkerLineInput<LineString, ISymbolProperties> {
    dashArray: [number, number];
    offset: number;
    symbolDefinitions: { [K in string]: ISymbolDefPointDash };
}

export interface ISymbolDefPointDash {
    symbolFactory: string; // the method to be called on SymbolUtil
    dashSize: number; // the preferred interval at which symbols should be placed
}

