import React from 'react';
import { Box, Card, Typography, Chip } from '@mui/material';
import { SchemaField } from '../types/manifest';

interface Props {
  fieldKey: string;
  schemaField?: SchemaField;
}

export const LayoutSection: React.FC<Props> = ({ fieldKey, schemaField }) => {
  if (!schemaField) {
    return (
      <Card variant="outlined" sx={{ p: 1, mb: 1, borderColor: 'error.main' }}>
        <Typography variant="body2" color="error">
          Missing Schema Ref: {fieldKey}
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ p: 1, mb: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2">
            <strong>{fieldKey}</strong> ({schemaField.label})
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
};