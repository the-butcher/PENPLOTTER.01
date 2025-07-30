import { IHillshadeDefProps } from "./IHillshadeDefProps";

export interface IHillshadeConfigProps {
    zFactor: number;
    blurFactor: number;
    hillshadeDefs: Omit<IHillshadeDefProps, 'handleHillshadeDef'>[];
    handleHillshadeConfig: (hillshadeConfigUpdates: Omit<IHillshadeConfigProps, 'handleHillshadeConfig'>) => void;
}