import {
  QuestionnaireSpec,
  ValidationContext,
  Violation,
} from '../laws/types.js';

export function evaluateQuestionnaireLaws(
  qSpec: QuestionnaireSpec,
  context: ValidationContext
): Violation[] {
  const violations: Violation[] = [];
  const qId = qSpec.id;

  /*
   * Q-001
   *
   * Questionnaire targetEntity MUST exist.
   */
  const primaryEntity = context.entities[qSpec.targetEntity];

  if (!primaryEntity) {
    violations.push({
      code: 'Q-001',
      path: `/Questionnaire/${qId}/targetEntity`,
      message:
        `Questionnaire targetEntity '${qSpec.targetEntity}' does not exist in system context.`,
      specType: 'QuestionnaireSpec',
    });
  }

  /*
   * Questions.
   */
  for (const [qKey, question] of Object.entries(qSpec.questions)) {
    const qPath =
      `/Questionnaire/${qId}/questions/${qKey}`;

    /*
     * Q-002
     *
     * Question entityName MUST resolve.
     */
    const questionEntity =
      context.entities[question.entityName];

    if (!questionEntity) {
      violations.push({
        code: 'Q-002',
        path: `${qPath}/entityName`,
        message:
          `Question '${qKey}' references non-existent entity '${question.entityName}'.`,
        specType: 'QuestionnaireSpec',
      });

      continue;
    }

    /*
     * Q-003
     *
     * Question fieldKey MUST resolve on entityName.
     */
    if (!questionEntity.properties[question.fieldKey]) {
      violations.push({
        code: 'Q-003',
        path: `${qPath}/fieldKey`,
        message:
          `Question '${qKey}' fieldKey '${question.fieldKey}' does not exist on entity '${question.entityName}'.`,
        specType: 'QuestionnaireSpec',
      });
    }
  }

  /*
   * Q-004
   *
   * Question IDs must be internally consistent:
   * the dictionary key and QuestionSpec.id must identify
   * the same question.
   */
  for (const [qKey, question] of Object.entries(qSpec.questions)) {
    if (question.id !== qKey) {
      violations.push({
        code: 'Q-004',
        path:
          `/Questionnaire/${qId}/questions/${qKey}/id`,
        message:
          `Question dictionary key '${qKey}' does not match question.id '${question.id}'.`,
        specType: 'QuestionnaireSpec',
      });
    }
  }

  /*
   * Q-005
   *
   * Every step questionId MUST resolve.
   */
  for (const [stepKey, step] of Object.entries(qSpec.steps)) {
    const stepPath =
      `/Questionnaire/${qId}/steps/${stepKey}`;

    step.questionIds.forEach((questionId, index) => {
      if (!qSpec.questions[questionId]) {
        violations.push({
          code: 'Q-005',
          path: `${stepPath}/questionIds[${index}]`,
          message:
            `Step '${stepKey}' references non-existent questionId '${questionId}'.`,
          specType: 'QuestionnaireSpec',
        });
      }
    });
  }

  /*
   * Q-006
   *
   * initialStep MUST resolve.
   */
  if (!qSpec.steps[qSpec.initialStep]) {
    violations.push({
      code: 'Q-006',
      path: `/Questionnaire/${qId}/initialStep`,
      message:
        `Declared initialStep '${qSpec.initialStep}' does not exist in steps list.`,
      specType: 'QuestionnaireSpec',
    });
  }

  /*
   * Q-007
   *
   * Every transition source and target MUST resolve.
   */
  for (const [fromStep, targetSteps] of Object.entries(
    qSpec.transitions
  )) {
    const transitionPath =
      `/Questionnaire/${qId}/transitions/${fromStep}`;

    if (!qSpec.steps[fromStep]) {
      violations.push({
        code: 'Q-007',
        path: transitionPath,
        message:
          `Transition source step '${fromStep}' does not exist in questionnaire steps.`,
        specType: 'QuestionnaireSpec',
      });
    }

    targetSteps.forEach((targetStep, index) => {
      if (!qSpec.steps[targetStep]) {
        violations.push({
          code: 'Q-007',
          path: `${transitionPath}[${index}]`,
          message:
            `Transition target step '${targetStep}' from '${fromStep}' does not exist in questionnaire steps.`,
          specType: 'QuestionnaireSpec',
        });
      }
    });
  }

  /*
   * Q-008
   *
   * Visibility condition questionId MUST resolve.
   */
  for (const [stepKey, step] of Object.entries(qSpec.steps)) {
    if (!step.visibilityCondition) {
      continue;
    }

    const questionId =
      step.visibilityCondition.questionId;

    if (!qSpec.questions[questionId]) {
      violations.push({
        code: 'Q-008',
        path:
          `/Questionnaire/${qId}/steps/${stepKey}/visibilityCondition/questionId`,
        message:
          `Visibility condition references non-existent questionId '${questionId}'.`,
        specType: 'QuestionnaireSpec',
      });
    }
  }

  return violations;
}
