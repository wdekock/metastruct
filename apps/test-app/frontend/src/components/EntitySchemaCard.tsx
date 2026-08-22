import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyIcon from '@mui/icons-material/VpnKey';
import { EntityManifest, SchemaField } from '../types/manifest';

interface Props {
  entity: EntityManifest;
}

export const EntitySchemaCard: React.FC<Props> = ({ entity }) => {
  // Normalize schema field list whether array or dictionary
  const fieldsList: SchemaField[] = Array.isArray(entity.fields)
    ? entity.fields
    : entity.schema
    ? Object.values(entity.schema)
    : [];

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" color="primary" gutterBottom>
        1. Compiled Entity Schema & SSOT Layout
      </Typography>
      <Box mb={2}>
        <Chip
          label={`Entity: ${entity.entityName}`}
          color="primary"
          variant="outlined"
          sx={{ mr: 1, fontWeight: 'bold' }}
        />
        <Chip
          icon={<KeyIcon />}
          label={`PK: ${entity.primaryKey}`}
          color="warning"
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, background: '#0a192f' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#90caf9' }}>Field Key</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#90caf9' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#90caf9' }}>Required</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fieldsList.map((f) => (
              <TableRow key={f.key}>
                <TableCell sx={{ fontFamily: 'monospace' }}>
                  {f.key}
                  {f.key === entity.primaryKey && (
                    <Chip label="PK" size="small" color="warning" sx={{ ml: 1, height: 16, fontSize: '0.65rem' }} />
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={f.type} size="small" color="info" variant="outlined" sx={{ height: 20 }} />
                </TableCell>
                <TableCell>{f.required ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {entity.layout && (
        <Accordion defaultExpanded sx={{ background: '#112240' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" color="secondary">UI Section Layouts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {entity.layout.map((sec, i) => (
              <Box key={i} mb={1}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold' }}>
                  {sec.title}
                </Typography>
                <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                  {sec.fields.map((fk) => (
                    <Chip key={fk} label={fk} size="small" variant="filled" />
                  ))}
                </Box>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};