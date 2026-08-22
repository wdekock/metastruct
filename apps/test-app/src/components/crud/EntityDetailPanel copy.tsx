import React from "react";
import { Paper, Typography, Box, TextField, Button, Stack, Divider, Alert } from "@mui/material";
import { useManifest } from "../../context/ManifestContext";

export const EntityDetailPanel: React.FC = () => {
  const { selectedNode } = useManifest();

  if (!selectedNode) {
    return (
      <Paper elevation={2} sx={{ p: 4, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2 }}>
        <Typography color="text.secondary">Select an entity or field from the tree on the left.</Typography>
      </Paper>
    );
  }

  const { id, data } = selectedNode;

  return (
    <Paper elevation={2} sx={{ p: 3, height: "100%", overflowY: "auto", borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="600" gutterBottom>
        Field Details: {data.title || id}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Field Identifier: <code>{id}</code>
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={2.5} maxWidth={500}>
        <TextField label="Title" defaultValue={data.title || id} fullWidth size="small" />
        <TextField label="Data Type" defaultValue={data.type} fullWidth size="small" />
        {data.expression && (
          <TextField
            label="Computed Expression"
            defaultValue={data.expression}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
        )}
        <Alert severity="info" sx={{ mt: 1 }}>
          Edits here directly mutate the live manifest context.
        </Alert>
        <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
          <Button variant="contained" color="primary">
            Save Changes
          </Button>
          <Button variant="outlined" color="error">
            Delete Field
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};