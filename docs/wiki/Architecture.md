# Metastruct Architecture

This is the normative design contract for Metastruct. Implementations, demos, and compatibility code must not create a competing source of truth.

## Authoritative Flow

```text
Entity JSON + UI JSON + Questionnaire JSON
                    |
                    v
       @metastruct/compiler + validation
                    |
                    v
              SystemManifest
             /              \
            v                v
     FastAPI backend       React UI
     SQLAlchemy CRUD       generated views
     OpenAPI/Swagger       and workflows
```

The source specifications are authoring inputs. The compiled `SystemManifest` is the immutable runtime contract. The backend and frontend consume the manifest; neither independently interprets the source specifications.

## Responsibilities

### Entity JSON

Defines business data: entity identity, UID primary key, fields, defaults, validation constraints, foreign keys, and relationships. It is the authoritative data model.

### UI JSON

Projects the entity model into presentation: sections, field order, labels, read-only state, widgets, and widget properties. It may reference entity fields but must not redefine their business meaning.

### Questionnaire JSON

Projects the entity model into guided data entry: questions mapped to entity fields, steps, step visibility conditions, initial step, and allowed transitions.

### Compiler

Validates the three source specifications, enforces semantic laws, and produces a manifest conforming to `Spec-Schema/SYSTEM_MANIFEST_SCHEMA.json`. Compilation is the only supported boundary between authoring specifications and runtime consumers.

### FastAPI backend

Loads the compiled manifest as its runtime source of truth. It uses SQLAlchemy so the database remains replaceable, derives tables and field handling from manifest entities, exposes CRUD and pagination, and publishes OpenAPI/Swagger documentation. It must not contain a second compiler or hard-coded entity model.

### React applications

Load the manifest and backend API. They generate CRUD forms, lists, relationship hierarchies, and questionnaire steps from manifest metadata. A screen that imports source JSON directly is a preview or authoring tool, not the production runtime path.

## Relationship Rule

Direct many-to-many relationships are not permitted by the semantic laws. Use an explicit association entity:

```text
Client <- ClientAddress -> Address -> AddressType
```

`AddressType` is a leaf lookup entity. The association entity owns the two foreign keys and makes the relationship queryable and database-neutral.

## Stage Completion Criteria

### Stage 1: Data and API

Complete only when a validated entity model is compiled into a manifest, loaded by FastAPI, persisted through SQLAlchemy, exposed through paginated CRUD endpoints, and visible in Swagger/OpenAPI.

### Stage 2: Generated UI

Complete only when UI definitions are applied to manifest entities to generate CRUD forms, list views, and relationship hierarchy views. The UI must read runtime metadata from the manifest/API rather than source JSON imports.

### Stage 3: Questionnaire Workflow

Complete only when questionnaire questions and steps are rendered from the manifest, field values map back to entity records, visibility conditions are evaluated, and allowed transitions are enforced.

## Non-Canonical Code

The repository may contain demos, previews, legacy adapters, or experimental services while development continues. These must be labeled clearly and must not be treated as evidence that a stage is complete. The canonical path above is the standard against which implementation work is evaluated.