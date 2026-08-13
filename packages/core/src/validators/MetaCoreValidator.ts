import { StructuralValidator } from './structuralValidator.js';
import { evaluateEntityLaws } from './entityLawEvaluator.js';
import { evaluateUILaws } from './uiLawEvaluator.js';
import { evaluateQuestionnaireLaws } from './qLawEvaluator.js';
import { ValidationContext, Violation } from '../laws/types.js';
import { LawViolationError } from '../laws/LawViolationError.js';

export class MetaCoreValidator {
  private structuralValidator: StructuralValidator;

  constructor(schemas?: {
    entitySchema?: object;
    uiSchema?: object;
    questionnaireSchema?: object;
  }) {
    this.structuralValidator = new StructuralValidator();

    if (schemas?.entitySchema) {
      this.structuralValidator.registerSchema('entitySpec', schemas.entitySchema);
    }
    if (schemas?.uiSchema) {
      this.structuralValidator.registerSchema('uiSpec', schemas.uiSchema);
    }
    if (schemas?.questionnaireSchema) {
      this.structuralValidator.registerSchema('questionnaireSpec', schemas.questionnaireSchema);
    }
  }

  public validateContext(context: ValidationContext, throwOnError = true): Violation[] {
    const violations: Violation[] = [];

    // Phase 1: Evaluate Entity Specs
    for (const [entityName, entitySpec] of Object.entries(context.entities)) {
      // AJV Structural validation
      try {
        const structErrors = this.structuralValidator.validate('entitySpec', entitySpec, 'EntitySpec');
        violations.push(...structErrors);
      } catch {
        // Schema not registered, skip AJV phase
      }

      // Domain Semantic Laws (DM-*)
      const entityViolations = evaluateEntityLaws(entitySpec, context);
      violations.push(...entityViolations);
    }

    // Phase 2: Evaluate UI Specs
    if (context.uiSpecs) {
      for (const [entityName, uiSpec] of Object.entries(context.uiSpecs)) {
        try {
          const structErrors = this.structuralValidator.validate('uiSpec', uiSpec, 'UISpec');
          violations.push(...structErrors);
        } catch {
          // Schema not registered, skip AJV phase
        }

        const entity = context.entities[entityName];
        if (entity) {
          const uiViolations = evaluateUILaws(uiSpec, entity);
          violations.push(...uiViolations);
        }
      }
    }

    // Phase 3: Evaluate Questionnaire Specs
    if (context.questionnaires) {
      for (const qSpec of Object.values(context.questionnaires)) {
        try {
          const structErrors = this.structuralValidator.validate(
            'questionnaireSpec',
            qSpec,
            'QuestionnaireSpec'
          );
          violations.push(...structErrors);
        } catch {
          // Schema not registered, skip AJV phase
        }

        const qViolations = evaluateQuestionnaireLaws(qSpec, context);
        violations.push(...qViolations);
      }
    }

    if (violations.length > 0 && throwOnError) {
      throw new LawViolationError(violations);
    }

    return violations;
  }
}
