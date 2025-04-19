export interface IActiveStepProps {
    activeStep: number;
    handleActiveStep: (activeStepUpdates: Omit<IActiveStepProps, 'handleActiveStep'>) => void;
}