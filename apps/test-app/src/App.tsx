import React from "react";
import { Box, Grid } from "@mui/material";
import { useManifest } from "./context/ManifestContext";
import { AppHeader } from "./components/layout/AppHeader";
import { EntityTreePanel } from "./components/tree/EntityTreePanel";
import { EntityDetailPanel } from "./components/crud/EntityDetailPanel";
import DynamicWorkflowForm from "./DynamicWorkflowForm";
import { SchemaBuilderCanvas } from "./components/designer/SchemaBuilderCanvas";

export const App: React.FC = () => {
  const { activeView } = useManifest();

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", minHeight: "100vh" }}>
      <AppHeader />

      {/* View 0: Tree-Driven CRUD */}
      {activeView === 0 && (
        <Grid container spacing={3} sx={{ height: "calc(100vh - 180px)" }}>
          <Grid item xs={12} md={4} sx={{ height: "100%" }}>
            <EntityTreePanel />
          </Grid>
          <Grid item xs={12} md={8} sx={{ height: "100%" }}>
            <EntityDetailPanel />
          </Grid>
        </Grid>
      )}

      {/* View 1: Workflow Stepper */}
      {activeView === 1 && (
        <Box sx={{ width: "100%" }}>
          <DynamicWorkflowForm />
        </Box>
      )}

      {/* View 2: Drag & Drop Schema Designer */}
      {activeView === 2 && (
        <Box sx={{ width: "100%" }}>
          <SchemaBuilderCanvas />
        </Box>
      )}
    </Box>
  );
};

export default App;
