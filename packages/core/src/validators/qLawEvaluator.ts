import { QuestionnaireSpec, ValidationContext, Violation } from '../laws/types.js';

export function evaluateQuestionnaireLaws(
  qSpec: QuestionnaireSpec,
  context: ValidationContext
): Violation[] {
  const violations: Violation[] = [];
  const qId = qSpec.id;

  // Q-001: targetEntity MUST resolve in context
  const primaryEntity = context.entities[qSpec.targetEntity];
  if (!primaryEntity) {
    violations.push({
      code: 'Q-001',
      path: `/Questionnaire/${qId}/targetEntity`,
      message: `Questionnaire targetEntity '${qSpec.targetEntity}' does not exist in system context.`,
      specType: 'QuestionnaireSpec',
    });
  }

  // Question evaluations
  for (const [qKey, question] of Object.entries(qSpec.questions)) {
    const qPath = `/Questionnaire/${qId}/questions/${qKey}`;

    // Q-002: Question entityName MUST resolve
    const questionEntity = context.entities[question.entityName];
    if (!questionEntity) {
      violations.push({
        code: 'Q-002',
        path: `${qPath}/entityName`,
        message: `Question '${qKey}' references non-existent entity '${question.entityName}'.`,
        specType: 'QuestionnaireSpec',
      });
    } else {
      // Q-003: Question fieldKey MUST resolve on question.entityName
      if (!questionEntity.properties[question.fieldKey]) {
        violations.push({
          code: 'Q-003',
          path: `${qPath}/fieldKey`,
          message: `Question '${qKey}' fieldKey '${question.fieldKey}' does not exist on entity '${question.entityName}'.`,
          specType: 'QuestionnaireSpec',
        });
      }
    }
  }

  // Q-006: initialStep MUST resolve
  if (!qSpec.steps[qSpec.initialStep]) {
    violations.push({
      code: 'Q-006',
      path: `/Questionnaire/${qId}/initialStep`,
      message: `Declared initialStep '${qSpec.initialStep}' does not exist in steps list.`,
      specType: 'QuestionnaireSpec',
    });
  }

  // Step & Question linkage evaluations
  for (const [sKey, step] of Object.entries(qSpec.steps)) {
    const stepPath = `/Questionnaire/${qId}/steps/${sKey}`;

    // Q-005: Every step questionId MUST resolve
    step.questionIds.forEach((qIdRef, index) => {
      if (!qSpec.questions[qIdRef]) {
        violations.push({
          code: 'Q-005',
          path: `${stepPath}/questionIds[${index}]`,
          message: `Step '${sKey}' references non-existent questionId '${qIdRef}'.`,
          specType: 'QuestionnaireSpec',
        });
      }
    });

    // Q-008: Step visibilityCondition questionId MUST resolve
    if (step.visibilityCondition) {
      if (!qSpec.questions[step.visibilityCondition.questionId]) {
        violations.push({
          code: 'Q-008',
          path: `${stepPath}/visibilityCondition/questionId`,
          message: `Visibility condition references non-existent questionId '${step.visibilityCondition.questionId}'.`,
          specType: 'QuestionnaireSpec',
        });
      }
    }
  }

  // Q-007: Transition step graph resolution
  for (const [fromStep, targetSteps] of Object.entries(qSpec.transitions)) {
    const tPath = `/Questionnaire/${qId}/transitions/${fromStep}`;

    if (!qSpec.steps[fromStep]) {
      violations.push({
        code: 'Q-007',
        path: tPath,
        message: `Transition source step '${fromStep}' does not exist in questionnaire steps.`,
        specType: 'QuestionnaireSpec',
      });
    }

    targetSteps.forEach((targetStep, index) => {
      if (!qSpec.steps[targetStep]) {
        violations.push({
          code: 'Q-007',
          path: `${tPath}[${index}]`,
          message: `Transition target step '${targetStep}' from '${fromStep}' does not exist in questionnaire steps.`,
          specType: 'QuestionnaireSpec',
        });
      }
    });
  }

  return violations;
}
