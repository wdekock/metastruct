import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { EntityManifest, SchemaField } from '../types/manifest';

interface Props {
  entity: EntityManifest;
}

export const DatabaseCrudManager: React.FC<Props> = ({ entity }) => {
  const [records, setRecords] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});

  const fieldsList: SchemaField[] = Array.isArray(entity.fields)
    ? entity.fields
    : entity.schema
    ? Object.values(entity.schema)
    : [];

  const apiBase =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000'
      : `${window.location.protocol}//${window.location.host.replace('-3000', '-8000')}`;

  const fetchRecords = useCallback(async () => {
    if (!entity.entityName) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/db/${entity.entityName}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (e) {
      console.error('Failed to fetch DB records:', e);
    } finally {
      setLoading(false);
    }
  }, [apiBase, entity.entityName]);

  // Re-fetch records immediately whenever entity changes or re-compiles
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords, entity]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormState({});
    setOpenModal(true);
  };

  const handleOpenEdit = (record: Record<string, any>) => {
    setEditingId(record[entity.primaryKey]);
    setFormState(record);
    setOpenModal(true);
  };

  const handleDelete = async (recordId: string) => {
    await fetch(`${apiBase}/api/db/${entity.entityName}/${recordId}`, {
      method: 'DELETE',
    });
    fetchRecords();
  };

  const handleSave = async () => {
    const isEdit = Boolean(editingId);
    const url = isEdit
      ? `${apiBase}/api/db/${entity.entityName}/${editingId}`
      : `${apiBase}/api/db/${entity.entityName}`;

    await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formState),
    });

    setOpenModal(false);
    fetchRecords();
  };

  return (
    <Paper sx={{ p: 3, mb: 4, background: '#0a192f', border: '1px solid #1e2d4a' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon /> 5. Live Database Records ({entity.entityName})
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {loading && <CircularProgress size={20} />}
          <IconButton onClick={fetchRecords} color="primary" size="small">
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate} size="small">
            Create {entity.entityName} Record
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} sx={{ background: '#112240' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {fieldsList.map((f) => (
                <TableCell key={f.key} sx={{ fontWeight: 'bold', color: '#90caf9' }}>
                  {f.label || f.key}{' '}
                  {f.key === entity.primaryKey && (
                    <Chip label="PK" size="small" color="warning" sx={{ height: 16, fontSize: '0.65rem' }} />
                  )}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#90caf9' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={fieldsList.length + 1} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No database records found for entity: {entity.entityName}
                </TableCell>
              </TableRow>
            ) : (
              records.map((rec, i) => (
                <TableRow key={rec[entity.primaryKey] || i}>
                  {fieldsList.map((f) => (
                    <TableCell key={f.key}>{rec[f.key] !== undefined ? String(rec[f.key]) : '-'}</TableCell>
                  ))}
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(rec)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(rec[entity.primaryKey])}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? `Edit ${entity.entityName}` : `Create ${entity.entityName}`}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {fieldsList.map((f) => (
              <TextField
                key={f.key}
                label={f.label || f.key}
                type={f.type === 'number' ? 'number' : 'text'}
                fullWidth
                size="small"
                value={formState[f.key] ?? ''}
                disabled={editingId !== null && f.key === entity.primaryKey}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value,
                  })
                }
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Record
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
