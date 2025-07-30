export interface IHillshadeDefProps {
    id: string;
    aziDeg: number;
    zenDeg: number;
    weight: number;
    handleHillshadeDef: (hillshadeDefUpdates: Omit<IHillshadeDefProps, 'handleHillshadeDef'>) => void;
}