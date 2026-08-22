export interface SchemaField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  isPrimaryKey?: boolean;
  defaultValue?: any;
  description?: string;
  widget?: {
    type: string;
  };
}

export interface UISection {
  title: string;
  fields: string[];
}

export interface EntityManifest {
  entityName: string;
  title: string;
  description: string;
  primaryKey: string;
  fields: SchemaField[];
  schema: Record<string, SchemaField>;
  layout: UISection[];
}

export interface QuestionnaireQuestion {
  id: string;
  fieldKey: string;
  questionText: string;
  widget: {
    type: string;
  };
}

export interface QuestionnaireManifest {
  id: string;
  title: string;
  targetEntity: string;
  questions: QuestionnaireQuestion[];
}

export interface SystemManifest {
  compiledAt: string;
  entities: Record<string, EntityManifest>;
  questionnaires: Record<string, QuestionnaireManifest>;
}