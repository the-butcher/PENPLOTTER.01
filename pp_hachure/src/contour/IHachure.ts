import { Polygon } from "geojson";
import { IHachureVertex } from "./IHachureVertex";

export interface IHachure {
    getId(): string;
    getVertexCount(): number;
    popLastVertex: () => void;
    getLastVertex: () => IHachureVertex;
    addVertex: (vertex: IHachureVertex) => void;
    setComplete: () => void;
    isComplete: () => boolean;
    getSvgData: () => string;
    // getSvgDataSteep: () => string;
    toLineString: () => Polygon;
}