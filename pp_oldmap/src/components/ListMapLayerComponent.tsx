import FitScreenIcon from '@mui/icons-material/FitScreen';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GridViewIcon from '@mui/icons-material/GridView';
import PolylineIcon from '@mui/icons-material/Polyline';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { Checkbox, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { IMapLayerProps } from "./IMapLayerProps";
import StatusMapLayerComponent from "./StatusMapLayerComponent";

function ListMapLayerComponent(props: IMapLayerProps) {

    const { id, visible, status, handleVisibilityChange, handleGeoJsonExport } = { ...props };

    // useEffect(() => {
    //     console.debug('✨ building map layer list component');
    // }, []);

    // useEffect(() => {

    //     console.debug('⚙ updating map layer component (visible, status)', visible, status);

    // }, [visible, status]);

    return (
        <ListItem>
            <Checkbox checked={visible} size="small" onChange={(e) => handleVisibilityChange(id, e.target.checked)} />
            <ListItemText
                sx={{
                    flexGrow: 20
                }}
                primary={id} />
            <ListItemButton
                sx={{
                    padding: '3px 12px 3px 3px'
                }}
                onClick={() => handleGeoJsonExport(id)}
            >
                <FileDownloadIcon
                    sx={{
                        color: 'lightblue'
                    }}
                    fontSize='small'
                />
            </ListItemButton>
            <StatusMapLayerComponent status={status.tile} icon={<GridViewIcon fontSize='small' />} />
            <StatusMapLayerComponent status={status.poly} icon={<TravelExploreIcon fontSize='small' />} />
            <StatusMapLayerComponent status={status.line} icon={<PolylineIcon fontSize='small' />} />
            <StatusMapLayerComponent status={status.clip} icon={<FitScreenIcon fontSize='small' />} />
            <StatusMapLayerComponent status={status.plot} icon={<EditNoteIcon fontSize='small' />} />
        </ListItem>

    );
}

export default ListMapLayerComponent
