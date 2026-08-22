import React from 'react';
import { Container, Grid, Typography, Alert, Box } from '@mui/material';
import { useSystemManifest } from './hooks/useSystemManifest';
import { QuestionnaireRenderer } from './components/QuestionnaireRenderer';
import { EntitySchemaCard } from './components/EntitySchemaCard';

export const App: React.FC = () => {
  const { manifest, compiledAt } = useSystemManifest();

  // Extract the first entity and questionnaire for demonstration purposes
  const entity = manifest?.entities
    ? Object.values(manifest.entities)[0]
    : null;

  const questionnaire = manifest?.questionnaires
    ? Object.values(manifest.questionnaires)[0]
    : null;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          metastruct: Modular Speclink Engine
        </Typography>
      </Box>

      {compiledAt ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          System Manifest re-compiled from modular specs at {compiledAt}!
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Waiting for compiler engine connection...
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Entity Layout Panel */}
        <Grid item xs={12} md={6}>
          {entity ? (
            <EntitySchemaCard entity={entity} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No entities detected in manifest.
            </Typography>
          )}
        </Grid>

        {/* Questionnaire Layout Panel */}
        <Grid item xs={12} md={6}>
          {questionnaire ? (
            <QuestionnaireRenderer questionnaire={questionnaire} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No questionnaires detected in manifest.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};