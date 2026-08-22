import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import { useSystemManifest } from "../../hooks/useSystemManifest";

export const EntityDetailPanel: React.FC = () => {
  const { manifest, records, commitRecord } = useSystemManifest();
  const [formState, setFormState] = useState<Record<string, string>>({});

  const vendorRecords = records?.["Vendor"] || [];
  const questions = manifest?.questionnaires?.["vendor-onboarding"]?.questions || [
    { id: "q1", prompt: "What is the official registered company name?", targetField: "company_name" },
    { id: "q2", prompt: "What is the primary corporate tax identification number?", targetField: "tax_number" },
  ];

  const handleFieldChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.company_name) return;

    if (commitRecord) {
      commitRecord("Vendor", formState);
    }
    setFormState({});
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 4. Interactive UI Form Playground */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          4. Interactive UI Form Playground
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Test dynamic form rendering generated from ui_spec.json and validated against entity_spec.json.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {questions.map((q: any) => (
            <Box key={q.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{q.prompt}</Typography>
              <Typography variant="caption" color="primary" display="block" sx={{ mb: 0.5 }}>
                Binds to: Vendor.{q.targetField}
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formState[q.targetField] || ""}
                onChange={(e) => handleFieldChange(q.targetField, e.target.value)}
              />
            </Box>
          ))}

          <Button
            type="submit"
            variant="contained"
            disableElevation
            startIcon={<StorageIcon />}
            sx={{ mt: 1 }}
          >
            Commit Record to Vendor SSOT
          </Button>
        </Box>
      </Paper>

      {/* 5. Live Database Records */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          5. Live Database Records (Vendor)
        </Typography>

        {vendorRecords.length === 0 ? (
          <Alert severity="info">No database records found for entity: Vendor</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Vendor ID</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Tax Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorRecords.map((row: any, idx: number) => (
                  <TableRow key={row.vendor_id || idx}>
                    <TableCell>{row.vendor_id}</TableCell>
                    <TableCell>{row.company_name}</TableCell>
                    <TableCell>{row.tax_number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default EntityDetailPanel;
