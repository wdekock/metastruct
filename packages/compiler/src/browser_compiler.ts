import { MetaCoreValidator } from '@passport/meta-core';

export interface CompilationDraft {
  entity: Record<string, any>;
  ui: Record<string, any>;
  workflow: Record<string, any>;
}

export interface CompilerFeedback {
  valid: boolean;
  errors: string[];
}

export class BrowserCompiler {
  private validator: MetaCoreValidator;

  constructor() {
    this.validator = new MetaCoreValidator();
  }

  public validateDraft(draft: CompilationDraft): CompilerFeedback {
    const errors: string[] = [];

    // 1. Meta-validate Layer 1 (Entity Schema)
    const entityResult = this.validator.validateEntitySchema(draft.entity);
    if (!entityResult.valid) {
      errors.push(...entityResult.errors.map(err => `[Layer 1 Entity Error]: ${err}`));
    }

    // 2. Meta-validate Layer 2 (UI Schema)
    const uiResult = this.validator.validateUISchema(draft.ui);
    if (!uiResult.valid) {
      errors.push(...uiResult.errors.map(err => `[Layer 2 UI Error]: ${err}`));
    }

    // 3. Cross-validate UI fields against Layer 1 properties
    if (draft.entity?.properties && draft.ui?.fields) {
      const entityProps = new Set(Object.keys(draft.entity.properties));
      const uiFields = Object.keys(draft.ui.fields);

      for (const field of uiFields) {
        if (!entityProps.has(field)) {
          errors.push(`[Orphan Field Error]: UI field '${field}' does not exist in Layer 1 Entity '${draft.entity.title || 'Unknown'}'.`);
        }
      }
    }

    // 4. Meta-validate Layer 4 (Workflow Schema)
    const workflowResult = this.validator.validateWorkflowSchema(draft.workflow);
    if (!workflowResult.valid) {
      errors.push(...workflowResult.errors.map(err => `[Layer 4 Workflow Error]: ${err}`));
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
