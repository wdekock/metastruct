import React, { useState, useEffect } from "react";
import { Box, Paper, Grid, Divider, Typography, Tab, Tabs } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BuildIcon from "@mui/icons-material/Build";

import { EntitySchema, ExpressionEngine } from "@metastruct/expression-engine";
import { PlatformFieldRenderer } from "@metastruct/platform-ui";
import { StudioLayoutShell, SchemaFieldCanvas } from "@metastruct/studio-ui";

const INITIAL_SCHEMA: EntitySchema = {
  $schemaVersion: "1.0.0",
  id: "fund_onboarding_schema",
  title: "Fund Onboarding Questionnaire",
  fields: {
    entityType: {
      id: "entityType",
      type: "string",
      label: "Entity Legal Structure",
      component: "SelectInput",
      options: [
        { label: "Private Company (Pty Ltd)", value: "PTY_LTD" },
        { label: "Trust", value: "TRUST" },
        { label: "Individual Investor", value: "INDIVIDUAL" },
      ],
      required: true,
    },
    investmentAmount: {
      id: "investmentAmount",
      type: "number",
      label: "Initial Investment ($)",
      component: "NumberInput",
      required: true,
    },
    managementFee: {
      id: "managementFee",
      type: "number",
      label: "Calculated Fee Rate (%)",
      component: "NumberInput",
      calculationRule: "investmentAmount >= 1000000 ? 1.5 : 2.0",
    },
  },
  steps: [
    {
      id: "step_1",
      title: "General Configuration",
      fields: ["entityType", "investmentAmount", "managementFee"],
    },
  ],
};

export const MetastructWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"builder" | "preview">("builder");
  const [schema, setSchema] = useState<EntitySchema>(INITIAL_SCHEMA);
  const [formData, setFormData] = useState<Record<string, unknown>>({
    entityType: "PTY_LTD",
    investmentAmount: 500000,
  });
  const [computedState, setComputedState] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visibleFields, setVisibleFields] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const engine = new ExpressionEngine(schema);

    engine.evaluate(formData).then((res) => {
      if (!isMounted) return;
      setComputedState(res.computedData || {});
      setErrors(res.errors || {});
      setVisibleFields(res.visibleFields || []);
    });

    return () => {
      isMounted = false;
    };
  }, [schema, formData]);

  const handleFieldChange = (fieldId: string, val: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
  };

  return (
    <StudioLayoutShell>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_: React.SyntheticEvent, val: "builder" | "preview") => setActiveTab(val)}
        >
          <Tab icon={<BuildIcon />} iconPosition="start" label="Studio Field Editor" value="builder" />
          <Tab icon={<PlayArrowIcon />} iconPosition="start" label="Live Form Preview" value="preview" />
        </Tabs>
      </Box>

      {activeTab === "builder" && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <SchemaFieldCanvas schema={schema as any} onSchemaChange={(updated) => setSchema(updated as EntitySchema)} />
        </Paper>
      )}

      {activeTab === "preview" && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {schema.title}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {Object.entries(schema.fields || {}).map(([fieldId, field]) => {
                if (!visibleFields.includes(fieldId)) return null;

                return (
                  <PlatformFieldRenderer
                    key={fieldId}
                    field={field}
                    value={computedState[fieldId]}
                    error={errors[fieldId]}
                    onChange={(val: unknown) => handleFieldChange(fieldId, val)}
                    disabled={!!field.calculationRule}
                  />
                );
              })}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "grey.900", color: "grey.100", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="secondary.main">
                Live Evaluated Output State
              </Typography>
              <Box
                component="pre"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  m: 0,
                  p: 1.5,
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 1,
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(computedState, null, 2)}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </StudioLayoutShell>
  );
};

export default MetastructWorkbench;
