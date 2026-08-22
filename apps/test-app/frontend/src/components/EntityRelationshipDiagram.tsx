import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import LinkIcon from '@mui/icons-material/Link';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { SystemManifest } from '../types/manifest';

interface Props {
  manifest: SystemManifest;
}

export const EntityRelationshipDiagram: React.FC<Props> = ({ manifest }) => {
  const entity = Object.values(manifest.entities)[0];
  const questionnaire = Object.values(manifest.questionnaires)[0];

  if (!entity) return null;

  return (
    <Paper sx={{ p: 3, mb: 4, background: '#0a192f', border: '1px solid #1e2d4a' }}>
      <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinkIcon /> 3. Entity-Relationship & Binding Diagram (ERD)
      </Typography>
      <Divider sx={{ my: 2, borderColor: '#1e2d4a' }} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" justifyContent="center">
        {/* Entity Node */}
        <Card variant="outlined" sx={{ minWidth: 280, p: 2, borderColor: '#90caf9', background: '#112240' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#90caf9' }}>
              {entity.entityName}
            </Typography>
            <Chip label="Entity SSOT" size="small" color="primary" variant="outlined" />
          </Box>
          <Divider sx={{ mb: 1.5 }} />
          {Object.values(entity.schema).map((field) => (
            <Box key={field.key} display="flex" justifyContent="space-between" alignItems="center" my={0.5}>
              <Box display="flex" alignItems="center" gap={0.5}>
                {field.isPrimaryKey && <KeyIcon sx={{ fontSize: 16, color: '#ffd700' }} />}
                {field.isForeignKey && <LinkIcon sx={{ fontSize: 16, color: '#f48fb1' }} />}
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {field.key}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {field.type}
              </Typography>
            </Box>
          ))}
        </Card>

        {/* Relationship Connection Line */}
        <Box textAlign="center" sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography variant="caption" color="secondary" sx={{ display: 'block', fontWeight: 'bold' }}>
            Binds To
          </Typography>
          <Box sx={{ width: 60, height: 2, backgroundColor: '#f48fb1', my: 1 }} />
          <Typography variant="caption" color="text.secondary">
            1 : N Mapping
          </Typography>
        </Box>

        {/* Questionnaire Node */}
        {questionnaire && (
          <Card variant="outlined" sx={{ minWidth: 280, p: 2, borderColor: '#f48fb1', background: '#112240' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f48fb1' }}>
                {questionnaire.title}
              </Typography>
              <AssignmentIcon color="secondary" fontSize="small" />
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Target: <strong>{questionnaire.targetEntity}</strong>
            </Typography>
            {Object.values(questionnaire.questions).map((q) => (
              <Box key={q.id} my={0.5} p={0.5} sx={{ background: '#0a192f', borderRadius: 1 }}>
                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                  {q.id} → {q.fieldKey}
                </Typography>
              </Box>
            ))}
          </Card>
        )}
      </Stack>
    </Paper>
  );
};