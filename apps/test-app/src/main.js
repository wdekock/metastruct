import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
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
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(DynamicWorkflowForm, { manifest: manifest }) }));
