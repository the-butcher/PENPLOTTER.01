import { Stack, Step, StepButton, Stepper } from "@mui/material";
import MapComponent from "./MapComponent";

function UserInterfaceComponent() {

  return (
    <Stack spacing={2} direction={"column"} sx={{}}>
      <Stepper nonLinear activeStep={0}>
        <Step key={"tiledata"} completed={true}>
          <StepButton color="inherit" onClick={() => { }}>
            {"tile data"}
          </StepButton>
        </Step>
        <Step key={"polydata"} completed={true}>
          <StepButton color="inherit" onClick={() => { }}>
            {"poly data"}
          </StepButton>
        </Step>
        <Step key={"linedata"} completed={true}>
          <StepButton color="inherit" onClick={() => { }}>
            {"line data"}
          </StepButton>
        </Step>
        <Step key={"clipdata"} completed={true}>
          <StepButton color="inherit" onClick={() => { }}>
            {"clip data"}
          </StepButton>
        </Step>
        <Step key={"plotdata"} completed={true}>
          <StepButton color="inherit" onClick={() => { }}>
            {"plot data"}
          </StepButton>
        </Step>
      </Stepper>
      <MapComponent />
    </Stack>

  );
}

export default UserInterfaceComponent;
