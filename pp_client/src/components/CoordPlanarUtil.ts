import { IBlockPlanar } from "./ICoordPlanar";

export class CoordPlanarUtil {

    static createBuffValsBytes(blocks: IBlockPlanar[]): Uint8Array {
        const sizeOfC = 20; // 5 x float
        const paramsB = new ArrayBuffer(sizeOfC * blocks.length);
        const paramsV = new DataView(paramsB);
        let offset = 0;
        for (let i = 0; i < blocks.length; i++) {
            offset = i * sizeOfC;
            paramsV.setFloat32(offset + 0, blocks[i].x1, true);
            paramsV.setFloat32(offset + 4, blocks[i].y1, true);
            paramsV.setFloat32(offset + 8, blocks[i].z1, true);
            paramsV.setFloat32(offset + 12, blocks[i].vi, true);
            paramsV.setFloat32(offset + 16, blocks[i].vo, true);
        }
        const result = new Uint8Array(paramsB);
        console.log('result', result);
        return result;
    }

}