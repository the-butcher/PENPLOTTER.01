import { IContent } from "./IContent";
import { IHachureVertex } from "./IHachureVertex";

/**
 * definition for a single hachure line that can grow upwards across {@link IContour} lines
 *
 * @author h.fleischer
 * @since 06.04.2025
 */
export interface IHachure extends IContent {

    /**
     * get the current count of vertices in this hachure line
     */
    getVertexCount(): number;

    /**
     * removes the last vertex from this hachure line
     * @returns
     */
    popLastVertex: () => void;

    /**
     * get the last vertex in this hachure line
     * when the curve is initialized, there may be a single vertex initially
     * @returns
     */
    getLastVertex: () => IHachureVertex;
    addVertex: (vertex: IHachureVertex) => void;

    complete: boolean;

}