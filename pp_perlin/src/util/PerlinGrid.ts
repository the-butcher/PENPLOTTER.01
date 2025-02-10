import { ICoordinate } from "./Interfaces";

export interface IPerlinGridProps {
    cellCountX: number;
    cellCountY: number;
    cellSizeXY: number; // number of pixels per cell
}

export interface IPerlinAnchor {
    g: ICoordinate; // grid index
    v: ICoordinate; // random vector
}

export class PerlinGrid {

    private static readonly MAX_DOT = Math.sqrt(2) / 2;

    private cellCountX: number;
    private cellCountY: number;
    private cellSizeXY: number;
    private readonly gridAnchors: IPerlinAnchor[];

    constructor(props: IPerlinGridProps) {

        this.cellCountX = props.cellCountX;
        this.cellCountY = props.cellCountY;
        this.cellSizeXY = props.cellSizeXY;
        this.gridAnchors = [];

        for (let gridIndexY = 0; gridIndexY < this.cellCountY; gridIndexY++) {
            for (let gridIndexX = 0; gridIndexX < this.cellCountX; gridIndexX++) {
                const angle = Math.random() * 2 * Math.PI;
                const gridAnchor = {
                    g: {
                        x: gridIndexX,
                        y: gridIndexY,
                    },
                    v: {
                        x: Math.cos(angle),
                        y: Math.sin(angle)
                    }
                }
                this.gridAnchors[gridIndexY * this.cellCountX + gridIndexX] = gridAnchor;
            }
        }
        for (let gridIndexX = 0; gridIndexX < this.cellCountX; gridIndexX++) {
            this.gridAnchors[(this.cellCountY - 1) * this.cellCountX + gridIndexX].v = this.gridAnchors[gridIndexX].v;
        }
        for (let gridIndexY = 0; gridIndexY < this.cellCountY - 1; gridIndexY++) {
            this.gridAnchors[gridIndexY * this.cellCountX + this.cellCountX - 1].v = this.gridAnchors[gridIndexY * this.cellCountX].v;
        }

    }

    public getRasterDimX(): number {
        return (this.cellCountX - 1) * this.cellSizeXY;
    }

    public getRasterDimY(): number {
        return (this.cellCountY - 1) * this.cellSizeXY;
    }

    private smoothStep(x: number): number {
        if (x < 0 || x > 1) {
            console.warn("x out of range", x);
        }
        // return x;
        // return -2 * Math.pow(x, 3) + 3 * Math.pow(x, 2);
        // return x * x * x * (x * (6 * x - 15) + 10);
        return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
    }

    private interpolate(v: number, a: number, b: number): number {
        return a + this.smoothStep(v) * (b - a);
    }

    public getRasterVal(pixelIndexX: number, pixelIndexY: number) {

        const gridIndexX = pixelIndexX / this.cellSizeXY; // grid index as floating point number
        const gridIndexY = pixelIndexY / this.cellSizeXY; // grid index as floating point number

        const dots: number[] = [];
        for (let dotIndexY = 0; dotIndexY < 2; dotIndexY++) {
            for (let dotIndexX = 0; dotIndexX < 2; dotIndexX++) {

                const gridAnchorIndex = (Math.floor(gridIndexY) + dotIndexY) * this.cellCountX + Math.floor(gridIndexX) + dotIndexX;
                const offsetVector: ICoordinate = {
                    x: gridIndexX - this.gridAnchors[gridAnchorIndex].g.x,
                    y: gridIndexY - this.gridAnchors[gridAnchorIndex].g.y,
                };
                dots[(dotIndexY) * 2 + dotIndexX] = offsetVector.x * this.gridAnchors[gridAnchorIndex].v.x + offsetVector.y * this.gridAnchors[gridAnchorIndex].v.y;

            }
        }

        const dot01 = this.interpolate(gridIndexX % 1, dots[0], dots[1]);
        const dot23 = this.interpolate(gridIndexX % 1, dots[2], dots[3]);

        return this.interpolate(gridIndexY % 1, dot01, dot23) / PerlinGrid.MAX_DOT; // -1 to 1

    }

}

