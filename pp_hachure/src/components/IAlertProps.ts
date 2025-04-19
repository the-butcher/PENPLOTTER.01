import { AlertColor } from "@mui/material";

/**
 * definition for a type that describes an alert of different severities
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
export interface IAlertProps {
    open: boolean;
    severity: AlertColor;
    title: string;
    message: string;
}