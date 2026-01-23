
export interface ICnfBSvgProps {
    penMaxSpeed: number;
    penIds: string[];
    penId: string;
    handleCnfBSvgProperties: (confSvgProperties: Pick<ICnfBSvgProps, 'penMaxSpeed' | 'penId'>) => void;
}