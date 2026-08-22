# @metastruct/expression-engine

`@metastruct/expression-engine` evaluates dynamic field behavior using JSONata.

## Abilities

- Compile calculation and visibility rules from an expression schema.
- Extract `$state.field` dependencies.
- Detect circular dependencies before evaluation.
- Re-evaluate dependent calculations for up to five passes.
- Return computed values, visibility maps, visible fields, and field errors.

## Stage Role

This package supplies dynamic behavior for generated UI and questionnaire steps, such as calculated values and conditional visibility.

## Current Boundary

It currently consumes its own expression-oriented schema shape rather than the compiler's canonical `SystemManifest` directly. Integration with the default compiled workflow form is incomplete.
