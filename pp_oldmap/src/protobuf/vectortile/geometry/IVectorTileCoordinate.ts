export const CODE____MOVE_TO = 1;
export const CODE____LINE_TO = 2;
export const CODE______CLOSE = 7;

export type COMMAND_TYPE = 1 | 2 | 7;

export interface IVectorTileCoordinate {
    type: COMMAND_TYPE;
    x: number;
    y: number;
}