import React, { useState } from "react";
import { Box, Paper } from "@mui/material";
import { EntityTreeSidebar, EntityTreeNode } from "./EntityTreeSidebar";
import { StudioStepperBar, StepperStep } from "./StudioStepperBar";

export const StudioLayoutShell: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [selectedNodeId, setSelectedNodeId] = useState("root_entity");
  const [stepperOrientation, setStepperOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [activeStep, setActiveStep] = useState(0);

  const mockTreeNodes: EntityTreeNode[] = [
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

  const mockSteps: StepperStep[] = [
    { id: "s1", label: "Entity Type", fieldCount: 4 },
    { id: "s2", label: "Registration Details", fieldCount: 8, hasVisibilityRule: true },
    { id: "s3", label: "Tax & Compliance", fieldCount: 5 },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      <EntityTreeSidebar
        nodes={mockTreeNodes}
        selectedNodeId={selectedNodeId}
        onSelectNode={(id) => setSelectedNodeId(id)}
        onAddEntity={() => console.log("Add entity triggered")}
      />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box sx={{ p: 3, flexGrow: 1, overflowY: "auto" }}>
          <StudioStepperBar
            steps={mockSteps}
            activeStepIndex={activeStep}
            orientation={stepperOrientation}
            onStepClick={(idx) => setActiveStep(idx)}
            onOrientationChange={(mode) => setStepperOrientation(mode)}
          />

          <Paper variant="outlined" sx={{ p: 3, minHeight: 400 }}>
            {children || (
              <Box sx={{ color: "text.secondary" }}>
                Active Node: <strong>{selectedNodeId}</strong> | Active Step:{" "}
                <strong>{mockSteps[activeStep]?.label}</strong>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

