# @metastruct/platform-ui

`@metastruct/platform-ui` provides React and Material UI runtime components.

## Abilities

- Render a compiled entity layout with `DynamicWorkflowForm`.
- Initialize fields from compiled defaults and collect form data.
- Display questionnaire title and current workflow state.
- Expose allowed next-step transitions through the `onSubmit` callback.
- Provide registry components for text, number, select, and array-repeater fields.

## Stage Role

This package is the runtime foundation for Stage 2 generated forms and Stage 3 questionnaire workflows.

## Current Boundary

The current default form renders layout fields as basic Material UI text fields. It does not yet evaluate questionnaire step visibility or route every compiled widget through `PlatformFieldRenderer`.
