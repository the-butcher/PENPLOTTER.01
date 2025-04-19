import { IAlertProps } from "./IAlertProps";

/**
 * definition of properties common to all steps
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
export interface IActiveStepProps {
    activeStep: number;
    showHelperTexts: boolean;
    handleActiveStep: (activeStepUpdates: Omit<IActiveStepProps, 'handleActiveStep' | 'handleAlertProps' | 'showHelperTexts'>) => void;
    handleAlertProps: (alertPropsUpdates: Omit<IAlertProps, 'open'>) => void;
}