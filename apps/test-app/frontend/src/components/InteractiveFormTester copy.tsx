import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { EntityManifest } from '../types/manifest';

interface Props {
  entity: EntityManifest;
}

export const InteractiveFormTester: React.FC<Props> = ({ entity }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submittedData, setSubmittedData] = useState<Record<string, any> | null>(null);

  const handleChange = (fieldKey: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedData(formData);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        4. Interactive UI Form Playground
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Test dynamic form rendering generated from <code>ui_spec.json</code> and validated against <code>entity_spec.json</code>.
      </Typography>

      <form onSubmit={handleSubmit}>
        {entity.layout.map((section, idx) => (
          <Accordion key={idx} defaultExpanded sx={{ mb: 2, background: '#112240' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" color="primary">{section.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {section.fields.map((fKey) => {
                  const schemaField = entity.schema[fKey];
                  if (!schemaField) return null;

                  return (
                    <Grid item xs={12} sm={6} key={fKey}>
                      <TextField
                        fullWidth
                        label={schemaField.label}
                        type={schemaField.type === 'number' ? 'number' : 'text'}
                        required={schemaField.required}
                        value={formData[fKey] || ''}
                        onChange={(e) => handleChange(fKey, e.target.value)}
                        variant="outlined"
                        size="small"
                        helperText={`Key: ${fKey} | Widget: ${schemaField.widget.type}`}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button type="submit" variant="contained" color="primary" startIcon={<PlayArrowIcon />}>
            Test Submit Payload
          </Button>
        </Box>
      </form>

      {submittedData && (
        <Box mt={3}>
          <Alert severity="info" sx={{ mb: 1 }}>Generated Entity State Payload:</Alert>
          <Paper variant="outlined" sx={{ p: 2, background: '#050c1a', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontFamily: 'monospace', color: '#90caf9' }}>
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};