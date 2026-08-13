import { EntitySpec, ValidationContext, Violation } from '../laws/types.js';

export function evaluateEntityLaws(entity: EntitySpec, context: ValidationContext): Violation[] {
  const violations: Violation[] = [];
  const entityName = entity.title;

  // DM-001: primaryKey MUST be declared
  if (!entity.primaryKey || typeof entity.primaryKey !== 'string' || entity.primaryKey.trim() === '') {
    violations.push({
      code: 'DM-001',
      path: `/${entityName}/primaryKey`,
      message: `Entity '${entityName}' must declare a valid non-empty primaryKey.`,
      specType: 'EntitySpec',
    });
    return violations; // Abort deeper PK checks if missing
  }

  // DM-002: primaryKey MUST resolve to an existing property key
  const pkProp = entity.properties[entity.primaryKey];
  if (!pkProp) {
    violations.push({
      code: 'DM-002',
      path: `/${entityName}/properties/${entity.primaryKey}`,
      message: `Declared primaryKey '${entity.primaryKey}' does not exist in properties of '${entityName}'.`,
      specType: 'EntitySpec',
    });
  } else {
    // DM-003: primaryKey MUST NOT be marked as an FK
    if (pkProp.isForeignKey) {
      violations.push({
        code: 'DM-003',
        path: `/${entityName}/properties/${entity.primaryKey}/isForeignKey`,
        message: `Primary key property '${entity.primaryKey}' cannot be marked as a foreign key.`,
        specType: 'EntitySpec',
      });
    }
  }

  // Property-level FK evaluations
  for (const [propKey, prop] of Object.entries(entity.properties)) {
    if (prop.isForeignKey) {
      // DM-004: Foreign key MUST specify foreignEntity
      if (!prop.foreignEntity || prop.foreignEntity.trim() === '') {
        violations.push({
          code: 'DM-004',
          path: `/${entityName}/properties/${propKey}/foreignEntity`,
          message: `Property '${propKey}' is marked as a foreign key but lacks a foreignEntity target.`,
          specType: 'EntitySpec',
        });
      } else {
        // DM-005: foreignEntity MUST resolve to a registered entity in context
        const targetEntity = context.entities[prop.foreignEntity];
        if (!targetEntity) {
          violations.push({
            code: 'DM-005',
            path: `/${entityName}/properties/${propKey}/foreignEntity`,
            message: `Foreign entity '${prop.foreignEntity}' referenced by '${propKey}' does not exist in context.`,
            specType: 'EntitySpec',
          });
        }
      }
    }
  }

  // DM-006 & DM-007: Relationship evaluations
  if (entity.relationships) {
    entity.relationships.forEach((rel, index) => {
      const relPath = `/${entityName}/relationships[${index}]`;

      // DM-007: Reject implicit manyToMany without association model
      if (rel.type === 'manyToMany') {
        violations.push({
          code: 'DM-007',
          path: relPath,
          message: `Direct manyToMany relationship '${rel.name}' is illegal. Use an explicit association entity.`,
          specType: 'EntitySpec',
        });
      }

      // DM-006: Target entity & FK resolution
      const targetEntity = context.entities[rel.targetEntity];
      if (!targetEntity) {
        violations.push({
          code: 'DM-006',
          path: `${relPath}/targetEntity`,
          message: `Relationship '${rel.name}' references non-existent target entity '${rel.targetEntity}'.`,
          specType: 'EntitySpec',
        });
      }

      const fkProp = entity.properties[rel.foreignKey] || (targetEntity && targetEntity.properties[rel.foreignKey]);
      if (!fkProp) {
        violations.push({
          code: 'DM-006',
          path: `${relPath}/foreignKey`,
          message: `Relationship '${rel.name}' references non-existent foreignKey property '${rel.foreignKey}'.`,
          specType: 'EntitySpec',
        });
      }
    });
  }

  return violations;
}