import React from "react";
import { Box, Typography, Tabs, Tab, Paper, Chip } from "@mui/material";
import { useManifest } from "../../context/ManifestContext";

export const AppHeader: React.FC = () => {
  const { activeView, setActiveView, manifest } = useManifest();

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h5" fontWeight="700" color="primary">
            @metastruct Studio & Runtime
          </Typography>
          <Chip label={manifest.entityName || "Schema Active"} color="primary" variant="outlined" size="small" />
        </Box>
      </Box>
      <Tabs
        value={activeView}
        onChange={(_, val) => setActiveView(val)}
        indicatorColor="primary"
        textColor="primary"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="1. Tree-Driven CRUD" />
        <Tab label="2. Workflow Stepper" />
        <Tab label="3. Schema Designer (Drag & Drop)" />
      </Tabs>
    </Paper>
  );
};
