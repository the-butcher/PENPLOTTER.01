import { IHillshadeDefProps } from "./IHillshadeDefProps";

export interface IHillshadeConfigProps {
    zFactor: number;
    blurFactor: number;
    hillshadeDefs: Omit<IHillshadeDefProps, 'handleHillshadeDef' | 'deleteHillshadeDef' | 'deletable'>[];
    handleHillshadeConfig: (hillshadeConfigUpdates: Omit<IHillshadeConfigProps, 'handleHillshadeConfig' | 'deleteHillshadeDef' | 'deletable'>) => void;
}