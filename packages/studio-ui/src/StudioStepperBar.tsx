import React from "react";
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Chip,
} from "@mui/material";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ViewStreamIcon from "@mui/icons-material/ViewStream";

export interface StepperStep {
  id: string;
  label: string;
  fieldCount: number;
  hasVisibilityRule?: boolean;
}

export const StudioStepperBar: React.FC<{
  steps: StepperStep[];
  activeStepIndex: number;
  orientation: "horizontal" | "vertical";
  onStepClick: (index: number) => void;
  onOrientationChange: (mode: "horizontal" | "vertical") => void;
}> = ({ steps, activeStepIndex, orientation, onStepClick, onOrientationChange }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
          QUESTIONNAIRE WORKFLOW STEPPER (PREVIEW LAYOUT)
        </Typography>

        <ToggleButtonGroup
          value={orientation}
          exclusive
          size="small"
          onChange={(_, next) => next && onOrientationChange(next)}
        >
          <ToggleButton value="horizontal">
            <ViewWeekIcon fontSize="small" sx={{ mr: 0.5 }} /> Top Bar
          </ToggleButton>
          <ToggleButton value="vertical">
            <ViewStreamIcon fontSize="small" sx={{ mr: 0.5 }} /> Side Bar
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ overflowX: orientation === "horizontal" ? "auto" : "visible", py: 1 }}>
        <Stepper activeStep={activeStepIndex} orientation={orientation}>
          {steps.map((step, idx) => (
            <Step key={step.id}>
              <StepButton onClick={() => onStepClick(idx)}>
                <StepLabel
                  optional={
                    <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                      <Chip
                        label={`${step.fieldCount} fields`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: "0.65rem" }}
                      />
                      {step.hasVisibilityRule && (
                        <Chip
                          label="Conditional"
                          size="small"
                          color="warning"
                          sx={{ height: 18, fontSize: "0.65rem" }}
                        />
                      )}
                    </Box>
                  }
                >
                  {step.label}
                </StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Paper>
  );
};

