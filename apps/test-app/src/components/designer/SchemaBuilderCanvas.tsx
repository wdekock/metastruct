import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { SchemaFieldCanvas } from "@metastruct/studio-ui";
import { useManifest } from "../../context/ManifestContext";

export const SchemaBuilderCanvas: React.FC = () => {
  const { manifest } = useManifest();

  return (
    <Paper elevation={2} sx={{ p: 3, height: "100%", minHeight: 450, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="600" gutterBottom>
        Drag & Drop Schema Designer
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Visual manifest authoring canvas powered by <code>@metastruct/studio-ui</code>.
      </Typography>
      <Box sx={{ border: "2px dashed #1976d2", borderRadius: 2, p: 2, minHeight: 350, bgcolor: "background.default" }}>
        <SchemaFieldCanvas manifest={manifest} />
      </Box>
    </Paper>
  );
};