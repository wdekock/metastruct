export type LawCode =
  // Structural
  | 'STR-001'
  // Data Model Laws
  | 'DM-001' | 'DM-002' | 'DM-003' | 'DM-004' | 'DM-005' | 'DM-006' | 'DM-007'
  // UI Presentation Laws
  | 'UI-001' | 'UI-002' | 'UI-003'
  // Questionnaire Capture Laws
  | 'Q-001'  | 'Q-002'  | 'Q-003'  | 'Q-004'  | 'Q-005'  | 'Q-006'  | 'Q-007'  | 'Q-008';

export interface Violation {
  code: LawCode;
  path: string;
  message: string;
  specType: 'EntitySpec' | 'UISpec' | 'QuestionnaireSpec' | 'SystemContext';
}

export interface EntityPropertySpec {
  type: string;
  title?: string;
  default?: unknown;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  isForeignKey?: boolean;
  foreignEntity?: string;
}

export interface EntityRelationshipSpec {
  name: string;
  targetEntity: string;
  type: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  foreignKey: string;
}

export interface EntitySpec {
  title: string;
  version?: string;
  primaryKey: string;
  required?: string[];
  properties: Record<string, EntityPropertySpec>;
  relationships?: EntityRelationshipSpec[];
}

export interface UIFieldObject {
  key: string;
  label?: string | null;
  readOnly?: boolean;
  widget?: {
    type: 'text' | 'number' | 'select' | 'datepicker' | 'checkbox' | 'textarea' | 'radio' | 'custom';
    props?: Record<string, unknown>;
  };
}

export type UIField = string | UIFieldObject;

export interface UISection {
  title: string;
  description?: string | null;
  fields: UIField[];
}

export interface UISpec {
  title?: string;
  sections: UISection[];
}

export interface QuestionSpec {
  id: string;
  entityName: string;
  fieldKey: string;
  questionText: string;
  helpText?: string | null;
  placeholder?: string | null;
  isRequired?: boolean;
  readOnly?: boolean;
  widget?: {
    type: string;
    props?: Record<string, unknown>;
  };
}

export interface StepVisibilityCondition {
  questionId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'notIn' | 'exists' | 'isTrue' | 'isFalse';
  value?: unknown;
}

export interface StepSpec {
  id: string;
  title: string;
  description?: string | null;
  questionIds: string[];
  visibilityCondition?: StepVisibilityCondition | null;
}

export interface QuestionnaireSpec {
  id: string;
  title: string;
  version?: string;
  targetEntity: string;
  initialStep: string;
  questions: Record<string, QuestionSpec>;
  steps: Record<string, StepSpec>;
  transitions: Record<string, string[]>;
}

export interface ValidationContext {
  entities: Record<string, EntitySpec>;
  uiSpecs?: Record<string, UISpec>;
  questionnaires?: Record<string, QuestionnaireSpec>;
}