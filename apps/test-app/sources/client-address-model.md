# Client and Address Model

This example keeps addresses as their own entity, allows a client to have multiple addresses, and allows an address to be associated with multiple clients.

```text
Client <- ClientAddress -> Address -> AddressType
```

The many-to-many relationship is represented by the explicit `ClientAddress` association entity. The core validator rejects a direct `manyToMany` relationship and requires this pattern.

The model uses:

- `Client.client_id` as the client UID primary key.
- `Address.address_id` as the address UID primary key.
- `ClientAddress.client_id` as a UID foreign key targeting `Client`.
- `ClientAddress.address_id` as a UID foreign key targeting `Address`.
- `Address.address_type_id` as a UID foreign key targeting `AddressType`.
- `AddressType` as a leaf lookup entity with no outgoing relationships.
- `oneToMany` relationships from `Client` and `Address` to `ClientAddress`.
- `manyToOne` relationships from `ClientAddress` to `Client` and `Address`.

To get a client's address:

```text
1. Read the client record by `client_id`.
2. List `ClientAddress` records filtered by `client_id`.
3. Fetch each `Address` by its `address_id`.
4. Fetch the address's `AddressType` by `address_type_id` when needed.
```

The API form is:

```text
GET /api/v1/entities/Client/records/{client_id}
GET /api/v1/entities/ClientAddress/records?page=1&page_size=25
GET /api/v1/entities/Address/records/{address_id}
GET /api/v1/entities/AddressType/records/{address_type_id}
```

The current Stage 1 backend exposes records separately. Relationship filtering and expansion should use the manifest relationship metadata rather than hard-coded field names.
