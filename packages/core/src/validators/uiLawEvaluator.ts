import { EntitySpec, UISpec, Violation } from '../laws/types.js';

const LEGAL_ABSTRACT_WIDGETS = new Set([
  'text',
  'number',
  'select',
  'datepicker',
  'checkbox',
  'textarea',
  'radio',
  'custom',
]);

export function evaluateUILaws(uiSpec: UISpec, entity: EntitySpec): Violation[] {
  const violations: Violation[] = [];
  const entityName = entity.title;

  uiSpec.sections.forEach((section, sIndex) => {
    section.fields.forEach((field, fIndex) => {
      const fieldPath = `/UI/${entityName}/sections[${sIndex}]/fields[${fIndex}]`;
      const fieldKey = typeof field === 'string' ? field : field.key;

      // UI-001: Every UI field key MUST resolve to an EntitySpec property
      if (!entity.properties[fieldKey]) {
        violations.push({
          code: 'UI-001',
          path: fieldPath,
          message: `UI field key '${fieldKey}' does not exist in Entity '${entityName}'.`,
          specType: 'UISpec',
        });
      }

      // UI-003: Custom widget types MUST be abstract technology-agnostic tokens
      if (typeof field !== 'string' && field.widget) {
        if (!LEGAL_ABSTRACT_WIDGETS.has(field.widget.type)) {
          violations.push({
            code: 'UI-003',
            path: `${fieldPath}/widget/type`,
            message: `Illegal UI widget token '${field.widget.type}'. Must be one of: ${Array.from(LEGAL_ABSTRACT_WIDGETS).join(', ')}.`,
            specType: 'UISpec',
          });
        }
      }
    });
  });

  return violations;
}