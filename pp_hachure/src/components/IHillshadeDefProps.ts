export interface IHillshadeDefProps {
    id: string;
    aziDeg: number;
    zenDeg: number;
    weight: number;
    deletable: boolean;
    handleHillshadeDef: (hillshadeDefUpdates: Omit<IHillshadeDefProps, 'handleHillshadeDef' | 'deleteHillshadeDef' | 'deletable'>) => void;
    deleteHillshadeDef: (id: string) => void;
}