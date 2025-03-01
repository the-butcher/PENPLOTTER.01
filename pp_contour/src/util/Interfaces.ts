export interface ICoordinate {
    x: number;
    y: number;
}

export interface IParticle {
    id: string;
    p: ICoordinate;
    v: ICoordinate;
    a: number; // a random drift angle
    c: number;
    path: string;
    done: boolean;
}

export interface ILine {
    a: ICoordinate;
    b: ICoordinate;
}
