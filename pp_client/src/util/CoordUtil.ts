import { IBlockPlanar, ICoordPlanar } from "../components/ICoordPlanar";

export class CoordUtil {

    static BUFF_LN = 16; // bluetooth buffer size

    static SEMI_PI = Math.PI / 2;
    static MIN_MMS = 1;
    static MAX_MMS = 40;
    static MAX_ACC = 40; // mm/s²
    static PEN_MMS = 60;
    static PEN_ACC = 60; // mm/s²
    static PEN_Z_U = 0.0;
    static PEN_Z_D = -8.0;

    static toMultBlock(block: IBlockPlanar, mult0: number, mult1: number, vi: number, vo: number): IBlockPlanar {
        const unitBlock: ICoordPlanar = CoordUtil.toUnitBlock(block);
        const multlock: IBlockPlanar = {
            x0: block.x0 + unitBlock.x1 * mult0,
            y0: block.y0 + unitBlock.y1 * mult0,
            z0: block.z0 + unitBlock.z1 * mult0,
            x1: block.x0 + unitBlock.x1 * mult1,
            y1: block.y0 + unitBlock.y1 * mult1,
            z1: block.z0 + unitBlock.z1 * mult1,
            l: mult1 - mult0,
            vi,
            vo,
            bb: false
        };
        return multlock;
    }

    static toUnitBlock(block: IBlockPlanar): ICoordPlanar {
        const xD = block.x1 - block.x0;
        const yD = block.y1 - block.y0;
        const zD = block.z1 - block.z0;
        const len = CoordUtil.blockLen(block);
        const unitBlock: ICoordPlanar = {
            x1: xD / len,
            y1: yD / len,
            z1: zD / len
        };
        return unitBlock;
    }

    static blockLen(block: IBlockPlanar): number {
        const xD = block.x1 - block.x0;
        const yD = block.y1 - block.y0;
        const zD = block.z1 - block.z0;
        return Math.sqrt(xD * xD + yD * yD + zD * zD);
    }

    static blockDot(blockA: ICoordPlanar, blockB: ICoordPlanar): number {
        return blockA.x1 * blockB.x1 + blockA.y1 * blockB.y1 + blockA.z1 * blockB.z1;
    }

}