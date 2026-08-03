import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { MasterCompiler } from '../src/master_compiler';

describe('MasterCompiler Execution Suite', () => {
  const tmpDir = path.join(__dirname, '__tmp_test_workspace__');
  const srcDir = path.join(tmpDir, 'src');
  const distDir = path.join(tmpDir, 'dist');

  let compiler: MasterCompiler;

  beforeEach(async () => {
    compiler = new MasterCompiler();
    await fs.ensureDir(path.join(srcDir, 'entities'));
    await fs.ensureDir(path.join(srcDir, 'ui'));
    await fs.ensureDir(path.join(srcDir, 'workflows'));
    await fs.ensureDir(distDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('should compile valid Layer 1-4 contracts successfully', async () => {
    // 1. Setup Valid Entities
    const entity = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'TestEntity',
      description: 'Test Entity Spec',
      required: ['id', 'name', 'created_at', 'created_by', 'updated_at', 'updated_by', 'is_deleted'],
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Primary key' },
        name: { type: 'string', description: 'Entity Name' },
        created_at: { type: 'string', format: 'date-time', description: 'Audit' },
        created_by: { type: 'string', format: 'uuid', description: 'Audit' },
        updated_at: { type: 'string', format: 'date-time', description: 'Audit' },
        updated_by: { type: 'string', format: 'uuid', description: 'Audit' },
        is_deleted: { type: 'boolean', default: false, description: 'Audit' }
      }
    };

    const ui = {
      targetEntity: 'TestEntity',
      layoutDensity: 'standard',
      fields: {
        id: { label: 'ID', widget: 'MuiTextField', disabled: true },
        name: { label: 'Name', widget: 'MuiTextField', required: true },
        created_at: { label: 'Created At', widget: 'MuiDatePicker', disabled: true },
        created_by: { label: 'Created By', widget: 'MuiTextField', disabled: true },
        updated_at: { label: 'Updated At', widget: 'MuiDatePicker', disabled: true },
        updated_by: { label: 'Updated By', widget: 'MuiTextField', disabled: true },
        is_deleted: { label: 'Deleted Status', widget: 'MuiSwitch', disabled: true }
      }
    };

    const workflow = {
      workflowId: 'testentity_onboarding_workflow',
      title: 'Test Workflow',
      targetEntity: 'TestEntity',
      steps: [
        {
          stepId: 'step_initial',
          title: 'Initial Step',
          fields: ['name'],
          raci: { responsible: ['admin'], accountable: ['manager'] }
        }
      ]
    };

    await fs.writeJson(path.join(srcDir, 'entities/testentity.entity.json'), entity);
    await fs.writeJson(path.join(srcDir, 'ui/testentity.ui.json'), ui);
    await fs.writeJson(path.join(srcDir, 'workflows/testentity_onboarding.workflow.json'), workflow);

    await expect(compiler.compile({ domainSrcDir: srcDir, distOutputDir: distDir })).resolves.not.toThrow();

    const manifestPath = path.join(distDir, 'testentity_onboarding.manifest.json');
    expect(await fs.pathExists(manifestPath)).toBe(true);

    const manifest = await fs.readJson(manifestPath);
    expect(manifest.entity.title).toBe('TestEntity');
  });

  it('should throw Error when Layer 1 Entity lacks mandatory audit mixins', async () => {
    // Missing 'created_at' in properties
    const invalidEntity = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'InvalidEntity',
      description: 'Missing audit mixin',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Primary key' }
      }
    };

    await fs.writeJson(path.join(srcDir, 'entities/invalid.entity.json'), invalidEntity);

    await expect(
      compiler.compile({ domainSrcDir: srcDir, distOutputDir: distDir })
    ).rejects.toThrow(/failed meta-validation rules/);
  });

  it('should throw Error when Layer 2 UI references an orphan field missing in Layer 1 Entity', async () => {
    const entity = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'OrphanTest',
      description: 'Test Entity Spec',
      required: ['id', 'created_at', 'created_by', 'updated_at', 'updated_by', 'is_deleted'],
      properties: {
        id: { type: 'string', format: 'uuid', description: 'Primary key' },
        created_at: { type: 'string', format: 'date-time', description: 'Audit' },
        created_by: { type: 'string', format: 'uuid', description: 'Audit' },
        updated_at: { type: 'string', format: 'date-time', description: 'Audit' },
        updated_by: { type: 'string', format: 'uuid', description: 'Audit' },
        is_deleted: { type: 'boolean', default: false, description: 'Audit' }
      }
    };

    // 'orphan_field' does not exist in Layer 1 entity!
    const ui = {
      targetEntity: 'OrphanTest',
      layoutDensity: 'standard',
      fields: {
        id: { label: 'ID', widget: 'MuiTextField' },
        orphan_field: { label: 'Orphan Field', widget: 'MuiTextField' },
        created_at: { label: 'Created At', widget: 'MuiDatePicker' },
        created_by: { label: 'Created By', widget: 'MuiTextField' },
        updated_at: { label: 'Updated At', widget: 'MuiDatePicker' },
        updated_by: { label: 'Updated By', widget: 'MuiTextField' },
        is_deleted: { label: 'Deleted Status', widget: 'MuiSwitch' }
      }
    };

    const workflow = {
      workflowId: 'orphantest_onboarding_workflow',
      title: 'Test Workflow',
      targetEntity: 'OrphanTest',
      steps: [{ stepId: 'step_1', title: 'Step 1', fields: ['id'], raci: { responsible: ['admin'], accountable: ['manager'] } }]
    };

    await fs.writeJson(path.join(srcDir, 'entities/orphantest.entity.json'), entity);
    await fs.writeJson(path.join(srcDir, 'ui/orphantest.ui.json'), ui);
    await fs.writeJson(path.join(srcDir, 'workflows/orphantest_onboarding.workflow.json'), workflow);

    await expect(
      compiler.compile({ domainSrcDir: srcDir, distOutputDir: distDir })
    ).rejects.toThrow(/Orphan UI Field Error: Layer 2 field 'orphan_field' does not exist in Layer 1 Entity/);
  });
});
