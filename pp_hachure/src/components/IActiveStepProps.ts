export interface IActiveStepProps {
    activeStep: number;
    showHelperTexts: boolean;
    handleActiveStep: (activeStepUpdates: Omit<IActiveStepProps, 'handleActiveStep' | 'showHelperTexts'>) => void;
}