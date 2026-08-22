# @metastruct/meta-core

`@metastruct/meta-core` contains an AJV-based manifest validator.

## Abilities

- Load a system-manifest schema.
- Validate manifest objects and return readable error messages.
- Provide a boundary check for compiled metadata before a consumer uses it.

## Stage Role

This package sits after compilation and can protect the hand-off from the compiler to API, UI, or workflow consumers.

## Current Boundary

Its embedded manifest shape is not fully aligned with the current `Spec-Schema/SYSTEM_MANIFEST_SCHEMA.json` and the compiler's multi-entity manifest shape. It should be treated as a compatibility/legacy validator until those contracts are unified.
