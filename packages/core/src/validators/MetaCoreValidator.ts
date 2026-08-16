import { StructuralValidator } from './structuralValidator.js';
import { evaluateEntityLaws } from './entityLawEvaluator.js';
import { evaluateUILaws } from './uiLawEvaluator.js';
import { evaluateQuestionnaireLaws } from './qLawEvaluator.js';
import {
  ValidationContext,
  Violation,
} from '../laws/types.js';
import { LawViolationError } from '../laws/LawViolationError.js';

export class CoreValidator {
  private readonly structuralValidator: StructuralValidator;

  constructor(schemas?: {
    entitySchema?: object;
    uiSchema?: object;
    questionnaireSchema?: object;
  }) {
    this.structuralValidator =
      new StructuralValidator();

    if (schemas?.entitySchema) {
      this.structuralValidator.registerSchema(
        'entitySpec',
        schemas.entitySchema
      );
    }

    if (schemas?.uiSchema) {
      this.structuralValidator.registerSchema(
        'uiSpec',
        schemas.uiSchema
      );
    }

    if (schemas?.questionnaireSchema) {
      this.structuralValidator.registerSchema(
        'questionnaireSpec',
        schemas.questionnaireSchema
      );
    }
  }

  public validateContext(
    context: ValidationContext,
    throwOnError = true
  ): Violation[] {
    const violations: Violation[] = [];

    for (const entitySpec of Object.values(
      context.entities
    )) {
      violations.push(
        ...this.validateStructural(
          'entitySpec',
          entitySpec,
          'EntitySpec'
        )
      );

      violations.push(
        ...evaluateEntityLaws(
          entitySpec,
          context
        )
      );
    }

    if (context.uiSpecs) {
      for (const [
        entityName,
        uiSpec,
      ] of Object.entries(context.uiSpecs)) {
        violations.push(
          ...this.validateStructural(
            'uiSpec',
            uiSpec,
            'UISpec'
          )
        );

        const entity =
          context.entities[entityName];

        if (!entity) {
          continue;
        }

        violations.push(
          ...evaluateUILaws(
            uiSpec,
            entity
          )
        );
      }
    }

    if (context.questionnaires) {
      for (const questionnaire of Object.values(
        context.questionnaires
      )) {
        violations.push(
          ...this.validateStructural(
            'questionnaireSpec',
            questionnaire,
            'QuestionnaireSpec'
          )
        );

        violations.push(
          ...evaluateQuestionnaireLaws(
            questionnaire,
            context
          )
        );
      }
    }

    if (
      violations.length > 0 &&
      throwOnError
    ) {
      throw new LawViolationError(
        violations
      );
    }

    return violations;
  }

  private validateStructural(
    schemaId: string,
    data: unknown,
    specType: Violation['specType']
  ): Violation[] {
    try {
      return this.structuralValidator.validate(
        schemaId,
        data,
        specType
      );
    } catch {
      /*
       * Structural schemas are optional at this layer.
       * Semantic laws remain authoritative.
       */
      return [];
    }
  }
}

/*
 * Temporary compatibility alias.
 *
 * This allows code to migrate from the old class name
 * without preserving the old @metastruct/meta-core package.
 */
export class MetaCoreValidator extends CoreValidator {}
