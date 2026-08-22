# Client and Address Model

This example keeps the address as its own entity and connects it to a client through a foreign key.

```text
Client.address_id -> Address.address_id
```

The model uses:

- `Client.client_id` as the client UID primary key.
- `Address.address_id` as the address UID primary key.
- `Client.address_id` as a UID foreign key targeting `Address`.
- A `manyToOne` relationship from `Client` to `Address`.
- The inverse `oneToMany` relationship from `Address` to `Client`.

To get a client's address:

```text
1. Read the client record by client_id.
2. Read client.address_id.
3. Fetch Address by address_id.
```

The API form is:

```text
GET /api/v1/entities/Client/records/{client_id}
GET /api/v1/entities/Address/records/{address_id}
```

The current Stage 1 backend exposes the two records separately. Relationship expansion, such as embedding the address in the client response, belongs in the next API slice and should use the manifest relationship metadata rather than hard-coded field names.
