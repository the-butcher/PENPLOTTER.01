import GridViewIcon from '@mui/icons-material/GridView';
import { ListItem, ListItemText } from "@mui/material";
import { useEffect } from "react";
import { IMapLayerProps } from "./IMapLayerProps";
import StatusMapLayerComponent from "./StatusMapLayerComponent";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import PolylineIcon from '@mui/icons-material/Polyline';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import EditNoteIcon from '@mui/icons-material/EditNote';

function ListMapLayerComponent(props: IMapLayerProps) {

    const { id, status } = { ...props };

    useEffect(() => {
        console.debug('✨ building map layer list component');
    }, []);

    useEffect(() => {

        console.log('⚙ updating map layer component (status)', status);

    }, [status]);

    return (
        <ListItem>
            <ListItemText
                sx={{
                    paddingRight: '12px'
                }}
                primary={id}
            />
            <StatusMapLayerComponent status={status.tile} icon={<GridViewIcon />} />
            <StatusMapLayerComponent status={status.poly} icon={<TravelExploreIcon />} />
            <StatusMapLayerComponent status={status.line} icon={<PolylineIcon />} />
            <StatusMapLayerComponent status={status.clip} icon={<ContentCutIcon />} />
            <StatusMapLayerComponent status={status.plot} icon={<EditNoteIcon />} />
        </ListItem>

    );
}

export default ListMapLayerComponent
