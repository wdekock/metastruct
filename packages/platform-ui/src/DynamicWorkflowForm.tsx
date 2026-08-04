import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

interface DynamicFormProps {
  manifest: any;
  onSubmit: (formData: any) => void;
}

export const DynamicWorkflowForm: React.FC<DynamicFormProps> = ({ manifest, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const properties = manifest?.entity?.properties || {};

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        {manifest?.entity?.title || 'Dynamic Entity Form'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Object.keys(properties).map((key) => {
          const field = properties[key];
          return (
            <TextField
              key={key}
              label={field.title || key}
              type={field.type === 'integer' || field.type === 'number' ? 'number' : 'text'}
              required={manifest?.entity?.required?.includes(key)}
              onChange={(e) => handleChange(key, e.target.value)}
              fullWidth
            />
          );
        })}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Submit Record
        </Button>
      </Box>
    </Paper>
  );
};
