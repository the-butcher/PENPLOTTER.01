import { IVectorTileValue } from "../IVectorTileValue";

/**
 * implementation of IValue proprietary to an empty / not found value
 */
export class VectorTileValueEmpty implements IVectorTileValue<undefined> {

    isEmpty(): boolean {
        return true;
    }

    getByteCount(): number {
        return 0;
    }

    getValue(): undefined {
        // return null;
    }

}