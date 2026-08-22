import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  compileSystem,
  EntitySpec,
  QuestionnaireSpec,
  UISpec,
} from "@metastruct/compiler";
import { DynamicWorkflowForm } from "@metastruct/platform-ui";

const entity: EntitySpec = {
  title: "Project Intake",
  version: "1.0.0",
  primaryKey: "id",
  properties: {
    id: {
      type: "uid",
      title: "Project ID",
    },
    name: {
      type: "string",
      title: "Project name",
    },
    email: {
      type: "string",
      title: "Email",
    },
  },
  required: ["name"],
};

const uiSpec: UISpec = {
  sections: [
    {
      title: "General Details",
      fields: [
        {
          key: "name",
          label: "Project name",
          required: true,
        },
        {
          key: "email",
          label: "Email",
          required: false,
        },
      ],
    },
  ],
};

const questionnaire: QuestionnaireSpec = {
  id: "project-intake",
  title: "Project Intake Questionnaire",
  targetEntity: "Project Intake",
  initialStep: "draft",
  questions: {
    name: {
      id: "name",
      entityName: "Project Intake",
      fieldKey: "name",
      questionText: "What is the project name?",
      isRequired: true,
      readOnly: false,
    },
    email: {
      id: "email",
      entityName: "Project Intake",
      fieldKey: "email",
      questionText: "What is the contact email?",
      isRequired: false,
      readOnly: false,
    },
  },
  steps: {
    draft: {
      id: "draft",
      title: "Draft",
      description: null,
      questionIds: ["name", "email"],
      visibilityCondition: null,
    },
    submitted: {
      id: "submitted",
      title: "Submitted",
      description: null,
      questionIds: [],
      visibilityCondition: null,
    },
  },
  transitions: {
    draft: ["submitted"],
    submitted: [],
  },
};

const manifest = compileSystem({
  systemId: "project-intake-system",
  version: "1.0.0",
  entities: {
    "Project Intake": entity,
  },
  uiSpecs: {
    "Project Intake": uiSpec,
  },
  questionnaires: {
    "project-intake": questionnaire,
  },
});

describe("DynamicWorkflowForm", () => {
  it("renders the questionnaire for the target entity", () => {
    render(<DynamicWorkflowForm manifest={manifest} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Project Intake",
      }),
    ).toBeTruthy();

    expect(
      screen.getByText("Project Intake Questionnaire"),
    ).toBeTruthy();

    expect(
      screen.getByRole("textbox", {
        name: "Project name",
      }),
    ).toBeTruthy();

    expect(
      screen.getByRole("textbox", {
        name: "Email",
      }),
    ).toBeTruthy();
  });

  it("captures questionnaire answers as canonical entity field JSON", () => {
    const onSubmit = vi.fn();

    render(
      <DynamicWorkflowForm
        manifest={manifest}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Project name",
      }),
      {
        target: {
          value: "Metastruct",
        },
      },
    );

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Email",
      }),
      {
        target: {
          value: "test@example.com",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /transition to submitted/i,
      }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      {
        name: "Metastruct",
        email: "test@example.com",
      },
      "submitted",
    );
  });
});