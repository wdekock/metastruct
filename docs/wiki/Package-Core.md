# @metastruct/core

`@metastruct/core` is the semantic validation layer for the canonical specifications.

## Abilities

- Validate entity, UI, and questionnaire documents with AJV-backed structural validators.
- Enforce cross-object laws that JSON Schema cannot express by itself.
- Check UID primary keys, foreign-key targets, relationship targets, and questionnaire field mappings.
- Return structured violations or allow the compiler to fail with `LawViolationError`.

## Stage Role

This package protects Stage 1's data model and validates the references used by Stages 2 and 3. It does not generate APIs, forms, or workflows.

## Current Boundary

It validates specification input before compilation. It is not currently a complete FastAPI/OpenAPI validation layer and does not enforce every rule in the browser form.
