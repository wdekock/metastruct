// packages/platform-ui/src/WidgetRegistry.tsx
import React from "react";
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { SchemaField } from "@metastruct/expression-engine";

export interface WidgetProps {
  field: SchemaField;
  value: any;
  error?: string;
  onChange: (val: any) => void;
  disabled?: boolean;
}

export const StandardTextInput: React.FC<WidgetProps> = ({ field, value, error, onChange, disabled }) => (
  <TextField
    fullWidth
    label={field.label}
    value={value ?? ""}
    error={!!error}
    helperText={error || field.placeholder}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    variant="outlined"
    size="small"
  />
);

export const StandardNumberInput: React.FC<WidgetProps> = ({ field, value, error, onChange, disabled }) => (
  <TextField
    fullWidth
    type="number"
    label={field.label}
    value={value ?? ""}
    error={!!error}
    helperText={error}
    onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
    disabled={disabled}
    variant="outlined"
    size="small"
  />
);

export const StandardSelectInput: React.FC<WidgetProps> = ({ field, value, error, onChange, disabled }) => (
  <TextField
    fullWidth
    select
    label={field.label}
    value={value ?? ""}
    error={!!error}
    helperText={error}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    variant="outlined"
    size="small"
  >
    {(field.options || []).map((opt) => (
      <MenuItem key={opt.value} value={opt.value}>
        {opt.label}
      </MenuItem>
    ))}
  </TextField>
);

/**
 * Array Repeater Widget: Handles dynamic multi-item entry 
 * (e.g. List of Directors, Ultimate Beneficial Owners, or Bank Accounts)
 */
export const ArrayRepeaterWidget: React.FC<WidgetProps> = ({ field, value = [], onChange, disabled }) => {
  const items: Record<string, any>[] = Array.isArray(value) ? value : [];

  const handleAddItem = () => {
    onChange([...items, {}]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleFieldChange = (index: number, subFieldKey: string, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [subFieldKey]: val };
    onChange(updated);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 2, bgcolor: "grey.50" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {field.label} ({items.length})
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          variant="contained"
          disableElevation
          onClick={handleAddItem}
          disabled={disabled}
        >
          Add {field.label.replace(/s$/, "")}
        </Button>
      </Box>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
          No entries added yet. Click above to add an item.
        </Typography>
      ) : (
        items.map((item, idx) => (
          <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 1.5, bgcolor: "background.paper", position: "relative" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                Entry #{idx + 1}
              </Typography>
              <IconButton size="small" color="error" onClick={() => handleRemoveItem(idx)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Standard Text input for repeated items */}
            <TextField
              fullWidth
              size="small"
              label="Full Name / Entity Name"
              value={item.name || ""}
              onChange={(e) => handleFieldChange(idx, "name", e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Tax ID / Registration Number"
              value={item.taxId || ""}
              onChange={(e) => handleFieldChange(idx, "taxId", e.target.value)}
            />
          </Paper>
        ))
      )}
    </Paper>
  );
};

export const WIDGET_REGISTRY: Record<string, React.FC<WidgetProps>> = {
  TextInput: StandardTextInput,
  NumberInput: StandardNumberInput,
  SelectInput: StandardSelectInput,
  ArrayRepeater: ArrayRepeaterWidget,
};

export const PlatformFieldRenderer: React.FC<WidgetProps> = (props) => {
  const Component = WIDGET_REGISTRY[props.field.component] || StandardTextInput;
  return (
    <Box sx={{ mb: 2 }}>
      <Component {...props} />
    </Box>
  );
};