import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import clientSource from "../../sources/client_entity_spec.json";

export const StageOneRoute: React.FC = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="primary">
          Stage 1 of 3
        </Typography>
        <Typography variant="h3" component="h1" gutterBottom>
          Data model
        </Typography>
        <Typography color="text.secondary">
          The application starts with an external JSON definition. Later stages consume this model rather than creating a second source of truth.
        </Typography>
      </Box>

      <Alert severity="success">
        Loaded entity definition from <strong>sources/client_entity_spec.json</strong>
      </Alert>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5">{clientSource.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.keys(clientSource.properties).length} defined fields, linked to Address through ClientAddress
            </Typography>
          </Box>

          {Object.entries(clientSource.properties).map(([key, field]) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderTop: 1,
                borderColor: "divider",
                pt: 1.5,
              }}
            >
              <Box>
                <Typography fontWeight="medium">{field.title || key}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {key}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip label={field.type} size="small" variant="outlined" />
                {field.required && <Chip label="required" size="small" color="primary" />}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" href="/client-address">
          View client address model
        </Button>
        <Button variant="contained" href="/demo">
          Open full demo
        </Button>
        <Button variant="outlined" href="/checkpoint">
          View package checkpoint
        </Button>
      </Stack>
    </Stack>
  </Container>
);

export default StageOneRoute;
