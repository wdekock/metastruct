import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DynamicWorkflowForm } from "@metastruct/platform-ui";

const manifest = {
  entity: {
    title: "Project Intake",
    properties: {
      name: { type: "string", title: "Project name" },
      email: { type: "string", title: "Email" }
    },
    required: ["name"]
  },
  ui: {
    sections: [
      {
        title: "General Details",
        fields: [
          { key: "name", label: "Project name", required: true },
          { key: "email", label: "Email", required: false }
        ]
      }
    ]
  },
  workflow: {
    initialStep: "draft",
    transitions: {
      draft: ["submitted"],
      submitted: []
    }
  }
};

describe("DynamicWorkflowForm", () => {
  it("renders the entity title and workflow action", () => {
    render(<DynamicWorkflowForm manifest={manifest} />);

    expect(screen.getByText("Project Intake")).toBeTruthy();
    expect(screen.getByRole("button", { name: /transition to submitted/i })).toBeTruthy();
  });
});
