export interface WidgetSpec {
  type: string;
  props?: Record<string, any>;
}

export interface SchemaField {
  key: string;
  type: string;
  label: string;
  required: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  foreignEntity?: string;
  defaultValue?: any;
  widget: WidgetSpec;
  validationRules?: {
    minimum?: number;
    maximum?: number;
  };
}

export interface LayoutSection {
  title: string;
  fields: string[];
}

export interface EntityManifest {
  entityName: string;
  primaryKey: string;
  schema: Record<string, SchemaField>;
  layout: LayoutSection[];
}

export interface QuestionSpec {
  id: string;
  entityName: string;
  fieldKey: string;
  questionText: string;
  widget: WidgetSpec;
}

export interface QuestionnaireManifest {
  id: string;
  title: string;
  targetEntity: string;
  questions: Record<string, QuestionSpec>;
}

export interface SystemManifest {
  systemId: string;
  version: string;
  compiledAt: string;
  entities: Record<string, EntityManifest>;
  questionnaires: Record<string, QuestionnaireManifest>;
}