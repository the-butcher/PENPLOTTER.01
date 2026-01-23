import { ICubc2D } from "./ICubc2D";

export interface ICubcPath {
    id: string;
    penId: string;
    segments: ICubc2D[];
}