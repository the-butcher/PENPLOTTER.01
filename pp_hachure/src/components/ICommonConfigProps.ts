import { IAlertProps } from "./IAlertProps";

/**
 * definition of properties common to all steps
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
export interface ICommonConfigProps {
    activeStep: number;
    showHelperTexts: boolean;
    handleCommonConfig: (activeStepUpdates: Omit<ICommonConfigProps, 'handleCommonConfig' | 'handleAlertProps' | 'showHelperTexts'>) => void;
    handleAlertProps: (alertPropsUpdates: Omit<IAlertProps, 'open'>) => void;
}