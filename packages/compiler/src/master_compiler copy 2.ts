import {
  EntitySpec,
  UISpec,
  QuestionnaireSpec,
  ValidationContext,
  CoreValidator,
  LawViolationError,
} from '@metastruct/core';

export interface NormalizedWidget {
  type: string;
  props?: Record<string, unknown>;
}

export interface NormalizedField {
  key: string;
  type: string;
  label: string;
  required: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  foreignEntity: string | null;
  defaultValue: unknown;
  widget: NormalizedWidget;
  validationRules: Record<string, unknown>;
}

export interface CompiledLayoutSection {
  title: string;
  fields: string[];
}

export interface CompiledEntity {
  entityName: string;
  primaryKey: string;
  schema: Record<string, NormalizedField>;
  layout: CompiledLayoutSection[];
}

export interface CompiledQuestion {
  id: string;
  entityName: string;
  fieldKey: string;
  questionText: string;
  helpText: string | null;
  isRequired: boolean;
  readOnly: boolean;
  widget: NormalizedWidget;
}

export interface CompiledStep {
  id: string;
  title: string;
  description: string | null;
  questionIds: string[];
  visibilityCondition:
    | {
        questionId: string;
        operator: string;
        value: unknown;
      }
    | null;
}

export interface CompiledQuestionnaire {
  id: string;
  title: string;
  targetEntity: string;
  initialStep: string;
  questions: Record<string, CompiledQuestion>;
  steps: Record<string, CompiledStep>;
  allowedTransitions: Record<string, string[]>;
}

export interface SystemManifest {
  systemId: string;
  version: string;
  compiledAt: string;
  entities: Record<string, CompiledEntity>;
  questionnaires: Record<string, CompiledQuestionnaire>;
}

export interface CompileContext {
  systemId: string;
  version?: string;
  entities: Record<string, EntitySpec>;
  uiSpecs?: Record<string, UISpec>;
  questionnaires?: Record<string, QuestionnaireSpec>;
}

const DEFAULT_WIDGETS: Record<string, string> = {
  string: 'text',
  uid: 'text',
  number: 'number',
  integer: 'number',
  boolean: 'checkbox',
  date: 'datepicker',
  datetime: 'datepicker',
};

function resolveDefaultWidget(type: string): NormalizedWidget {
  return {
    type: DEFAULT_WIDGETS[type] ?? 'text',
  };
}

function findUIField(
  uiSpec: UISpec | undefined,
  fieldKey: string
) {
  return uiSpec?.sections
    .flatMap((section) => section.fields)
    .find((field) =>
      typeof field === 'string'
        ? field === fieldKey
        : field.key === fieldKey
    );
}

function resolveFieldWidget(
  entity: EntitySpec,
  fieldKey: string,
  uiSpec?: UISpec
): NormalizedWidget {
  const uiField = findUIField(
    uiSpec,
    fieldKey
  );

  if (
    typeof uiField !== 'string' &&
    uiField?.widget
  ) {
    return {
      type: uiField.widget.type,
      props: uiField.widget.props,
    };
  }

  const property = entity.properties[fieldKey];

  return resolveDefaultWidget(property.type);
}

function resolveFieldLabel(
  entity: EntitySpec,
  fieldKey: string,
  uiSpec?: UISpec
): string {
  const uiField = findUIField(
    uiSpec,
    fieldKey
  );

  if (
    typeof uiField !== 'string' &&
    uiField?.label
  ) {
    return uiField.label;
  }

  return (
    entity.properties[fieldKey].title ??
    fieldKey.charAt(0).toUpperCase() +
      fieldKey.slice(1)
  );
}

/*
 * Resolve the effective questionnaire widget.
 *
 * Cascade defined by QUESTIONNAIRE_SPEC_SCHEMA:
 *
 *   1. Question-level widget override
 *   2. UI Spec widget for the mapped entity field
 *   3. Metastruct default widget for the entity field type
 */
function resolveQuestionWidget(
  question: QuestionnaireSpec['questions'][string],
  entity: EntitySpec,
  uiSpec?: UISpec
): NormalizedWidget {
  if (question.widget) {
    return {
      type: question.widget.type,
      props: question.widget.props,
    };
  }

  return resolveFieldWidget(
    entity,
    question.fieldKey,
    uiSpec
  );
}

export class MasterCompiler {
  private readonly validator: CoreValidator;

  constructor(validator?: CoreValidator) {
    this.validator =
      validator ?? new CoreValidator();
  }

  public compile(
    context: CompileContext
  ): SystemManifest {
    const validationContext: ValidationContext = {
      entities: context.entities,
      uiSpecs: context.uiSpecs,
      questionnaires: context.questionnaires,
    };

    const violations =
      this.validator.validateContext(
        validationContext,
        false
      );

    if (violations.length > 0) {
      throw new LawViolationError(violations);
    }

    const entities: Record<string, CompiledEntity> = {};

    for (const [
      entityName,
      entitySpec,
    ] of Object.entries(context.entities)) {
      entities[entityName] =
        this.compileEntity(
          entitySpec,
          context.uiSpecs?.[entityName]
        );
    }

    const questionnaires: Record<
      string,
      CompiledQuestionnaire
    > = {};

    for (const [
      questionnaireId,
      questionnaire,
    ] of Object.entries(
      context.questionnaires ?? {}
    )) {
      questionnaires[questionnaireId] =
        this.compileQuestionnaire(
          questionnaire,
          context.entities,
          context.uiSpecs
        );
    }

    return {
      systemId: context.systemId,
      version: context.version ?? '1.0.0',
      compiledAt: new Date().toISOString(),
      entities,
      questionnaires,
    };
  }

  /*
   * Convenience method for compiling one entity,
   * its UI specification and an optional questionnaire.
   */
  public compileSingle(
    entitySpec: EntitySpec,
    uiSpec?: UISpec,
    questionnaire?: QuestionnaireSpec,
    systemId = entitySpec.title
  ): SystemManifest {
    return this.compile({
      systemId,
      version: entitySpec.version,
      entities: {
        [entitySpec.title]: entitySpec,
      },
      uiSpecs: uiSpec
        ? {
            [entitySpec.title]: uiSpec,
          }
        : undefined,
      questionnaires: questionnaire
        ? {
            [questionnaire.id]: questionnaire,
          }
        : undefined,
    });
  }

  private compileEntity(
    entity: EntitySpec,
    uiSpec?: UISpec
  ): CompiledEntity {
    const schema: Record<
      string,
      NormalizedField
    > = {};

    for (const [
      key,
      property,
    ] of Object.entries(entity.properties)) {
      schema[key] = {
        key,
        type: property.type,
        label: resolveFieldLabel(
          entity,
          key,
          uiSpec
        ),
        required:
          entity.required?.includes(key) ?? false,
        isPrimaryKey:
          key === entity.primaryKey,
        isForeignKey:
          property.isForeignKey === true,
        foreignEntity:
          property.foreignEntity ?? null,
        defaultValue:
          property.default ?? null,
        widget: resolveFieldWidget(
          entity,
          key,
          uiSpec
        ),
        validationRules: {
          ...(property.minLength !== undefined
            ? {
                minLength: property.minLength,
              }
            : {}),
          ...(property.maxLength !== undefined
            ? {
                maxLength: property.maxLength,
              }
            : {}),
          ...(property.minimum !== undefined
            ? {
                minimum: property.minimum,
              }
            : {}),
          ...(property.maximum !== undefined
            ? {
                maximum: property.maximum,
              }
            : {}),
          ...(property.pattern !== undefined
            ? {
                pattern: property.pattern,
              }
            : {}),
        },
      };
    }

    const layout =
      uiSpec?.sections.map((section) => ({
        title: section.title,
        fields: section.fields.map(
          (field) =>
            typeof field === 'string'
              ? field
              : field.key
        ),
      })) ?? [
        {
          title: 'General Details',
          fields: Object.keys(schema),
        },
      ];

    return {
      entityName: entity.title,
      primaryKey: entity.primaryKey,
      schema,
      layout,
    };
  }

  private compileQuestionnaire(
    questionnaire: QuestionnaireSpec,
    entities: Record<string, EntitySpec>,
    uiSpecs?: Record<string, UISpec>
  ): CompiledQuestionnaire {
    const questions: Record<
      string,
      CompiledQuestion
    > = {};

    for (const [
      key,
      question,
    ] of Object.entries(
      questionnaire.questions
    )) {
      const entity =
        entities[question.entityName];

      /*
       * Core validation has already established
       * that entityName and fieldKey resolve.
       *
       * Keep this guard here so the compiler fails
       * clearly if it is ever called outside the
       * normal validated compilation path.
       */
      if (!entity) {
        throw new Error(
          `Questionnaire '${questionnaire.id}' question '${key}' references entity '${question.entityName}', which is not available in the compilation context.`
        );
      }

      if (!entity.properties[question.fieldKey]) {
        throw new Error(
          `Questionnaire '${questionnaire.id}' question '${key}' references field '${question.fieldKey}' on entity '${question.entityName}', which is not available in the compilation context.`
        );
      }

      questions[key] = {
        id: question.id,
        entityName: question.entityName,
        fieldKey: question.fieldKey,
        questionText: question.questionText,
        helpText:
          question.helpText ?? null,
        isRequired:
          question.isRequired ?? false,
        readOnly:
          question.readOnly ?? false,

        /*
         * Questionnaire widget cascade:
         *
         * question.widget
         *     ↓
         * UI Spec field.widget
         *     ↓
         * Metastruct default widget
         */
        widget: resolveQuestionWidget(
          question,
          entity,
          uiSpecs?.[question.entityName]
        ),
      };
    }

    const steps: Record<
      string,
      CompiledStep
    > = {};

    for (const [
      key,
      step,
    ] of Object.entries(
      questionnaire.steps
    )) {
      steps[key] = {
        id: step.id,
        title: step.title,
        description:
          step.description ?? null,
        questionIds: [...step.questionIds],
        visibilityCondition:
          step.visibilityCondition
            ? {
                questionId:
                  step.visibilityCondition
                    .questionId,
                operator:
                  step.visibilityCondition
                    .operator,
                value:
                  step.visibilityCondition
                    .value ?? null,
              }
            : null,
      };
    }

    return {
      id: questionnaire.id,
      title: questionnaire.title,
      targetEntity:
        questionnaire.targetEntity,
      initialStep:
        questionnaire.initialStep,
      questions,
      steps,
      allowedTransitions:
        questionnaire.transitions,
    };
  }
}