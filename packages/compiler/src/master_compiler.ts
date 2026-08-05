import { MetaCoreValidator } from "@metastruct/meta-core";

export interface NormalizedField {
  key: string;
  type: string;
  label: string;
  required: boolean;
  defaultValue?: any;
  validationRules?: Record<string, any>;
}

export interface CompiledLayoutSection {
  title: string;
  fields: NormalizedField[];
}

export interface SystemManifest {
  entityName: string;
  version: string;
  schema: Record<string, NormalizedField>;
  layout: CompiledLayoutSection[];
  workflowState: {
    initialStep?: string;
    allowedTransitions: Record<string, string[]>;
  };
  compiledAt: string;
}

export class MasterCompiler {
  private validator: MetaCoreValidator;

  constructor() {
    this.validator = new MetaCoreValidator();
  }

  public compile(entitySpec: any, uiSpec?: any, workflowSpec?: any): SystemManifest {
    if (!entitySpec || !entitySpec.title) {
      throw new Error("Compilation Error: Missing entity spec title.");
    }

    const properties = entitySpec.properties || {};
    const requiredList = entitySpec.required || [];
    const normalizedSchema: Record<string, NormalizedField> = {};
    const fieldList: NormalizedField[] = [];

    // 1. Normalize schema properties & infer execution defaults
    for (const [key, prop] of Object.entries<any>(properties)) {
      const field: NormalizedField = {
        key,
        type: prop.type || "string",
        label: prop.title || key.charAt(0).toUpperCase() + key.slice(1),
        required: requiredList.includes(key),
        defaultValue: prop.default ?? null,
        validationRules: {
          minLength: prop.minLength,
          maxLength: prop.maxLength,
          minimum: prop.minimum,
          maximum: prop.maximum,
          pattern: prop.pattern
        }
      };

      normalizedSchema[key] = field;
      fieldList.push(field);
    }

    // 2. Build organized UI layout sections
    const layoutSections: CompiledLayoutSection[] = uiSpec?.sections || [
      {
        title: "General Details",
        fields: fieldList
      }
    ];

    // 3. Compile Workflow Transitions
    const workflowTransitions = workflowSpec?.transitions || {};

    return {
      entityName: entitySpec.title,
      version: entitySpec.version || "1.0.0",
      schema: normalizedSchema,
      layout: layoutSections,
      workflowState: {
        initialStep: workflowSpec?.initialStep,
        allowedTransitions: workflowTransitions
      },
      compiledAt: new Date().toISOString()
    };
  }
}
