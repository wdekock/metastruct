Spot on. Placing `build_manifest.ts` inside `domain-contracts` violates the separation between **code/tooling** and **data/contracts**.

If `domain-contracts` is meant to be a pure data repository containing business specifications (JSONs), embedding compilation scripts or TypeScript dependencies into it pollutes the data boundary.

---

## The Correct Architectural Boundary

Compilation logic belongs in a dedicated **compiler tool package** (or directly inside the backend/cli tools).

* **`packages/meta-core`**: The Meta-Schema Definitions (the "law").


* **`packages/compiler`**: The Build Engine (contains `build_manifest.ts` / `master_compiler.py`, dereferencing logic, DFS graph checks).


* **`packages/domain-contracts`**: Pure JSON Data Specifications & Compiled Artifacts (zero executable code).



---

## Clean Monorepo Structure

```text
passport-platform/
├── packages/
│   │
│   ├── meta-core/                       # ⚙️ SYSTEM LAWS & METASCHEMAS
│   │   ├── specs/                       # Draft-07 Meta-Schemas (L0 to L5)[cite: 12, 13, 14, 15, 16, 17]
│   │   └── index.ts                     # Exports raw meta-schemas
│   │
│   ├── compiler/                        # 🛠️ THE BUILD ENGINE & CLI TOOLING
│   │   ├── src/
│   │   │   ├── master_compiler.ts       # Cross-layer validation & DFS checks[cite: 1]
│   │   │   ├── bundler.ts               # $ref dereferencing (@apidevtools/json-schema-ref-parser)[cite: 11]
│   │   │   └── build_manifest.ts        # CLI entrypoint (reads domain-contracts, emits dist)
│   │   ├── package.json                 # Node dependencies (ref-parser, ajv, ts-node)
│   │   └── tsconfig.json
│   │
│   └── domain-contracts/                # 📄 PURE DATA CONTRACTS (No build scripts or code)
│       ├── src/                         # Raw JSON specs (written by BAs / Devs)
│       │   ├── entities/                # Layer 1 (.entity.json)[cite: 1]
│       │   ├── ui/                      # Layer 2 (.ui.json)[cite: 1]
│       │   └── workflows/               # Layer 4 (.workflow.json)[cite: 1]
│       └── dist/                        # 📦 COMPILED OUTPUT ARTIFACTS
│           └── vendor_onboarding.manifest.json  # Emitted by @passport/compiler[cite: 1]

```

---

## Execution Pipeline

When running a compilation pass, you invoke the compiler CLI tool against the domain contracts directory:

```bash
# Executed from project root
npx passport-compiler compile \
  --meta ./packages/meta-core/specs \
  --in ./packages/domain-contracts/src \
  --out ./packages/domain-contracts/dist

```

### Why this is best practice:

1. **`domain-contracts` remains pure JSON:** It can be versioned, edited by non-technical BAs via `studio-ba-tools`, or fetched independently without pulling in Node.js build dependencies.


2. **Reusable Compiler Utility:** `packages/compiler` can be imported as a dependency by `studio-ba-tools` (for real-time preview validation in the sandbox) or run in CI/CD pipelines.