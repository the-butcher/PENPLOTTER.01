import { IBlockPlanar } from "../components/IBlockPlanar";
import { ICoordPlanar } from "../components/ICoordPlanar";

export class CoordUtil {

    static BUFF_LN = 24; // bluetooth buffer size
    static BUFF_MAX = 512;

    static SEMI_PI = Math.PI / 2;
    static MIN_MMS = 1;
    static MAX_MMS = 40; // max speed for draw movements (mm/s)
    static MAX_ACC = 40; // acceleration for draw movements (mm/s²)
    static PEN_MMS = 60; // max speed for pen movements (mm/s)
    static PEN_ACC = 90; // pen acceleration (mm/s²)
    static PEN_Z_U = 0.0; // pen position when up (mm)
    static PEN_Z_D = -8.0; // pen position when down (mm)

    /**
     * create a new block along the vector defined by this block at the given multipliers
     * @param block
     * @param mult0
     * @param mult1
     * @param vi
     * @param vo
     * @returns
     */
    static toMultBlock(block: IBlockPlanar, mult0: number, mult1: number, vi: number, vo: number): IBlockPlanar {
        const unitCoord: ICoordPlanar = CoordUtil.toUnitCoord(block);
        const multlock: IBlockPlanar = {
            x0: block.x0 + unitCoord.x1 * mult0,
            y0: block.y0 + unitCoord.y1 * mult0,
            z0: block.z0 + unitCoord.z1 * mult0,
            x1: block.x0 + unitCoord.x1 * mult1,
            y1: block.y0 + unitCoord.y1 * mult1,
            z1: block.z0 + unitCoord.z1 * mult1,
            l: mult1 - mult0,
            vi,
            vo,
            bb: false
        };
        return multlock;
    }

    static toUnitCoord(block: IBlockPlanar): ICoordPlanar {
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

    static sameDir(blockA: IBlockPlanar, blockB: IBlockPlanar): boolean {
        const unitCoordA = CoordUtil.toUnitCoord(blockA);
        const unitCoordB = CoordUtil.toUnitCoord(blockB);
        return unitCoordA.x1 === unitCoordB.x1 && unitCoordA.y1 === unitCoordB.y1 && unitCoordA.z1 === unitCoordB.z1;
    }

}