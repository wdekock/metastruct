import React from "react";
import { Alert, Box, Chip, Container, Stack, Typography } from "@mui/material";
import { MasterCompiler } from "@metastruct/compiler";
import { ExpressionEngine } from "@metastruct/expression-engine";

const loadedPackages = [
  "@metastruct/compiler",
  "@metastruct/expression-engine",
  "@metastruct/platform-ui",
  "@metastruct/studio-ui",
];

export const CheckpointRoute: React.FC = () => {
  const compilerLoaded = Boolean(new MasterCompiler());
  const expressionEngineLoaded = Boolean(new ExpressionEngine());

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary">
            Test app checkpoint
          </Typography>
          <Typography variant="h3" component="h1" gutterBottom>
            Metastruct consumer route
          </Typography>
          <Typography color="text.secondary">
            This route is intentionally isolated from the existing demo. It proves that the test app can load the Metastruct packages before we reorganize anything else.
          </Typography>
        </Box>

        <Alert severity={compilerLoaded && expressionEngineLoaded ? "success" : "error"}>
          {compilerLoaded && expressionEngineLoaded
            ? "Compiler and expression engine loaded successfully."
            : "A Metastruct package failed to load."}
        </Alert>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {loadedPackages.map((packageName) => (
            <Chip key={packageName} label={packageName} variant="outlined" />
          ))}
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Planned flow: Entity JSON to API, UI JSON to generated views, then Questionnaire JSON to step workflow.
        </Typography>
      </Stack>
    </Container>
  );
};

export default CheckpointRoute;
