# @metastruct/compiler

`@metastruct/compiler` converts entity, UI, and questionnaire specifications into a normalized `SystemManifest`.

## Abilities

- Compile a complete system or one entity with `MasterCompiler` and `compileSingle()`.
- Validate input through `@metastruct/core` before compilation.
- Normalize entity fields, defaults, required flags, key metadata, validation rules, and layouts.
- Compile questionnaire questions, steps, visibility-condition metadata, initial steps, and transitions.
- Resolve labels and widgets from questionnaire settings, UI settings, or property-type defaults.
- Compile in memory in browser-oriented code through `BrowserCompiler`.

## Stage Role

This is the hand-off layer between all three stages: Entity JSON is the source model, UI JSON becomes presentation metadata, and Questionnaire JSON becomes workflow metadata.

## Current Boundary

The compiler emits a manifest but does not itself create FastAPI routes, persistence tables, or a fully widget-driven React form.
