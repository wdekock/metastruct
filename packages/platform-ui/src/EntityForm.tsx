import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  Chip,
} from "@mui/material";
import {
  adaptToSystemManifest,
  SystemManifest,
  CompiledEntity,
  NormalizedField,
} from "@metastruct/compiler";
import { EntityFieldControl } from "./EntityFieldControl";

export interface EntityFormProps {
  /** Compiled SystemManifest (or adaptable shape) */
  manifest: unknown;
  /** Entity key in manifest.entities */
  entityName: string;
  /** When set, form is edit mode (primary key read-only) */
  initialValues?: Record<string, unknown>;
  /**
   * Called on Save. App wires this to CRUD API
   * (POST create or PUT update). Platform-ui does not call HTTP.
   */
  onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

/**
 * Stage 2 — Entity CRUD form.
 *
 * Renders layout + schema from SystemManifest for one entity.
 * No questionnaire steps. Submit is handed to the host app.
 */
export const EntityForm: React.FC<EntityFormProps> = ({
  manifest: rawManifest,
  entityName,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
}) => {
  const manifest: SystemManifest = adaptToSystemManifest(rawManifest);
  const entity: CompiledEntity | undefined = manifest.entities[entityName];

  if (!entity) {
    return (
      <Alert severity="error">
        Entity &quot;{entityName}&quot; is not in SystemManifest.
      </Alert>
    );
  }

  const isEdit = Boolean(initialValues && initialValues[entity.primaryKey]);

  const defaults = useMemo(() => {
    const data: Record<string, unknown> = {};
    for (const [key, field] of Object.entries(entity.schema)) {
      if (initialValues && key in initialValues) {
        data[key] = initialValues[key];
      } else if (field.defaultValue !== null && field.defaultValue !== undefined) {
        data[key] = field.defaultValue;
      } else if (field.type === "boolean") {
        data[key] = false;
      } else {
        data[key] = "";
      }
    }
    return data;
  }, [entity, initialValues]);

  const [formData, setFormData] = useState<Record<string, unknown>>(defaults);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSubmit?.(formData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const layout =
    entity.layout?.length > 0
      ? entity.layout
      : [
          {
            title: "Fields",
            fields: Object.keys(entity.schema).filter(
              (k) => !entity.schema[k].isPrimaryKey
            ),
          },
        ];

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Card elevation={2}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" fontWeight="bold">
              {entity.entityName}
            </Typography>
            <Chip
              size="small"
              label={isEdit ? "Edit" : "Create"}
              color={isEdit ? "secondary" : "primary"}
              variant="outlined"
            />
          </Stack>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Stage 2 entity form — layout from SystemManifest (not questionnaire).
          </Typography>

          <Stack spacing={3}>
            {layout.map((section) => (
              <Box key={section.title}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {section.title}
                </Typography>
                <Stack spacing={2}>
                  {section.fields.map((fieldKey) => {
                    const field: NormalizedField | undefined =
                      entity.schema[fieldKey];
                    if (!field) return null;
                    return (
                      <EntityFieldControl
                        key={field.key}
                        field={field}
                        value={formData[field.key]}
                        onChange={(v) => setField(field.key, v)}
                        disabled={isEdit && field.isPrimaryKey}
                        hidePrimaryKey={!isEdit}
                      />
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={2} mt={3}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || !onSubmit}
            >
              {saving
                ? "Saving…"
                : submitLabel || (isEdit ? "Update" : "Create")}
            </Button>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
