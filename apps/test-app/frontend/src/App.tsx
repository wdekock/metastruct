import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { useSystemManifest } from './hooks/useSystemManifest';
import { QuestionnaireRenderer } from './components/QuestionnaireRenderer';
import { EntitySchemaCard } from './components/EntitySchemaCard';
import { EntityRelationshipDiagram } from './components/EntityRelationshipDiagram';
import { InteractiveFormTester } from './components/InteractiveFormTester';
import { DatabaseCrudManager } from './components/DatabaseCrudManager';

export const App: React.FC = () => {
  const { manifest, compiledAt } = useSystemManifest();
  const [selectedEntityKey, setSelectedEntityKey] = useState<string>('');

  const entityKeys = manifest?.entities ? Object.keys(manifest.entities) : [];

  // Keep selected entity active or pick first upon manifest refresh
  useEffect(() => {
    if (entityKeys.length > 0 && (!selectedEntityKey || !manifest?.entities[selectedEntityKey])) {
      setSelectedEntityKey(entityKeys[0]);
    }
  }, [manifest, entityKeys, selectedEntityKey]);

  const activeEntity = selectedEntityKey && manifest?.entities ? manifest.entities[selectedEntityKey] : null;

  const activeQuestionnaire = manifest?.questionnaires
    ? Object.values(manifest.questionnaires).find((q) => q.targetEntity === activeEntity?.entityName) ||
      Object.values(manifest.questionnaires)[0]
    : null;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          metastruct: Speclink Engine & ERD Test Suite
        </Typography>

        {entityKeys.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="entity-select-label">Active Entity</InputLabel>
            <Select
              labelId="entity-select-label"
              value={selectedEntityKey}
              label="Active Entity"
              onChange={(e) => setSelectedEntityKey(e.target.value)}
            >
              {entityKeys.map((key) => (
                <MenuItem key={key} value={key}>
                  {manifest?.entities[key].entityName || key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {compiledAt ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          System Manifest re-compiled from modular specs at {compiledAt}!
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Connecting to compiler stream...
        </Alert>
      )}

      {/* Dynamic ERD Diagram */}
      {manifest && <EntityRelationshipDiagram manifest={manifest} />}

      {/* Dynamic Live Database CRUD Manager */}
      {activeEntity && <DatabaseCrudManager entity={activeEntity} />}

      {/* Schema Inspector, Questionnaire, and Dynamic Form Tester */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {activeEntity && <EntitySchemaCard entity={activeEntity} />}
        </Grid>
        <Grid item xs={12} md={6}>
          {activeQuestionnaire && <QuestionnaireRenderer questionnaire={activeQuestionnaire} />}
        </Grid>
        <Grid item xs={12}>
          {activeEntity && <InteractiveFormTester entity={activeEntity} />}
        </Grid>
      </Grid>
    </Container>
  );
};