import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Stack,
  Alert,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  adaptToSystemManifest,
  SystemManifest,
  CompiledEntity,
} from "@metastruct/compiler";

export interface EntityListProps {
  manifest: unknown;
  entityName: string;
  /** Rows from the host app (API list result) */
  items: Record<string, unknown>[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onEdit?: (record: Record<string, unknown>) => void;
  onDelete?: (record: Record<string, unknown>) => void;
  /** Max columns from schema (default 6) */
  maxColumns?: number;
}

/**
 * Stage 2 — Entity list view.
 *
 * Columns come from compiled entity schema. Data and CRUD actions
 * are provided by the host app (no HTTP inside this package).
 */
export const EntityList: React.FC<EntityListProps> = ({
  manifest: rawManifest,
  entityName,
  items,
  loading = false,
  error = null,
  onRefresh,
  onEdit,
  onDelete,
  maxColumns = 6,
}) => {
  const manifest: SystemManifest = adaptToSystemManifest(rawManifest);
  const entity: CompiledEntity | undefined = manifest.entities[entityName];

  if (!entity) {
    return (
      <Alert severity="error">
        Entity &quot;{entityName}&quot; is not in SystemManifest.
      </Alert>
    );
  }

  const columns = Object.keys(entity.schema).slice(0, maxColumns);
  const pk = entity.primaryKey;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          {entity.entityName}
        </Typography>
        <Chip size="small" label={`${items.length} rows`} variant="outlined" />
        {onRefresh && (
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((key) => (
              <TableCell key={key}>
                {entity.schema[key]?.label || key}
              </TableCell>
            ))}
            {(onEdit || onDelete) && <TableCell width={96} />}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((row, idx) => {
            const id = String(row[pk] ?? idx);
            return (
              <TableRow key={id} hover>
                {columns.map((key) => (
                  <TableCell key={key}>{String(row[key] ?? "")}</TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    {onEdit && (
                      <IconButton size="small" onClick={() => onEdit(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton size="small" onClick={() => onDelete(row)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {!loading && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length + 1}>
                <Typography variant="body2" color="text.secondary">
                  No records.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};
