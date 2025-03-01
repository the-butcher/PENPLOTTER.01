import DrawIcon from '@mui/icons-material/Draw';
import { Divider, Grid, IconButton, Slider, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import { ICnfBSvgProperties } from '../util/Interfaces';

function CnfBSvgComponent(props: ICnfBSvgProperties) {

    const { penMaxSpeed, penIds, penId, handleCnfBSvgProperties } = { ...props };

    useEffect(() => {
        console.debug('✨ building ConfSvgComponent');
    }, []);


    const handlePenMaxSpeedSliderChange = (_event: Event, newValue: number | number[]) => {
        const _penMaxSpeed = newValue as number;
        handleCnfBSvgProperties({
            penMaxSpeed: _penMaxSpeed,
            penId
        });
    };

    const handlePenMaxSpeedInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const _penMaxSpeed = event.target.value === '' ? penMaxSpeed : Number(event.target.value);
        handleCnfBSvgProperties({
            penMaxSpeed: _penMaxSpeed,
            penId
        });
    };

    const handlePenIdButtonClick = (_penId: string) => {
        handleCnfBSvgProperties({
            penMaxSpeed,
            penId: _penId
        });
    };


    return (

        <Grid container spacing={2} sx={{ alignItems: 'top' }}>

            <Grid item xs={12}>
                <Typography>
                    pen speed (mm/s)
                </Typography>
            </Grid>
            <Grid item xs={9}>
                <Slider
                    size='small'
                    value={penMaxSpeed}
                    min={10}
                    max={30}
                    step={1}
                    onChange={handlePenMaxSpeedSliderChange}
                    aria-labelledby="input-slider"
                />
            </Grid>
            <Grid item xs={3}>
                <TextField
                    value={penMaxSpeed}
                    type="number"
                    variant="standard"
                    onChange={handlePenMaxSpeedInputChange}
                    inputProps={{
                        step: 1,
                        min: 10,
                        max: 30,
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

            <Grid item xs={12}>
                <Divider
                    style={{
                        padding: '10px 0px 10px 0px'
                    }}
                />
            </Grid>
            {penIds.map((penId) => (
                <>


                    <Grid item xs={9} key={`t${penId}`}>
                        <Typography
                            style={{
                                marginTop: '10px'
                            }}
                        >{`pen ${penId}`}</Typography>
                    </Grid>
                    <Grid item xs={3} key={`b${penId}`}>
                        <IconButton
                            aria-label="comment"
                            onClick={() => handlePenIdButtonClick(penId)}
                        >
                            <DrawIcon />
                        </IconButton>
                    </Grid>

                </>
            ))}


        </Grid>


    )
}

export default CnfBSvgComponent
