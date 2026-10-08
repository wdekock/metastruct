import React from "react";
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import type { NormalizedField } from "@metastruct/compiler";

export interface EntityFieldControlProps {
  field: NormalizedField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  /** Hide primary key fields on create forms */
  hidePrimaryKey?: boolean;
}

/**
 * Stage 2 field control: renders a single NormalizedField from SystemManifest.schema.
 * Uses compiled widget.type when present; falls back by field.type.
 */
export const EntityFieldControl: React.FC<EntityFieldControlProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  hidePrimaryKey = false,
}) => {
  if (hidePrimaryKey && field.isPrimaryKey) {
    return null;
  }

  const widgetType = (field.widget?.type || "").toLowerCase();
  const readOnly = disabled || field.isPrimaryKey;

  if (widgetType === "checkbox" || field.type === "boolean") {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={readOnly}
          />
        }
        label={field.label}
      />
    );
  }

  if (widgetType === "select") {
    const options =
      (field.widget?.props?.options as { label: string; value: string }[]) ||
      [];
    return (
      <TextField
        select
        fullWidth
        size="small"
        label={field.label}
        required={field.required}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
      >
        <MenuItem value="">—</MenuItem>
        {options.map((opt) => (
          <MenuItem key={String(opt.value)} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  const inputType =
    widgetType === "number" || field.type === "number" || field.type === "integer"
      ? "number"
      : "text";

  return (
    <TextField
      fullWidth
      size="small"
      type={inputType}
      label={field.label}
      required={field.required}
      value={value ?? ""}
      onChange={(e) =>
        onChange(
          inputType === "number"
            ? e.target.value === ""
              ? ""
              : Number(e.target.value)
            : e.target.value
        )
      }
      disabled={readOnly}
      helperText={
        field.isForeignKey && field.foreignEntity
          ? `FK → ${field.foreignEntity}`
          : undefined
      }
    />
  );
};
