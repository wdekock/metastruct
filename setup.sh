#!/usr/bin/env bash
set -e

echo "🚀 Bootstrapping Metastruct Open-Core Repository..."

# 1. Create Directories
mkdir -p packages/meta-core/src
mkdir -p packages/compiler/src
mkdir -p packages/platform-ui/src
mkdir -p services/platform-runtime/app/db

# 2. Root Files
cat << 'EOF' > package.json
{
  "name": "metastruct-root",
  "private": true,
  "scripts": {
    "build": "pnpm --filter \"./packages/**\" run build",
    "test": "pnpm --filter \"./packages/**\" run test",
    "clean": "pnpm --filter \"./packages/**\" run clean"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vitest": "^1.2.0"
  }
}
EOF

cat << 'EOF' > pnpm-workspace.yaml
packages:
  - 'packages/*'
EOF

cat << 'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
EOF

cat << 'EOF' > LICENSE
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

Copyright 2026 Metastruct Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
EOF

cat << 'EOF' > README.md
# Metastruct

**Metastruct** is a deterministic, schema-driven framework and execution engine for declarative system design.

## Packages
- `@metastruct/meta-core`: Layer 0–5 meta-schema laws and validator.
- `@metastruct/compiler`: Master & Browser compiler tools.
- `@metastruct/platform-ui`: React + Material UI dynamic runtime driver.
- `metastruct-runtime`: FastAPI backend execution engine.
EOF

# 3. Package: meta-core
cat << 'EOF' > packages/meta-core/package.json
{
  "name": "@metastruct/meta-core",
  "version": "1.0.0",
  "description": "Layer 0-5 meta-schema specification laws and validation engines.",
  "license": "Apache-2.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "ajv": "^8.12.0",
    "ajv-formats": "^2.1.1"
  }
}
EOF

cat << 'EOF' > packages/meta-core/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
EOF

cat << 'EOF' > packages/meta-core/src/validator.ts
import Ajv from "ajv";
import addFormats from "ajv-formats";

export class MetaCoreValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
  }

  public validateLayer(layerSchema: object, data: object): { valid: boolean; errors: any[] } {
    const validate = this.ajv.compile(layerSchema);
    const valid = validate(data);
    return {
      valid: !!valid,
      errors: validate.errors || []
    };
  }
}
EOF

cat << 'EOF' > packages/meta-core/src/index.ts
export * from "./validator.js";
EOF

# 4. Package: compiler
cat << 'EOF' > packages/compiler/package.json
{
  "name": "@metastruct/compiler",
  "version": "1.0.0",
  "description": "Deterministic Schema-Driven Master Compiler for Metastruct manifests.",
  "license": "Apache-2.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "clean": "rm -rf dist"
  },
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "@metastruct/meta-core": "workspace:*"
  }
}
EOF

cat << 'EOF' > packages/compiler/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
EOF

cat << 'EOF' > packages/compiler/src/master_compiler.ts
import { MetaCoreValidator } from "@metastruct/meta-core";

export interface SystemManifest {
  entity: any;
  ui?: any;
  workflow?: any;
  compiledAt: string;
}

export class MasterCompiler {
  private validator: MetaCoreValidator;

  constructor() {
    this.validator = new MetaCoreValidator();
  }

  public compile(entitySpec: any, uiSpec?: any, workflowSpec?: any): SystemManifest {
    if (!entitySpec || !entitySpec.title) {
      throw new Error("Compilation Error: Invalid Layer 1 Entity Specification.");
    }

    return {
      entity: entitySpec,
      ui: uiSpec || {},
      workflow: workflowSpec || {},
      compiledAt: new Date().toISOString()
    };
  }
}
EOF

cat << 'EOF' > packages/compiler/src/browser_compiler.ts
import { MasterCompiler, SystemManifest } from "./master_compiler.js";

export class BrowserCompiler {
  private masterCompiler: MasterCompiler;

  constructor() {
    this.masterCompiler = new MasterCompiler();
  }

  public compileInMemory(entitySpec: any, uiSpec?: any, workflowSpec?: any): SystemManifest {
    return this.masterCompiler.compile(entitySpec, uiSpec, workflowSpec);
  }
}
EOF

cat << 'EOF' > packages/compiler/src/index.ts
export * from "./master_compiler.js";
export * from "./browser_compiler.js";
EOF

# 5. Package: platform-ui
cat << 'EOF' > packages/platform-ui/package.json
{
  "name": "@metastruct/platform-ui",
  "version": "1.0.0",
  "description": "React + Material UI runtime execution driver for Metastruct manifests.",
  "license": "Apache-2.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist"
  },
  "publishConfig": {
    "access": "public"
  },
  "peerDependencies": {
    "@mui/material": "^5.0.0",
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0",
    "react": "^18.0.0"
  }
}
EOF

cat << 'EOF' > packages/platform-ui/tsconfig.json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
EOF

cat << 'EOF' > packages/platform-ui/src/DynamicWorkflowForm.tsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

interface DynamicFormProps {
  manifest: any;
  onSubmit: (formData: any) => void;
}

export const DynamicWorkflowForm: React.FC<DynamicFormProps> = ({ manifest, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const properties = manifest?.entity?.properties || {};

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        {manifest?.entity?.title || 'Dynamic Entity Form'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Object.keys(properties).map((key) => {
          const field = properties[key];
          return (
            <TextField
              key={key}
              label={field.title || key}
              type={field.type === 'integer' || field.type === 'number' ? 'number' : 'text'}
              required={manifest?.entity?.required?.includes(key)}
              onChange={(e) => handleChange(key, e.target.value)}
              fullWidth
            />
          );
        })}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Submit Record
        </Button>
      </Box>
    </Paper>
  );
};
EOF

cat << 'EOF' > packages/platform-ui/src/index.ts
export * from "./DynamicWorkflowForm.js";
EOF

# 6. Service: platform-runtime
cat << 'EOF' > services/platform-runtime/pyproject.toml
[tool.poetry]
name = "metastruct-runtime"
version = "1.0.0"
description = "FastAPI backend runtime engine for Metastruct specs"
authors = ["Metastruct Team"]

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.109.0"
uvicorn = "^0.27.0"
sqlalchemy = "^2.0.25"
asyncpg = "^0.29.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
EOF

cat << 'EOF' > services/platform-runtime/app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(title="Metastruct Dynamic Runtime Engine", version="1.0.0")

class ManifestPayload(BaseModel):
    manifest: Dict[str, Any]
    data: Dict[str, Any]

@app.get("/health")
async def health_check():
    return {"status": "online", "engine": "Metastruct Async Runtime"}

@app.post("/api/v1/entity/validate")
async def validate_entity(payload: ManifestPayload):
    required_fields = payload.manifest.get("entity", {}).get("required", [])
    missing = [field for field in required_fields if field not in payload.data]
    
    if missing:
        raise HTTPException(status_code=422, detail=f"Validation failed. Missing required fields: {missing}")
        
    return {"valid": True, "message": "Payload conforms to entity schema."}
EOF

cat << 'EOF' > services/platform-runtime/app/db/generic_repository.py
from typing import Any, Dict, List, Optional
from sqlalchemy import Table, Column, String, DateTime, MetaData, select, insert
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from datetime import datetime

class GenericSchemaRepository:
    def __init__(self, engine: AsyncEngine):
        self.engine = engine
        self.metadata = MetaData()

    def _build_dynamic_table(self, manifest: Dict[str, Any]) -> Table:
        entity_spec = manifest.get("entity", {})
        table_name = entity_spec.get("title", "dynamic_entity").lower()
        properties = entity_spec.get("properties", {})

        columns = [
            Column("id", String, primary_key=True),
            Column("created_at", DateTime, default=datetime.utcnow, nullable=False),
            Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False),
            Column("deleted_at", DateTime, nullable=True),
        ]

        for prop_name, prop_attrs in properties.items():
            if prop_name in ["id", "created_at", "updated_at", "deleted_at"]:
                continue
            columns.append(Column(prop_name, String, nullable=True))

        return Table(table_name, self.metadata, *columns, extend_existing=True)

    async def insert_record(self, manifest: Dict[str, Any], record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        table = self._build_dynamic_table(manifest)
        now = datetime.utcnow()
        payload = {**data, "id": record_id, "created_at": now, "updated_at": now, "deleted_at": None}

        async with self.engine.begin() as conn:
            await conn.execute(table.schema, self.metadata)
            stmt = insert(table).values(**payload)
            await conn.execute(stmt)

        return payload

    async def get_by_id(self, manifest: Dict[str, Any], record_id: str) -> Optional[Dict[str, Any]]:
        table = self._build_dynamic_table(manifest)
        stmt = select(table).where(table.c.id == record_id, table.c.deleted_at.is_(None))

        async with AsyncSession(self.engine) as session:
            result = await session.execute(stmt)
            row = result.fetchone()
            return dict(row._mapping) if row else None
EOF

echo "✅ Metastruct Repository Bootstrapped Successfully!"
