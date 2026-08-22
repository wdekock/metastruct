# Runtime Capabilities

## Expression Engine

`ExpressionEngine` accepts an expression schema with fields, calculation rules, and visibility rules. Expressions may reference values through `$state.fieldName` or `state.fieldName`.

It can:

- Extract field dependencies from expressions.
- Reject circular dependency graphs before evaluation.
- Evaluate calculations and visibility predicates using JSONata.
- Re-run evaluation for up to five passes so dependent calculations converge.
- Return computed values, visible fields, visibility maps, and per-field errors.

Malformed expressions are recorded as field errors during evaluation where possible. Visibility evaluation errors default the field to visible and report the error.

## Platform UI

`DynamicWorkflowForm` consumes a compiled or adaptable system manifest, selects the first questionnaire and its target entity, initializes fields from compiled defaults, renders the compiled entity layout, and exposes allowed next-step transitions through `onSubmit(data, nextStep)`.

The widget registry separately provides Material UI components for text, number, select, and array-repeater fields. The array repeater supports adding/removing entries and editing its current name and tax-ID subfields.

## Current Boundaries

- The current workflow form renders layout fields with Material UI text inputs; it does not yet delegate every compiled widget to `PlatformFieldRenderer`.
- Questionnaire step visibility conditions are compiled and preserved, but the current workflow form does not evaluate them.
- Entity validation rules are normalized into the manifest; the current form does not display or enforce all of them client-side.
- The Python FastAPI runtime and generic repository are present, but their end-to-end contract with the TypeScript manifest compiler is not yet documented as a complete integration.

These boundaries distinguish schema capabilities from capabilities currently exercised by the default UI path.