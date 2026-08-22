import { describe, it, expect, vi } from "vitest";
import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
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

// System Manifest interface placeholder for test execution
interface MockQuestion {
  id: string;
  entityName: string;
  fieldKey: string;
  questionText: string;
  isRequired?: boolean;
}

interface DynamicWorkflowFormProps {
  manifest: any;
  onSubmit?: (data: Record<string, unknown>, currentStep: string) => void;
}

// Standalone test target component matching runtime questionnaire execution
const DynamicWorkflowForm: React.FC<DynamicWorkflowFormProps> = ({
  manifest,
  onSubmit,
}) => {
  const questionnaireKey = Object.keys(manifest.questionnaires)[0];
  const questionnaire = manifest.questionnaires[questionnaireKey];
  const entity = manifest.entities[questionnaire.targetEntity];

  const [currentStep, setCurrentStep] = useState<string>(
    questionnaire.initialStep
  );
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const step = questionnaire.steps[currentStep];
  const questions: MockQuestion[] = step.questionIds.map(
    (qId: string) => questionnaire.questions[qId]
  );
  const allowedTransitions: string[] =
    questionnaire.allowedTransitions[currentStep] ?? [];

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
    if (errors[fieldKey]) {
      setErrors((prev) => ({ ...prev, [fieldKey]: "" }));
    }
  };

  const handleTransition = (nextStep: string) => {
    const newErrors: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.isRequired && !formData[q.fieldKey]) {
        newErrors[q.fieldKey] = `${q.questionText} is required.`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit?.({ ...formData }, nextStep);
    setCurrentStep(nextStep);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography variant="h5">{entity.entityName}</Typography>
            <Chip label={`Status: ${currentStep}`} color="primary" />
          </Box>
          <Typography variant="subtitle1">{questionnaire.title}</Typography>
          <Typography variant="h6">{step.title}</Typography>

          <Stack spacing={3} my={2}>
            {questions.map((q) => (
              <TextField
                key={q.id}
                label={q.questionText}
                required={q.isRequired}
                error={Boolean(errors[q.fieldKey])}
                helperText={errors[q.fieldKey]}
                value={(formData[q.fieldKey] as string) ?? ""}
                onChange={(e) => handleFieldChange(q.fieldKey, e.target.value)}
                fullWidth
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={2} mt={3}>
            {allowedTransitions.map((next) => (
              <Button
                key={next}
                variant="contained"
                onClick={() => handleTransition(next)}
              >
                Transition to {next}
              </Button>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

const mockManifest = {
  entities: {
    Project: {
      entityName: "Project",
      schema: { name: { type: "string" }, budget: { type: "number" } },
    },
  },
  questionnaires: {
    projectIntake: {
      id: "projectIntake",
      title: "Project Intake Form",
      targetEntity: "Project",
      initialStep: "draft",
      allowedTransitions: { draft: ["submitted"] },
      steps: {
        draft: {
          title: "General Information",
          questionIds: ["q_name", "q_budget"],
        },
      },
      questions: {
        q_name: {
          id: "q_name",
          entityName: "Project",
          fieldKey: "name",
          questionText: "Project Name",
          isRequired: true,
        },
        q_budget: {
          id: "q_budget",
          entityName: "Project",
          fieldKey: "budget",
          questionText: "Project Budget",
          isRequired: false,
        },
      },
    },
  },
};

describe("DynamicWorkflowForm", () => {
  it("renders active step and question metadata", () => {
    render(<DynamicWorkflowForm manifest={mockManifest} />);

    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("Project Intake Form")).toBeInTheDocument();
    expect(screen.getByText("General Information")).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
  });

  it("captures field state and emits canonical entity submission on transition", () => {
    const handleSubmit = vi.fn();
    render(
      <DynamicWorkflowForm manifest={mockManifest} onSubmit={handleSubmit} />
    );

    fireEvent.change(screen.getByLabelText(/Project Name/i), {
      target: { value: "Metastruct" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Transition to submitted/i })
    );

    expect(handleSubmit).toHaveBeenCalledWith(
      { name: "Metastruct" },
      "submitted"
    );
  });

  it("prevents transition when required questionnaire fields are empty", () => {
    const handleSubmit = vi.fn();
    render(
      <DynamicWorkflowForm manifest={mockManifest} onSubmit={handleSubmit} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Transition to submitted/i })
    );

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Project Name is required.")).toBeInTheDocument();
  });
});