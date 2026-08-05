"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicWorkflowForm = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const compiler_1 = require("@metastruct/compiler");
const DynamicWorkflowForm = ({ manifest: rawManifest, onSubmit }) => {
    const manifest = (0, compiler_1.adaptToSystemManifest)(rawManifest);
    // Initialize form state with compiled default values
    const [formData, setFormData] = (0, react_1.useState)(() => {
        const initial = {};
        for (const [key, field] of Object.entries(manifest.schema)) {
            initial[key] = field.defaultValue ?? "";
        }
        return initial;
    });
    // Track active workflow step
    const [currentStep, setCurrentStep] = (0, react_1.useState)(manifest.workflowState.initialStep || "draft");
    const allowedNextSteps = manifest.workflowState.allowedTransitions[currentStep] || [];
    const handleInputChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };
    const handleTransition = (nextStep) => {
        setCurrentStep(nextStep);
        if (onSubmit) {
            onSubmit(formData, nextStep);
        }
    };
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { maxWidth: 800, mx: "auto", p: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.Card, { elevation: 2, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", component: "h2", fontWeight: "bold", children: manifest.entityName }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: `Status: ${currentStep}`, color: "primary", variant: "outlined" })] }), (0, jsx_runtime_1.jsx)(material_1.Stack, { spacing: 4, children: manifest.layout.map((section, idx) => ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, color: "text.secondary", children: section.title }), (0, jsx_runtime_1.jsx)(material_1.Stack, { spacing: 2, children: section.fields.map((field) => ((0, jsx_runtime_1.jsx)(material_1.TextField, { label: field.label, required: field.required, value: formData[field.key] ?? "", onChange: (e) => handleInputChange(field.key, e.target.value), fullWidth: true }, field.key))) })] }, idx))) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { mt: 4, pt: 2, borderTop: "1px solid #eee", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", color: "text.secondary", mb: 1.5, children: "Workflow Actions" }), allowedNextSteps.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "info", children: "No further workflow transitions available from this state." })) : ((0, jsx_runtime_1.jsx)(material_1.Stack, { direction: "row", spacing: 2, children: allowedNextSteps.map((nextStep) => ((0, jsx_runtime_1.jsxs)(material_1.Button, { variant: "contained", onClick: () => handleTransition(nextStep), children: ["Transition to ", nextStep] }, nextStep))) }))] })] }) }) }));
};
exports.DynamicWorkflowForm = DynamicWorkflowForm;
