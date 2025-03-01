import { Checkbox, Grid, Slider, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import { ICnfASvgProperties } from '../util/Interfaces';

function CnfASvgComponent(props: ICnfASvgProperties) {

    const { paperExtent, connectSort, keepTopLeft, handleCnfASvgProperties } = { ...props };

    useEffect(() => {
        console.debug('✨ building ConfSvgComponent');
    }, []);

    const handlePaperExtentSliderChange = (_event: Event, newValue: number | number[]) => {
        const xMax = newValue as number;
        handleCnfASvgProperties({
            paperExtent: {
                ...paperExtent,
                xMax
            },
            connectSort,
            keepTopLeft,
        });
    };

    const handlePaperExtentInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const xMax = event.target.value === '' ? paperExtent.xMax : Number(event.target.value);
        handleCnfASvgProperties({
            paperExtent: {
                ...paperExtent,
                xMax
            },
            connectSort,
            keepTopLeft,
        });
    };

    const handleConnectSortCheckboxChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        handleCnfASvgProperties({
            paperExtent,
            keepTopLeft,
            connectSort: checked,
        });
    }

    const handleKeepTopLeftCheckboxChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        handleCnfASvgProperties({
            paperExtent,
            connectSort,
            keepTopLeft: checked,
        });
    }


    return (

        <Grid container spacing={2} sx={{ alignItems: 'top' }}>
            <Grid item xs={12}>
                <Typography id="input-slider">
                    output width
                </Typography>
            </Grid>

            <Grid item xs={9}>
                <Slider
                    size='small'
                    value={paperExtent.xMax}
                    min={10}
                    max={250}
                    onChange={handlePaperExtentSliderChange}
                    aria-labelledby="input-slider"
                />
            </Grid>
            <Grid item xs={3}>
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

            <Grid item xs={3}>
                <Checkbox
                    checked={connectSort}
                    onChange={handleConnectSortCheckboxChange}
                />
            </Grid>
            <Grid item xs={9}>
                <Typography
                    style={{
                        marginTop: '6px'
                    }}
                >
                    greedy sorting
                </Typography>
            </Grid>
            <Grid item xs={3}>
                <Checkbox
                    checked={keepTopLeft}
                    onChange={handleKeepTopLeftCheckboxChange}
                />
            </Grid>
            <Grid item xs={9}>
                <Typography
                    style={{
                        marginTop: '6px'
                    }}
                >
                    keep margin
                </Typography>
            </Grid>

        </Grid >
    )
}

export default CnfASvgComponent
