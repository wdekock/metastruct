import React from 'react';
import { Paper, Typography, Box, Card, TextField, Divider } from '@mui/material';
import { QuestionnaireManifest } from '../types/manifest';

interface Props {
  questionnaire: QuestionnaireManifest;
}

export const QuestionnaireRenderer: React.FC<Props> = ({ questionnaire }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        2. Questionnaire Questions & Cascaded Widgets
      </Typography>
      <Typography variant="subtitle1" color="primary">
        {questionnaire.title} (Target: {questionnaire.targetEntity})
      </Typography>
      <Divider sx={{ my: 2 }} />
      {Object.values(questionnaire.questions).map((q) => (
        <Card key={q.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>{q.questionText}</strong>
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Binds to: {q.entityName}.{q.fieldKey}
          </Typography>
          <TextField
            fullWidth
            margin="dense"
            disabled
            label={`Resolved Widget: ${q.widget.type}`}
            placeholder="Rendered by Questionnaire Engine"
            size="small"
          />
        </Card>
      ))}
    </Paper>
  );
};
