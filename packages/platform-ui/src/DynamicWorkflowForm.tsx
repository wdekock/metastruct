import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Alert
} from "@mui/material";
import {
  adaptToSystemManifest,
  SystemManifest,
  CompiledLayoutSection,
  NormalizedField
} from "@metastruct/compiler";

export interface DynamicWorkflowFormProps {
  manifest: any;
  onSubmit?: (data: Record<string, any>, currentStep: string) => void;
}

export const DynamicWorkflowForm: React.FC<DynamicWorkflowFormProps> = ({
  manifest: rawManifest,
  onSubmit
}) => {
  const manifest: SystemManifest = adaptToSystemManifest(rawManifest);

  // Initialize form state with compiled default values
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    for (const [key, field] of Object.entries<NormalizedField>(manifest.schema)) {
      initial[key] = field.defaultValue ?? "";
    }
    return initial;
  });

  // Track active workflow step
  const [currentStep, setCurrentStep] = useState<string>(
    manifest.workflowState.initialStep || "draft"
  );

  const allowedNextSteps: string[] = manifest.workflowState.allowedTransitions[currentStep] || [];

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTransition = (nextStep: string) => {
    setCurrentStep(nextStep);
    if (onSubmit) {
      onSubmit(formData, nextStep);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              {manifest.entityName}
            </Typography>
            <Chip
              label={`Status: ${currentStep}`}
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Render compiled layout sections */}
          <Stack spacing={4}>
            {manifest.layout.map((section: CompiledLayoutSection, idx: number) => (
              <Box key={idx}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  {section.title}
                </Typography>
                <Stack spacing={2}>
                  {section.fields.map((field: NormalizedField) => (
                    <TextField
                      key={field.key}
                      label={field.label}
                      required={field.required}
                      value={formData[field.key] ?? ""}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      fullWidth
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* Interactive Workflow Transitions */}
          <Box mt={4} pt={2} borderTop="1px solid #eee">
            <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
              Workflow Actions
            </Typography>
            {allowedNextSteps.length === 0 ? (
              <Alert severity="info">No further workflow transitions available from this state.</Alert>
            ) : (
              <Stack direction="row" spacing={2}>
                {allowedNextSteps.map((nextStep: string) => (
                  <Button
                    key={nextStep}
                    variant="contained"
                    onClick={() => handleTransition(nextStep)}
                  >
                    Transition to {nextStep}
                  </Button>
                ))}
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};