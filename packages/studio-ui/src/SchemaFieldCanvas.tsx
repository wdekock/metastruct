import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Grid,
  Chip,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Divider,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FunctionsIcon from "@mui/icons-material/Functions";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { SchemaField, EntitySchema } from "@metastruct/expression-engine";

interface SchemaFieldCanvasProps {
  schema: EntitySchema;
  onSchemaChange: (updatedSchema: EntitySchema) => void;
}

const COMPONENT_OPTIONS = [
  { label: "Text Field", value: "TextInput", type: "string" },
  { label: "Number Input", value: "NumberInput", type: "number" },
  { label: "Select Dropdown", value: "SelectInput", type: "string" },
  { label: "Array Repeater", value: "ArrayRepeater", type: "array" },
];

export const SchemaFieldCanvas: React.FC<SchemaFieldCanvasProps> = ({ schema, onSchemaChange }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const [fieldForm, setFieldForm] = useState<Partial<SchemaField>>({
    id: "",
    label: "",
    type: "string",
    component: "TextInput",
    required: false,
    calculationRule: "",
    visibilityRule: "",
  });

  const handleOpenAddDialog = () => {
    setEditingFieldId(null);
    setFieldForm({
      id: "",
      label: "",
      type: "string",
      component: "TextInput",
      required: false,
      calculationRule: "",
      visibilityRule: "",
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (fieldId: string) => {
    const field = schema?.fields?.[fieldId];
    if (!field) return;
    setEditingFieldId(fieldId);
    setFieldForm({ ...field });
    setDialogOpen(true);
  };

  const handleSaveField = () => {
    if (!fieldForm.id || !fieldForm.label) return;

    const newFieldId = fieldForm.id.trim().replace(/\s+/g, "_").toLowerCase();
    const updatedFields = { ...(schema?.fields || {}) };

    if (editingFieldId && editingFieldId !== newFieldId) {
      delete updatedFields[editingFieldId];
    }

    updatedFields[newFieldId] = {
      id: newFieldId,
      label: fieldForm.label,
      type: fieldForm.type || "string",
      component: fieldForm.component || "TextInput",
      required: !!fieldForm.required,
      calculationRule: fieldForm.calculationRule || undefined,
      visibilityRule: fieldForm.visibilityRule || undefined,
    } as SchemaField;

    const updatedSteps = [...(schema?.steps || [])];
    if (updatedSteps.length > 0) {
      const stepIndex = updatedSteps.findIndex((s) => s.fields.includes(newFieldId));
      if (stepIndex === -1) {
        updatedSteps[0] = {
          ...updatedSteps[0],
          fields: [...updatedSteps[0].fields, newFieldId],
        };
      }
    }

    onSchemaChange({
      ...schema,
      fields: updatedFields,
      steps: updatedSteps,
    });

    setDialogOpen(false);
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = { ...(schema?.fields || {}) };
    delete updatedFields[fieldId];

    const updatedSteps = (schema?.steps || []).map((step) => ({
      ...step,
      fields: step.fields.filter((f: string) => f !== fieldId),
    }));

    onSchemaChange({
      ...schema,
      fields: updatedFields,
      steps: updatedSteps,
    });
  };

  const fieldEntries = Object.entries(schema?.fields || {}) as [string, SchemaField][];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Canvas Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Schema Field Canvas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visually configure target entity fields, JSONata formulas, and conditional rules.
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Field
        </Button>
      </Box>

      {/* Field Cards Grid */}
      <Grid container spacing={2}>
        {fieldEntries.map(([fieldId, field]) => (
          <Grid item xs={12} sm={6} md={4} key={fieldId}>
            <Card variant="outlined" sx={{ borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {field.label}
                  </Typography>
                  <Chip
                    label={field.component}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: "0.7rem", height: 22 }}
                  />
                </Box>

                <Typography variant="caption" fontFamily="monospace" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                  id: {field.id}
                </Typography>

                <Stack spacing={0.5}>
                  {field.required && (
                    <Chip label="Required" size="small" color="error" variant="filled" sx={{ height: 20, width: "fit-content", fontSize: "0.65rem" }} />
                  )}

                  {field.calculationRule && (
                    <Box sx={{ display: "flex", alignItems: "center", bgcolor: "amber.50", color: "warning.dark", p: 0.75, borderRadius: 1 }}>
                      <FunctionsIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" fontFamily="monospace" noWrap title={field.calculationRule}>
                        {field.calculationRule}
                      </Typography>
                    </Box>
                  )}

                  {field.visibilityRule && (
                    <Box sx={{ display: "flex", alignItems: "center", bgcolor: "info.50", color: "info.dark", p: 0.75, borderRadius: 1 }}>
                      <VisibilityIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" fontFamily="monospace" noWrap title={field.visibilityRule}>
                        {field.visibilityRule}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>

              <Divider />

              <CardActions sx={{ justifyContent: "flex-end", px: 1.5, py: 0.5 }}>
                <IconButton size="small" onClick={() => handleOpenEditDialog(fieldId)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteField(fieldId)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Field Configuration Modal Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFieldId ? "Edit Schema Field" : "Create Schema Field"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Field ID (Key)"
                  value={fieldForm.id}
                  onChange={(e) => setFieldForm({ ...fieldForm, id: e.target.value })}
                  placeholder="e.g. tax_registration_number"
                  disabled={!!editingFieldId}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Display Label"
                  value={fieldForm.label}
                  onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                  placeholder="e.g. Tax Registration Number"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="UI Component Widget"
                  value={fieldForm.component}
                  onChange={(e) => {
                    const comp = COMPONENT_OPTIONS.find((c) => c.value === e.target.value);
                    setFieldForm({
                      ...fieldForm,
                      component: e.target.value,
                      type: comp ? (comp.type as SchemaField["type"]) : "string",
                    });
                  }}
                >
                  {COMPONENT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!fieldForm.required}
                      onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                    />
                  }
                  label="Mandatory Field"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle2" fontWeight="bold">
              Expression Engine Rules (JSONata Syntax)
            </Typography>

            <TextField
              fullWidth
              size="small"
              label="Calculation Formula (Optional)"
              value={fieldForm.calculationRule || ""}
              onChange={(e) => setFieldForm({ ...fieldForm, calculationRule: e.target.value })}
              placeholder="e.g. investmentAmount >= 1000000 ? 1.5 : 2.0"
              helperText="If specified, this field becomes auto-calculated and read-only."
            />

            <TextField
              fullWidth
              size="small"
              label="Visibility Condition (Optional)"
              value={fieldForm.visibilityRule || ""}
              onChange={(e) => setFieldForm({ ...fieldForm, visibilityRule: e.target.value })}
              placeholder="e.g. entityType = 'PTY_LTD' or entityType = 'TRUST'"
              helperText="Field will remain hidden until this expression evaluates to true."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleSaveField}>
            Save Field
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
