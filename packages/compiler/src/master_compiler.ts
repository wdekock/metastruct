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
