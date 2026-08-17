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
  Alert,
} from "@mui/material";

import {
  adaptToSystemManifest,
  SystemManifest,
  CompiledEntity,
  CompiledQuestionnaire,
  NormalizedField,
} from "@metastruct/compiler";

export interface DynamicWorkflowFormProps {
  manifest: unknown;
  onSubmit?: (
    data: Record<string, unknown>,
    currentStep: string
  ) => void;
}

export const DynamicWorkflowForm: React.FC<
  DynamicWorkflowFormProps
> = ({ manifest: rawManifest, onSubmit }) => {
  /*
   * The canonical SystemManifest contains:
   *
   *   entities
   *   questionnaires
   *
   * The form operates on one questionnaire and its target entity.
   */
  const manifest: SystemManifest =
    adaptToSystemManifest(rawManifest);

  const questionnaireEntries = Object.values(
    manifest.questionnaires
  );

  const questionnaire: CompiledQuestionnaire | undefined =
    questionnaireEntries[0];

  /*
   * A questionnaire identifies the entity whose fields
   * are being captured.
   */
  const entity: CompiledEntity | undefined =
    questionnaire
      ? manifest.entities[questionnaire.targetEntity]
      : Object.values(manifest.entities)[0];

  if (!entity) {
    throw new Error(
      "DynamicWorkflowForm: no compiled entity is available in the SystemManifest."
    );
  }

  /*
   * A workflow form normally has a questionnaire.
   *
   * If no questionnaire exists, we still allow the entity
   * to be rendered as a basic form.
   */
  const initialStep =
    questionnaire?.initialStep ?? "draft";

  const allowedTransitions =
    questionnaire?.allowedTransitions ?? {};

  const [formData, setFormData] =
    useState<Record<string, unknown>>(() => {
      const initial: Record<string, unknown> = {};

      for (const [key, field] of Object.entries(
        entity.schema
      )) {
        initial[key] = field.defaultValue ?? "";
      }

      return initial;
    });

  const [currentStep, setCurrentStep] =
    useState<string>(initialStep);

  const allowedNextSteps: string[] =
    allowedTransitions[currentStep] ?? [];

  const handleInputChange = (
    key: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTransition = (
    nextStep: string
  ) => {
    setCurrentStep(nextStep);

    onSubmit?.(
      formData,
      nextStep
    );
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        p: 3,
      }}
    >
      <Card elevation={2}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography
              variant="h5"
              component="h2"
              fontWeight="bold"
            >
              {entity.entityName}
            </Typography>

            {questionnaire && (
              <Chip
                label={`Status: ${currentStep}`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          {questionnaire && (
            <Typography
              variant="subtitle1"
              color="text.secondary"
              mb={3}
            >
              {questionnaire.title}
            </Typography>
          )}

          {/* Render compiled entity layout */}
          <Stack spacing={4}>
            {entity.layout.map(
              (section, sectionIndex) => (
                <Box key={sectionIndex}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    color="text.secondary"
                  >
                    {section.title}
                  </Typography>

                  <Stack spacing={2}>
                    {section.fields.map(
                      (fieldKey) => {
                        const field: NormalizedField =
                          entity.schema[fieldKey];

                        /*
                         * A layout may reference a field
                         * that is not present in the compiled
                         * schema. Ignore it rather than
                         * crashing the renderer.
                         */
                        if (!field) {
                          return null;
                        }

                        return (
                          <TextField
                            key={field.key}
                            label={field.label}
                            required={field.required}
                            value={
                              formData[field.key] ?? ""
                            }
                            onChange={(event) =>
                              handleInputChange(
                                field.key,
                                event.target.value
                              )
                            }
                            fullWidth
                          />
                        );
                      }
                    )}
                  </Stack>
                </Box>
              )
            )}
          </Stack>

          {/* Workflow transitions */}
          {questionnaire && (
            <Box
              mt={4}
              pt={2}
              borderTop="1px solid #eee"
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                mb={1.5}
              >
                Workflow Actions
              </Typography>

              {allowedNextSteps.length === 0 ? (
                <Alert severity="info">
                  No further workflow transitions
                  available from this state.
                </Alert>
              ) : (
                <Stack
                  direction="row"
                  spacing={2}
                >
                  {allowedNextSteps.map(
                    (nextStep) => (
                      <Button
                        key={nextStep}
                        variant="contained"
                        onClick={() =>
                          handleTransition(
                            nextStep
                          )
                        }
                      >
                        Transition to {nextStep}
                      </Button>
                    )
                  )}
                </Stack>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
