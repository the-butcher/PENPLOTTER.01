import { LineString } from "geojson";
import { IHachureVertex } from "./IHachureVertex";

export interface IHachure {
    getId(): string;
    getVertexCount(): number;
    getLastVertex: () => IHachureVertex;
    addVertex: (vertex: IHachureVertex) => void;
    setComplete: () => void;
    isComplete: () => boolean;
    getSvgData: () => string;
    getSvgDataFw: () => string;
    toLineString: () => LineString;
}