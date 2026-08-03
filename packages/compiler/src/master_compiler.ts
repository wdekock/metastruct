import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import * as fs from 'fs-extra';
import * as path from 'path';
import { METASCHEMAS } from '@passport/meta-core';

export interface CompileOptions {
  domainSrcDir: string;
  distOutputDir: string;
}

export class MasterCompiler {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: true });
    addFormats(this.ajv);
    
    // Register Layer 0-5 meta-schemas into Ajv validator core
    Object.values(METASCHEMAS).forEach((schema) => {
      this.ajv.addSchema(schema);
    });
  }

  public async compile(options: CompileOptions): Promise<void> {
    console.log('🚀 Executing Master Compilation Pass...');

    // 1. Read Domain Files from Source Directory
    const entitiesDir = path.join(options.domainSrcDir, 'entities');
    const uiDir = path.join(options.domainSrcDir, 'ui');
    const workflowsDir = path.join(options.domainSrcDir, 'workflows');

    const entityFiles = await fs.readdir(entitiesDir);
    
    for (const file of entityFiles) {
      if (!file.endsWith('.entity.json')) continue;
      const baseName = file.replace('.entity.json', '');

      const entityPath = path.join(entitiesDir, file);
      const uiPath = path.join(uiDir, `${baseName}.ui.json`);
      const workflowPath = path.join(workflowsDir, `${baseName}_onboarding.workflow.json`);

      // 2. Load Raw JSON Specifications
      const entityRaw = await fs.readJson(entityPath);
      const uiRaw = await fs.readJson(uiPath);
      const workflowRaw = await fs.readJson(workflowPath);

      // 3. Draft-07 Meta-Schema Verification Pass
      this.validateAgainstMeta(METASCHEMAS.entity.$id, entityRaw, file);
      this.validateAgainstMeta(METASCHEMAS.ui.$id, uiRaw, `${baseName}.ui.json`);
      this.validateAgainstMeta(METASCHEMAS.workflow.$id, workflowRaw, `${baseName}_onboarding.workflow.json`);

      // 4. Cross-Layer Structural Verification (L1 ↔ L2 ↔ L4)
      this.verifyCrossLayerBindings(entityRaw, uiRaw, workflowRaw);

      // 5. Dereference Pointers & Dereference Modular Dependencies
      const bundledEntity = await $RefParser.dereference(entityRaw);

      // 6. Emit Production Manifest Artifact
      const manifest = {
        manifestVersion: '1.0.0',
        compiledAt: new Date().toISOString(),
        entity: bundledEntity,
        ui: uiRaw,
        workflow: workflowRaw
      };

      await fs.ensureDir(options.distOutputDir);
      const outputPath = path.join(options.distOutputDir, `${baseName}_onboarding.manifest.json`);
      await fs.writeJson(outputPath, manifest, { spaces: 2 });

      console.log(`✅ Emitted manifest: ${outputPath}`);
    }
  }

  private validateAgainstMeta(metaId: string, data: any, fileName: string): void {
    const validate = this.ajv.getSchema(metaId);
    if (!validate) throw new Error(`Meta-schema ${metaId} not found in validator registry.`);

    const valid = validate(data);
    if (!valid) {
      console.error(`❌ Meta-Validation failure in ${fileName}:`, validate.errors);
      throw new Error(`Schema ${fileName} failed meta-validation rules.`);
    }
  }

  private verifyCrossLayerBindings(entity: any, ui: any, workflow: any): void {
    const entityProperties = Object.keys(entity.properties || {});
    const uiFields = Object.keys(ui.fields || {});

    // Invariant 01: L2 UI fields must reference existing L1 entity fields
    for (const fieldKey of uiFields) {
      if (!entityProperties.includes(fieldKey)) {
        throw new Error(`Orphan UI Field Error: Layer 2 field '${fieldKey}' does not exist in Layer 1 Entity.`);
      }
    }

    // Invariant 02: L4 Workflow step fields must reference existing L2 UI fields
    for (const step of workflow.steps) {
      for (const fieldKey of step.fields) {
        if (!uiFields.includes(fieldKey)) {
          throw new Error(`Orphan Workflow Field Error: Step '${step.stepId}' references field '${fieldKey}' which is missing in Layer 2 UI.`);
        }
      }
    }
  }
}
