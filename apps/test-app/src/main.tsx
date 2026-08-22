import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom/client";

// Core monorepo packages
import { adaptToSystemManifest } from "@metastruct/compiler";
import { ExpressionEngine } from "@metastruct/expression-engine";
import { SchemaFieldCanvas } from "@metastruct/studio-ui";
import CheckpointRoute from "./routes/CheckpointRoute";

import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Chip,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Button,
  Stack,
  Divider,
  TextField,
} from "@mui/material";

// Theme Configuration
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    background: { default: "#f4f6f8" },
  },
});

// --- SOURCE MANIFEST DEFINITIONS ---
const defaultDomainSchema = {
  entityName: "Capital Expenditure Request",
  properties: {
    projectName: { type: "string", title: "Project Name", required: true },
    department: { type: "string", title: "Department", required: true },
    unitCost: { type: "number", title: "Unit Cost ($)" },
    quantity: { type: "number", title: "Quantity" },
    totalCost: { type: "number", title: "Total Cost ($)", expression: "unitCost * quantity" },
  },
};

const defaultAppTreeWorkflow = {
  stepper: [
    { id: "general", title: "1. General Information", fields: ["projectName", "department"] },
    { id: "budget", title: "2. Financial Breakdown", fields: ["unitCost", "quantity", "totalCost"] },
    { id: "review", title: "3. Workflow Governance", fields: [] },
  ],
  workflow: {
    initialStep: "draft",
    transitions: {
      draft: [{ to: "submitted", label: "Submit Request", color: "primary" }],
      submitted: [
        { to: "approved", label: "Approve Request", color: "success" },
        { to: "rejected", label: "Reject Request", color: "error" },
      ],
      approved: [{ to: "draft", label: "Re-open Request", color: "warning" }],
      rejected: [{ to: "draft", label: "Revise & Resubmit", color: "warning" }],
    },
  },
};

export function UnifiedMasterDemo() {
  const [activeTab, setActiveTab] = useState(0); // 0: Runtime App, 1: Studio Builder, 2: Source JSONs

  // Source Manifest States
  const [schemaText, setSchemaText] = useState(JSON.stringify(defaultDomainSchema, null, 2));
  const [workflowText, setWorkflowText] = useState(JSON.stringify(defaultAppTreeWorkflow, null, 2));

  // Stepper & Workflow Engine State
  const [activeStep, setActiveStep] = useState(0);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState("draft");

  // Captured Form Data Payload
  const [formData, setFormData] = useState<Record<string, any>>({
    projectName: "Enterprise Server Fleet Upgrade",
    department: "IT Infrastructure",
    unitCost: 8500,
    quantity: 4,
  });

  // --- COMPILER & EXPRESSION ENGINE EVALUATION ---
  const { compiledManifest, parsedWorkflow, parsedSchema, expressionResults, parseError } = useMemo(() => {
    try {
      const pSchema = JSON.parse(schemaText);
      const pWorkflow = JSON.parse(workflowText);

      // 1. Run @metastruct/compiler normalization
      const systemManifest = adaptToSystemManifest({
        entity: pSchema,
        workflow: pWorkflow.workflow,
        ui: {
          sections: (pWorkflow.stepper || []).map((s: any) => ({
            title: s.title,
            fields: (s.fields || []).map((fKey: string) => ({
              key: fKey,
              label: pSchema.properties?.[fKey]?.title || fKey,
              type: pSchema.properties?.[fKey]?.type === "number" ? "number" : "text",
              required: pSchema.properties?.[fKey]?.required || false,
            })),
          })),
        },
      });

      // 2. Dynamic Evaluation using @metastruct/expression-engine
      const engine = new ExpressionEngine();
      const calculatedResults: Record<string, any> = {};

      if (pSchema.properties) {
        Object.entries(pSchema.properties).forEach(([key, prop]: [string, any]) => {
          if (prop.expression) {
            calculatedResults[key] = engine.evaluate(prop.expression, formData);
          }
        });
      }

      return {
        compiledManifest: systemManifest,
        parsedWorkflow: pWorkflow,
        parsedSchema: pSchema,
        expressionResults: calculatedResults,
        parseError: null,
      };
    } catch (err: any) {
      return {
        compiledManifest: null,
        parsedWorkflow: defaultAppTreeWorkflow,
        parsedSchema: defaultDomainSchema,
        expressionResults: {},
        parseError: err.message,
      };
    }
  }, [schemaText, workflowText, formData]);

  const steps = parsedWorkflow?.stepper || [];
  const currentStepInfo = steps[activeStep] || { title: "", fields: [] };

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleWorkflowTransition = (toState: string) => {
    setCurrentWorkflowStep(toState);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ pb: 6, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
        {/* TOP HEADER & NAVIGATION */}
        <Paper square elevation={1} sx={{ bgcolor: "#0f172a", color: "#fff", pt: 2, pb: 1, px: 3 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#38bdf8" }}>
                Metastruct Unified Suite Demo
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label="meta-core" color="default" size="small" sx={{ color: "#fff" }} />
                <Chip label="compiler" color="primary" size="small" />
                <Chip label="expression-engine" color="secondary" size="small" />
                <Chip label="platform-ui" color="success" size="small" />
                <Chip label="studio-ui" color="info" size="small" />
              </Stack>
            </Box>

            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              textColor="inherit"
              indicatorColor="primary"
            >
              <Tab label="1. Runtime App & Stepper (platform-ui)" />
              <Tab label="2. Visual Schema Builder (studio-ui)" />
              <Tab label="3. Compiler & Source JSON Pipeline" />
            </Tabs>
          </Container>
        </Paper>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {parseError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Compilation / Parsing Error: {parseError}
            </Alert>
          )}

          {/* TAB 1: RUNTIME APP & STEPPER (platform-ui) */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* LEFT: Live Stepper & Form */}
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {parsedSchema?.entityName || "Dynamic Entity"}
                    </Typography>
                    <Chip
                      label={`Workflow State: ${currentWorkflowStep}`}
                      color={
                        currentWorkflowStep === "approved"
                          ? "success"
                          : currentWorkflowStep === "rejected"
                          ? "error"
                          : "primary"
                      }
                      sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                    />
                  </Box>

                  {/* Stepper Navigation */}
                  <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((s: any, idx: number) => (
                      <Step key={s.id || idx}>
                        <StepButton onClick={() => setActiveStep(idx)}>
                          <StepLabel>{s.title}</StepLabel>
                        </StepButton>
                      </Step>
                    ))}
                  </Stepper>

                  <Divider sx={{ mb: 3 }} />

                  {/* Step Fields */}
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                    {currentStepInfo.title}
                  </Typography>

                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {currentStepInfo.fields.map((fKey: string) => {
                      const propDef = parsedSchema?.properties?.[fKey];
                      const isCalculated = Boolean(propDef?.expression);

                      return (
                        <TextField
                          key={fKey}
                          fullWidth
                          label={propDef?.title || fKey}
                          type={propDef?.type === "number" ? "number" : "text"}
                          disabled={isCalculated}
                          value={
                            isCalculated
                              ? expressionResults[fKey] !== undefined
                                ? `$${Number(expressionResults[fKey]).toLocaleString()}`
                                : ""
                              : formData[fKey] ?? ""
                          }
                          onChange={(e) => handleFieldChange(fKey, e.target.value)}
                          helperText={
                            isCalculated ? `Computed via expression: "${propDef.expression}"` : ""
                          }
                        />
                      );
                    })}

                    {currentStepInfo.fields.length === 0 && (
                      <Alert severity="info">
                        Review step complete. Select a workflow action below to transition state.
                      </Alert>
                    )}
                  </Stack>

                  {/* Stepper Controls */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                    <Button disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      disabled={activeStep === steps.length - 1}
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      Next Step
                    </Button>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Workflow Transitions */}
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
                    Workflow State Machine Transitions
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    {(
                      parsedWorkflow?.workflow?.transitions?.[currentWorkflowStep] || []
                    ).map((t: any) => (
                      <Button
                        key={t.to}
                        variant="contained"
                        color={t.color || "primary"}
                        onClick={() => handleWorkflowTransition(t.to)}
                      >
                        {t.label}
                      </Button>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              {/* RIGHT: Live Data & Engine Output */}
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, bgcolor: "#1e293b", color: "#f8fafc", minHeight: "100%" }}>
                  <Typography variant="subtitle2" sx={{ color: "#38bdf8" }} fontWeight="bold" gutterBottom>
                    🔍 CAPTURED DATA PAYLOAD & ENGINE STATE
                  </Typography>
                  <Divider sx={{ my: 1.5, borderColor: "#334155" }} />

                  <Box
                    component="pre"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "12px",
                      color: "#4ade80",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {JSON.stringify(
                      {
                        entity: parsedSchema?.entityName,
                        workflowState: currentWorkflowStep,
                        activeStepId: currentStepInfo.id,
                        capturedInputs: formData,
                        computedEngineState: expressionResults,
                      },
                      null,
                      2
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* TAB 2: VISUAL SCHEMA BUILDER (studio-ui) */}
          {activeTab === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Studio Schema Builder Canvas (@metastruct/studio-ui)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Author fields, layout sections, and expression rules visually.
              </Typography>
              <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, minHeight: "400px", p: 2 }}>
                <SchemaFieldCanvas manifest={compiledManifest} />
              </Box>
            </Paper>
          )}

          {/* TAB 3: COMPILER & SOURCE JSON PIPELINE */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                    Source 1: Domain Schema JSON
                  </Typography>
                  <TextField
                    multiline
                    fullWidth
                    rows={16}
                    value={schemaText}
                    onChange={(e) => setSchemaText(e.target.value)}
                    inputProps={{ style: { fontFamily: "monospace", fontSize: "12px" } }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                    Source 2: App Tree & Workflow JSON
                  </Typography>
                  <TextField
                    multiline
                    fullWidth
                    rows={16}
                    value={workflowText}
                    onChange={(e) => setWorkflowText(e.target.value)}
                    inputProps={{ style: { fontFamily: "monospace", fontSize: "12px" } }}
                  />
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {window.location.pathname === "/checkpoint" ? (
      <CheckpointRoute />
    ) : (
      <UnifiedMasterDemo />
    )}
  </React.StrictMode>
);