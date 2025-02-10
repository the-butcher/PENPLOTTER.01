import { Box, Checkbox, FormControlLabel, FormGroup, Grid, Input, Slider, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import { IConfSvgProperties } from '../util/Interfaces';


function ConfSvgComponent(props: IConfSvgProperties) {

    const { paperExtent, connectSort, handleConfSvgProperties } = { ...props };

    useEffect(() => {
        console.debug('✨ building ConfSvgComponent');
    }, []);

    const handlePaperExtentSliderChange = (_event: Event, newValue: number | number[]) => {
        const xMax = newValue as number;
        handleConfSvgProperties({
            paperExtent: {
                ...paperExtent,
                xMax
            },
            connectSort
        });
    };

    const handlePaperExtentInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const xMax = event.target.value === '' ? paperExtent.xMax : Number(event.target.value);
        handleConfSvgProperties({
            paperExtent: {
                ...paperExtent,
                xMax
            },
            connectSort
        });
    };

    const handleConnectSortCheckboxChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        handleConfSvgProperties({
            paperExtent,
            connectSort: checked
        });
    }

    return (
        <Box
            sx={{ width: 'inherit' }}
        >
            <Typography id="input-slider" gutterBottom>
                output width
            </Typography>
            <Grid container spacing={2} sx={{ alignItems: 'top' }}>
                <Grid item xs={8}>
                    <Slider
                        value={paperExtent.xMax}
                        min={10}
                        max={250}
                        onChange={handlePaperExtentSliderChange}
                        aria-labelledby="input-slider"
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        value={paperExtent.xMax}
                        type="number"
                        variant="standard"
                        onChange={handlePaperExtentInputChange}
                        inputProps={{
                            step: 10,
                            min: 10,
                            max: 250,
                            type: 'number',
                            'aria-labelledby': 'input-slider',
                        }}
                        slotProps={{
                            inputLabel: {
                                shrink: true
                            },
                        }}
                    />
                </Grid>
            </Grid>
            <FormGroup>
                <FormControlLabel
                    control={<Checkbox
                        checked={connectSort}
                        onChange={handleConnectSortCheckboxChange}
                    />}
                    label="connect"

                />
            </FormGroup>
        </Box>
    )
}

export default ConfSvgComponent
