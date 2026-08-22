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
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import {
  adaptToSystemManifest,
  SystemManifest,
  CompiledEntity,
  CompiledQuestion,
  CompiledQuestionnaire,
} from "@metastruct/compiler";

export interface DynamicWorkflowFormProps {
  manifest: unknown;

  /**
   * Captured questionnaire data is returned as canonical
   * entity-field JSON.
   *
   * Example:
   *
   * {
   *   name: "Metastruct",
   *   email: "test@example.com"
   * }
   *
   * The questionnaire question itself is not persisted
   * as the data key. The question's fieldKey determines
   * the canonical entity field.
   */
  onSubmit?: (
    data: Record<string, unknown>,
    currentStep: string
  ) => void;
}

export const DynamicWorkflowForm: React.FC<
  DynamicWorkflowFormProps
> = ({ manifest: rawManifest, onSubmit }) => {
  /*
   * Runtime architecture:
   *
   * SystemManifest
   *   ├── entities
   *   └── questionnaires
   *
   * The questionnaire is the driver of the form.
   * The entity supplies the canonical field definition.
   */
  const manifest: SystemManifest =
    adaptToSystemManifest(rawManifest);

  const questionnaireEntries = Object.values(
    manifest.questionnaires
  );

  const questionnaire:
    | CompiledQuestionnaire
    | undefined = questionnaireEntries[0];

  if (!questionnaire) {
    throw new Error(
      "DynamicWorkflowForm: no compiled questionnaire is available in the SystemManifest."
    );
  }

  /*
   * The questionnaire identifies the target entity.
   *
   * This is the entity whose fields will receive the
   * captured questionnaire answers.
   */
  const entity: CompiledEntity | undefined =
    manifest.entities[questionnaire.targetEntity];

  if (!entity) {
    throw new Error(
      `DynamicWorkflowForm: questionnaire '${questionnaire.id}' references target entity '${questionnaire.targetEntity}', but that entity is not available in the SystemManifest.`
    );
  }

  /*
   * Questionnaire execution starts at its declared
   * initial step.
   */
  const [currentStep, setCurrentStep] =
    useState<string>(questionnaire.initialStep);

  /*
   * Captured data is canonical ENTITY JSON.
   *
   * IMPORTANT:
   *
   * We do NOT initialise every entity field here.
   *
   * Only questionnaire questions that have been answered
   * contribute data to the captured JSON document.
   *
   * Example:
   *
   * Question:
   *   id       = "projectName"
   *   fieldKey = "name"
   *
   * Captured JSON:
   *   {
   *     "name": "Metastruct"
   *   }
   */
  const [formData, setFormData] =
    useState<Record<string, unknown>>({});

  /*
   * Get the currently active questionnaire step.
   */
  const step =
    questionnaire.steps[currentStep];

  /*
   * A valid questionnaire should always have a step
   * matching currentStep because the compiler validates
   * initialStep and transition targets.
   */
  if (!step) {
    throw new Error(
      `DynamicWorkflowForm: questionnaire '${questionnaire.id}' has no step '${currentStep}'.`
    );
  }

  /*
   * Only questions listed by the current step are rendered.
   *
   * This is the important distinction between a
   * questionnaire and an entity CRUD form.
   */
  const questionsForStep: CompiledQuestion[] =
    step.questionIds
      .map(
        (questionId) =>
          questionnaire.questions[questionId]
      )
      .filter(
        (
          question
        ): question is CompiledQuestion =>
          Boolean(question)
      );

  /*
   * Workflow transitions come from the questionnaire.
   */
  const allowedNextSteps: string[] =
    questionnaire.allowedTransitions[
      currentStep
    ] ?? [];

  /*
   * Capture an answer against the QUESTION'S mapped
   * ENTITY FIELD.
   *
   * Question:
   *
   *   entityName = "Project Intake"
   *   fieldKey   = "name"
   *
   * Therefore:
   *
   *   formData["name"] = answer
   *
   * The question ID is deliberately NOT used as the
   * captured JSON key.
   */
  const handleQuestionChange = (
    question: CompiledQuestion,
    value: unknown
  ) => {
    setFormData((previous) => ({
      ...previous,
      [question.fieldKey]: value,
    }));
  };

  /*
   * Render a questionnaire question using the compiled
   * widget.
   *
   * The compiler has already resolved the widget cascade:
   *
   *   question.widget override
   *       ↓
   *   UI Spec widget
   *       ↓
   *   Metastruct default widget
   *
   * Therefore the runtime does not need to perform that
   * resolution itself.
   */
  const renderQuestion = (
    question: CompiledQuestion
  ) => {
    /*
     * A question's entityName and fieldKey have already
     * been validated by the questionnaire laws.
     *
     * Keep the runtime guard for defensive programming.
     */
    const questionEntity =
      manifest.entities[question.entityName];

    if (!questionEntity) {
      return null;
    }

    const field =
      questionEntity.schema[question.fieldKey];

    if (!field) {
      return null;
    }

    const value =
      formData[question.fieldKey] ?? "";

    const widgetType =
      question.widget?.type ?? "text";

    /*
     * Text widget.
     */
    if (
      widgetType === "text" ||
      widgetType === "textarea"
    ) {
      return (
        <TextField
          key={question.id}
          label={question.questionText}
          helperText={
            question.helpText ?? undefined
          }
          placeholder={
            question.placeholder ?? undefined
          }
          required={question.isRequired}
          disabled={question.readOnly}
          value={value}
          multiline={
            widgetType === "textarea"
          }
          onChange={(event) =>
            handleQuestionChange(
              question,
              event.target.value
            )
          }
          fullWidth
        />
      );
    }

    /*
     * Number widget.
     */
    if (widgetType === "number") {
      return (
        <TextField
          key={question.id}
          type="number"
          label={question.questionText}
          helperText={
            question.helpText ?? undefined
          }
          placeholder={
            question.placeholder ?? undefined
          }
          required={question.isRequired}
          disabled={question.readOnly}
          value={value}
          onChange={(event) => {
            const rawValue =
              event.target.value;

            handleQuestionChange(
              question,
              rawValue === ""
                ? ""
                : Number(rawValue)
            );
          }}
          fullWidth
        />
      );
    }

    /*
     * Checkbox widget.
     */
    if (widgetType === "checkbox") {
      return (
        <FormControlLabel
          key={question.id}
          control={
            <Checkbox
              checked={Boolean(value)}
              disabled={question.readOnly}
              onChange={(event) =>
                handleQuestionChange(
                  question,
                  event.target.checked
                )
              }
            />
          }
          label={question.questionText}
        />
      );
    }

    /*
     * Date widget.
     *
     * The compiler currently resolves the entity date
     * type to "datepicker". Native HTML date input keeps
     * the runtime dependency-free.
     */
    if (widgetType === "datepicker") {
      return (
        <TextField
          key={question.id}
          type="date"
          label={question.questionText}
          helperText={
            question.helpText ?? undefined
          }
          required={question.isRequired}
          disabled={question.readOnly}
          value={value}
          onChange={(event) =>
            handleQuestionChange(
              question,
              event.target.value
            )
          }
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
      );
    }

    /*
     * Unknown/custom widgets currently fall back to
     * a text control.
     *
     * The important architectural point is that the
     * compiled question widget is still the source of
     * truth and can later be expanded into a widget
     * registry without changing questionnaire semantics.
     */
    return (
      <TextField
        key={question.id}
        label={question.questionText}
        helperText={
          question.helpText ?? undefined
        }
        placeholder={
          question.placeholder ?? undefined
        }
        required={question.isRequired}
        disabled={question.readOnly}
        value={value}
        onChange={(event) =>
          handleQuestionChange(
            question,
            event.target.value
          )
        }
        fullWidth
      />
    );
  };

  /*
   * Submit the accumulated canonical entity JSON
   * when a workflow transition is requested.
   *
   * Notice that this is NOT:
   *
   *   questionnaire JSON
   *
   * and NOT:
   *
   *   { questionId: answer }
   *
   * It is canonical entity-field JSON.
   */
  const handleTransition = (
    nextStep: string
  ) => {
    onSubmit?.(
      {
        ...formData,
      },
      nextStep
    );

    setCurrentStep(nextStep);
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

            <Chip
              label={`Status: ${currentStep}`}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Typography
            variant="subtitle1"
            color="text.secondary"
            mb={3}
          >
            {questionnaire.title}
          </Typography>

          <Typography
            variant="h6"
            gutterBottom
            color="text.secondary"
          >
            {step.title}
          </Typography>

          {step.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              mb={3}
            >
              {step.description}
            </Typography>
          )}

          {questionsForStep.length === 0 ? (
            <Alert severity="info">
              No questions are defined for this
              questionnaire step.
            </Alert>
          ) : (
            <Stack spacing={3}>
              {questionsForStep.map(
                (question) =>
                  renderQuestion(question)
              )}
            </Stack>
          )}

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
        </CardContent>
      </Card>
    </Box>
  );
};
