import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Box, Paper } from "@mui/material";
import { EntityTreeSidebar } from "./EntityTreeSidebar";
import { StudioStepperBar } from "./StudioStepperBar";
export const StudioLayoutShell = ({ children }) => {
    const [selectedNodeId, setSelectedNodeId] = useState("root_entity");
    const [stepperOrientation, setStepperOrientation] = useState("horizontal");
    const [activeStep, setActiveStep] = useState(0);
    const mockTreeNodes = [
        {
            id: "root_entity",
            label: "Fund Onboarding Model",
            type: "entity",
            children: [
                {
                    id: "entity_investor",
                    label: "Investor Profile",
                    type: "sub-entity",
                    children: [
                        { id: "wf_investor", label: "Onboarding Wizard", type: "workflow" },
                        { id: "rules_investor", label: "KYC Assertions", type: "rules" },
                    ],
                },
                { id: "entity_banking", label: "Banking & Settlement", type: "sub-entity" },
            ],
        },
    ];
    const mockSteps = [
        { id: "s1", label: "Entity Type", fieldCount: 4 },
        { id: "s2", label: "Registration Details", fieldCount: 8, hasVisibilityRule: true },
        { id: "s3", label: "Tax & Compliance", fieldCount: 5 },
    ];
    return (_jsxs(Box, { sx: { display: "flex", height: "100vh", bgcolor: "background.default" }, children: [_jsx(EntityTreeSidebar, { nodes: mockTreeNodes, selectedNodeId: selectedNodeId, onSelectNode: (id) => setSelectedNodeId(id), onAddEntity: () => console.log("Add entity triggered") }), _jsx(Box, { sx: { flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }, children: _jsxs(Box, { sx: { p: 3, flexGrow: 1, overflowY: "auto" }, children: [_jsx(StudioStepperBar, { steps: mockSteps, activeStepIndex: activeStep, orientation: stepperOrientation, onStepClick: (idx) => setActiveStep(idx), onOrientationChange: (mode) => setStepperOrientation(mode) }), _jsx(Paper, { variant: "outlined", sx: { p: 3, minHeight: 400 }, children: children || (_jsxs(Box, { sx: { color: "text.secondary" }, children: ["Active Node: ", _jsx("strong", { children: selectedNodeId }), " | Active Step:", " ", _jsx("strong", { children: mockSteps[activeStep]?.label })] })) })] }) })] }));
};
