# Schema and Compilation

Metastruct uses separate specifications so data shape, user questions, and presentation can evolve independently.

## Entity Specification

An entity has a title, version, primary key, and property map. Properties support a type, title, default, length or numeric constraints, regular-expression patterns, and foreign-key metadata. Relationships can express one-to-one, one-to-many, many-to-one, or many-to-many intent.

Semantic laws currently require:

- The primary key exists and has type `uid`.
- A primary key cannot also be a foreign key.
- Foreign keys have type `uid`, name a real target entity, and point to a target with a valid UID primary key.
- Direct `manyToMany` relationships are rejected; use an explicit association entity.

## Questionnaire Specification

A questionnaire targets an entity and maps each question to an entity name and field key. Questions can define text, help text, placeholder, required/read-only state, and a widget override. Steps define question membership and optional visibility conditions. `initialStep` and `transitions` define the workflow graph.

The compiler preserves question mappings, step definitions, visibility-condition data, and allowed transitions in the compiled manifest. It verifies that every question entity and field reference resolves.

## UI Specification

UI specifications define sections. Each section contains field keys or field objects with labels, read-only state, widget type, and widget props. Supported schema widget names include `text`, `number`, `select`, `datepicker`, `checkbox`, `textarea`, `radio`, and `custom`.

The compiler uses UI sections as entity layout. Widget resolution follows this order:

1. Questionnaire question widget, when compiling a question.
2. UI field widget.
3. A default based on the entity property type: text, number, checkbox, or datepicker.

## System Manifest

`MasterCompiler.compile()` produces a manifest containing `systemId`, `version`, `compiledAt`, normalized entities, and normalized questionnaires. Entity fields include labels, required state, primary/foreign-key flags, defaults, widgets, and validation rules. The convenience `compileSingle()` method compiles one entity with optional UI and questionnaire specifications.

## Validation Boundary

AJV structural checks and cross-object law checks happen before compilation. Invalid specifications fail fast with `LawViolationError`. JSON Schema describes allowed document structure; semantic laws enforce invariants that require context, such as resolving a foreign entity or questionnaire field.