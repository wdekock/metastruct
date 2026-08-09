import React from "react";
import { Paper, Typography, List, ListItem, ListItemButton, ListItemText, Divider } from "@mui/material";
import { useManifest } from "../../context/ManifestContext";

export const EntityTreePanel: React.FC = () => {
  const { manifest, selectedNode, setSelectedNode } = useManifest();
  const properties = manifest.properties || {};

  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%", overflowY: "auto", borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="600" gutterBottom>
        Entity Hierarchy
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {manifest.entityName}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <List disablePadding>
        {Object.entries(properties).map(([key, prop]: [string, any]) => {
          const isSelected = selectedNode?.id === key;
          return (
            <ListItem key={key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() =>
                  setSelectedNode({
                    id: key,
                    type: "field",
                    data: prop,
                  })
                }
                sx={{ borderRadius: 1 }}
              >
                <ListItemText
                  primary={prop.title || key}
                  secondary={`Type: ${prop.type}${prop.expression ? " (Computed)" : ""}`}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};
