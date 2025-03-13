
import RefreshIcon from '@mui/icons-material/Refresh';
import { ListItemIcon } from "@mui/material";
import { useEffect } from "react";
import { TMapProcessing } from "./IMapProcessing";

export interface IStatusProps {
    status: TMapProcessing;
    icon: JSX.Element;
}

function StatusMapLayerComponent(props: IStatusProps) {

    const { status, icon } = { ...props };

    useEffect(() => {
        console.debug('✨ building map layer status component');
    }, []);

    return (

        <ListItemIcon
            sx={{
                color: status === 'pending' ? 'lightgray' : '#1976d2',
                // flexGrow: 1,
                minWidth: '20px',
                width: '20px'
            }}
        >
            {
                status === 'working' ? <RefreshIcon fontSize='small'
                    sx={{
                        animation: "spin 2s linear infinite",
                        "@keyframes spin": {
                            "0%": {
                                transform: "rotate(0deg)",
                            },
                            "100%": {
                                transform: "rotate(360deg)",
                            },
                        },
                    }}
                /> : icon
            }
        </ListItemIcon>

    );
}

export default StatusMapLayerComponent
