import { LineString } from "geojson";
import { IHachureVertex } from "./IHachureVertex";

export interface IHachure {
    getId(): string;
    getVertexCount(): number;
    popLastVertex: () => void;
    getLastVertex: () => IHachureVertex;
    addVertex: (vertex: IHachureVertex) => void;
    setComplete: () => void;
    isComplete: () => boolean;
    toLineString: () => LineString;

    getSvgData: () => string;
    getSvgDataSteep: () => string;
}