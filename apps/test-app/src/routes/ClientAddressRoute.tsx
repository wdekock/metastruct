import React from "react";
import { Alert, Box, Button, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import client from "../../sources/client_entity_spec.json";
import address from "../../sources/address_entity_spec.json";
import clientAddress from "../../sources/client_address_entity_spec.json";
import addressType from "../../sources/address_type_entity_spec.json";

const clientFields = Object.entries(client.properties);
const addressFields = Object.entries(address.properties);

export const ClientAddressRoute: React.FC = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="primary">Stage 1 data model</Typography>
        <Typography variant="h3" component="h1" gutterBottom>
          Client address lookup
        </Typography>
        <Typography color="text.secondary">
          A client and an address are connected through ClientAddress. AddressType classifies the address and remains a leaf lookup entity.
        </Typography>
      </Box>

      <Alert severity="info">
        Relationship: <strong>Client</strong> and <strong>Address</strong> are linked through <strong>ClientAddress</strong>.
      </Alert>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <ModelCard title={client.title} primaryKey={client.primaryKey} fields={clientFields} />
        <ModelCard title={address.title} primaryKey={address.primaryKey} fields={addressFields} />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <ModelCard
          title={clientAddress.title}
          primaryKey={clientAddress.primaryKey}
          fields={Object.entries(clientAddress.properties)}
        />
        <ModelCard
          title={addressType.title}
          primaryKey={addressType.primaryKey}
          fields={Object.entries(addressType.properties)}
        />
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Lookup sequence</Typography>
        <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
{`GET /api/v1/entities/Client/records/{client_id}
            |
            | ClientAddress.client_id
            v
GET /api/v1/entities/ClientAddress/records?page=1&page_size=25
            |
            | ClientAddress.address_id
            v
GET /api/v1/entities/Address/records/{address_id}
            |
            | Address.address_type_id
            v
GET /api/v1/entities/AddressType/records/{address_type_id}`}
        </Box>
      </Paper>

      <Button variant="outlined" href="/">Back to Stage 1</Button>
    </Stack>
  </Container>
);

function ModelCard({
  title,
  primaryKey,
  fields,
}: {
  title: string;
  primaryKey: string;
  fields: [string, { title?: string; type?: string; isForeignKey?: boolean; foreignEntity?: string | null }][];
}) {
  return (
    <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
      <Typography variant="h5">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Primary key: {primaryKey}
      </Typography>
      <Stack spacing={1}>
        {fields.map(([key, field]) => (
          <Box key={key} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Typography>{field.title || key}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={field.type} size="small" variant="outlined" />
              {field.isForeignKey && <Chip label={`-> ${field.foreignEntity}`} size="small" color="primary" />}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export default ClientAddressRoute;
