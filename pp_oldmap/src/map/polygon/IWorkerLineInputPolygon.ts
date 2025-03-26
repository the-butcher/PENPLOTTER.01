import { Polygon } from "geojson";
import { IWorkerLineInput } from "../common/IWorkerLineInput";
import { ISymbolProperties } from "../common/ISymbolProperties";

export interface IWorkerLineInputPolygon extends IWorkerLineInput<Polygon, ISymbolProperties> {
    symbolDefinitions: { [K in string]: ISymbolDefPointFill };
}

export interface ISymbolDefPointFill {
    symbolFactory: string; // the method to be called on SymbolUtil
    gridType: 'hexagon' | 'triangle';
    gridSize: number;
    randSize: number;
}
