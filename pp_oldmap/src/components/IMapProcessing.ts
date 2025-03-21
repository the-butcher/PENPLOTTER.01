
export type TMapProcessing = 'pending' | 'working' | 'success' | 'failure';

export interface IMapProcessing {
    tile: TMapProcessing;
    poly: TMapProcessing;
    line: TMapProcessing;
    clip: TMapProcessing;
    plot: TMapProcessing;
}
