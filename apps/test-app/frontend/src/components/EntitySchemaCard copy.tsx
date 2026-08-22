import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EntityManifest } from '../types/manifest';

interface Props {
  entity: EntityManifest;
}

export const EntitySchemaCard: React.FC<Props> = ({ entity }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        1. Compiled Entity Schema & SSOT Layout
      </Typography>

      <Box>
        <Typography variant="subtitle1" color="primary">
          Entity: {entity.entityName} (PK: {entity.primaryKey})
        </Typography>
        <Divider sx={{ my: 2 }} />

        {entity.layout.map((section, idx) => (
          <Accordion key={idx} defaultExpanded sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">{section.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {section.fields.map((fKey: string) => {
                const schemaField = entity.schema[fKey];

                // Fallback for fields referenced in layout but missing in schema
                if (!schemaField) {
                  return (
                    <Card key={fKey} variant="outlined" sx={{ p: 1, mb: 1, borderColor: 'error.main' }}>
                      <Typography variant="body2" color="error">
                        Missing Schema Ref: {fKey}
                      </Typography>
                    </Card>
                  );
                }

                return (
                  <Card key={fKey} variant="outlined" sx={{ p: 1, mb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2">
                          <strong>{fKey}</strong> ({schemaField.label})
                        </Typography>
                        {schemaField.required && (
                          <Typography variant="caption" color="error" display="block">
                            * Required
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={schemaField.widget?.type || 'text'}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </Card>
                );
              })}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Paper>
  );
};