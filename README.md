# Metastruct

**Metastruct** is a schema-driven toolkit for describing entities, questionnaires, layouts, and workflows, then compiling those specifications into a normalized system manifest.

The repository is organized as a TypeScript monorepo with a small Python runtime service. The specifications in `Spec-Schema/` are the contract; package implementations should be treated as the current supported behavior.

## What It Can Do

- Define entity data models with typed properties, required fields, UID primary keys, foreign keys, and relationships.
- Define questionnaires that map questions to entity fields, group questions into steps, set an initial step, and restrict allowed transitions.
- Define UI sections, field labels, read-only state, widget choices, and widget properties.
- Validate JSON-shaped specifications structurally with AJV and enforce cross-object domain laws.
- Compile entity, UI, and questionnaire specifications into a normalized `SystemManifest`.
- Resolve widget and label defaults from question-level settings, UI settings, or field types.
- Evaluate expression-engine schemas with JSONata calculation and visibility rules, repeated evaluation passes, error collection, and circular-dependency detection.
- Render a compiled entity/questionnaire as a React + Material UI workflow form.

## Staged Application Model

Metastruct is being developed as a sequence of connected stages. Each stage consumes the contract produced by the stage before it:

```text
1. Entity JSON -> FastAPI CRUD + OpenAPI/Swagger
2. UI JSON -> generated CRUD/list/hierarchy views
3. Questionnaire JSON -> step-based data-entry workflow
```

The entity model remains authoritative. UI JSON projects that model into widgets, lists, CRUD screens, and relationship-based hierarchy views. Questionnaire JSON then projects the same model into guided steps. The compiler's `SystemManifest` is the intended hand-off between these stages.

The normative design rules are documented in [`docs/wiki/Architecture.md`](docs/wiki/Architecture.md). That page defines the intended system and takes precedence over demo or compatibility code when the implementation is incomplete.

### Stage 1: Data Model and API

Entity JSON defines fields, keys, validation constraints, foreign keys, and relationships. The FastAPI runtime exposes CRUD behavior and automatic OpenAPI documentation. The current test runtime includes an in-memory CRUD implementation; durable persistence and full compiler-to-runtime integration remain future work.

### Stage 2: UI and Generated Views

UI JSON defines sections, labels, read-only state, widget choices, and widget properties. The intended output is generated CRUD forms, list views, and a hierarchy/tree derived from entity relationships. The current packages provide compiler layout normalization, Material UI widgets, and studio shell components; the default workflow form still renders its layout with basic text inputs.

### Stage 3: Questionnaire and Steps

Questionnaire JSON maps questions to entity fields, groups them into steps, defines an initial step, and restricts transitions. The compiler preserves this workflow information, and the platform form exposes allowed transitions. Step visibility evaluation, complete question-driven rendering, and full validation enforcement are not yet implemented in the default form path.

## Packages

### `@metastruct/core`

Provides structural validation and semantic law checks. It validates entity, UI, and questionnaire specifications and reports violations for invalid primary keys, foreign keys, relationships, missing references, and questionnaire mappings. The validator can return all violations or be used by the compiler to fail compilation with `LawViolationError`.

### `@metastruct/compiler`

Provides `MasterCompiler`, `BrowserCompiler`, `compileSystem`, and `adaptToSystemManifest`. It validates a compile context, normalizes entity fields and layouts, compiles questionnaire steps and transitions, applies widget defaults, and emits a manifest with `systemId`, `version`, `compiledAt`, entities, and questionnaires.

### `@metastruct/expression-engine`

Provides `ExpressionEngine` and `detectCyclicDependencies`. It supports JSONata calculation rules and visibility rules that reference `$state.<field>`, detects cycles before evaluation, performs up to five convergence passes, and returns computed values, visibility maps, visible fields, and field errors.

### `@metastruct/platform-ui`

Provides `DynamicWorkflowForm`, a compiled-manifest React form, plus a widget registry containing text, number, select, and array-repeater components. The current `DynamicWorkflowForm` path renders the compiled layout with Material UI text inputs and exposes allowed workflow transitions through `onSubmit`.

### `@metastruct/studio-ui`

Provides reusable React/MUI studio surfaces: entity tree navigation, stepper/layout shell components, schema field editing canvas, and exports from `platform-ui`.

### `metastruct-runtime`

Contains the FastAPI runtime service and a generic repository foundation. The service is present in the repository, but the TypeScript compiler and UI are currently the most complete documented integration path.

## Specification Model

The four JSON Schemas under `Spec-Schema/` describe these contracts:

| Specification | Main abilities |
| --- | --- |
| Entity | Properties, types, defaults, validation bounds/patterns, required fields, primary keys, foreign keys, and relationships |
| Questionnaire | Field-mapped questions, help text, placeholders, question widgets, ordered steps, step visibility conditions, initial step, and transitions |
| UI | Sections and field layout, labels, read-only state, widget type, and widget props |
| System Manifest | Compiled entities and questionnaires with normalized schema/layout data and compilation metadata |

See [`docs/wiki/Architecture.md`](docs/wiki/Architecture.md) for the normative design, [`docs/wiki/Schema-and-Compilation.md`](docs/wiki/Schema-and-Compilation.md) for detailed schema mapping, and [`docs/wiki/Runtime-Capabilities.md`](docs/wiki/Runtime-Capabilities.md) for verified runtime behavior and current limitations.

Package documentation is available in the wiki drafts: [`core`](docs/wiki/Package-Core.md), [`compiler`](docs/wiki/Package-Compiler.md), [`expression-engine`](docs/wiki/Package-Expression-Engine.md), [`platform-ui`](docs/wiki/Package-Platform-UI.md), [`studio-ui`](docs/wiki/Package-Studio-UI.md), and [`meta-core`](docs/wiki/Package-Meta-Core.md).

## Development

```bash
pnpm install
pnpm build
```

Build output is generated into package `dist/` directories and is ignored by Git. Source maps and other generated declaration artifacts are also ignored.
