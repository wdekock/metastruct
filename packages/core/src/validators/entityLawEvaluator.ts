import {
  EntitySpec,
  ValidationContext,
  Violation,
} from '../laws/types.js';

const UID_TYPE = 'uid';

export function evaluateEntityLaws(
  entity: EntitySpec,
  context: ValidationContext
): Violation[] {
  const violations: Violation[] = [];
  const entityName = entity.title;

  /*
   * DM-001
   *
   * Every entity MUST declare a primary key.
   */
  if (
    !entity.primaryKey ||
    typeof entity.primaryKey !== 'string' ||
    entity.primaryKey.trim() === ''
  ) {
    violations.push({
      code: 'DM-001',
      path: `/${entityName}/primaryKey`,
      message:
        `Entity '${entityName}' must declare a valid non-empty primaryKey.`,
      specType: 'EntitySpec',
    });

    return violations;
  }

  /*
   * DM-002
   *
   * The declared primary key MUST resolve to an existing
   * property on the entity.
   */
  const pkProp = entity.properties[entity.primaryKey];

  if (!pkProp) {
    violations.push({
      code: 'DM-002',
      path: `/${entityName}/properties/${entity.primaryKey}`,
      message:
        `Declared primaryKey '${entity.primaryKey}' does not exist in properties of '${entityName}'.`,
      specType: 'EntitySpec',
    });

    return violations;
  }

  /*
   * DM-003
   *
   * The primary key MUST be a UID.
   *
   * This is a semantic law rather than merely a JSON Schema
   * datatype restriction.
   */
  if (pkProp.type !== UID_TYPE) {
    violations.push({
      code: 'DM-003',
      path: `/${entityName}/properties/${entity.primaryKey}/type`,
      message:
        `Primary key '${entity.primaryKey}' of entity '${entityName}' must have type 'uid'.`,
      specType: 'EntitySpec',
    });
  }

  /*
   * DM-004
   *
   * A primary key MUST NOT itself be a foreign key.
   */
  if (pkProp.isForeignKey === true) {
    violations.push({
      code: 'DM-004',
      path: `/${entityName}/properties/${entity.primaryKey}/isForeignKey`,
      message:
        `Primary key property '${entity.primaryKey}' cannot also be marked as a foreign key.`,
      specType: 'EntitySpec',
    });
  }

  /*
   * Foreign-key laws.
   */
  for (const [propKey, prop] of Object.entries(entity.properties)) {
    if (prop.isForeignKey !== true) {
      continue;
    }

    /*
     * DM-005
     *
     * Every FK MUST declare a target entity.
     */
    if (
      !prop.foreignEntity ||
      typeof prop.foreignEntity !== 'string' ||
      prop.foreignEntity.trim() === ''
    ) {
      violations.push({
        code: 'DM-005',
        path: `/${entityName}/properties/${propKey}/foreignEntity`,
        message:
          `Foreign key '${propKey}' must specify foreignEntity.`,
        specType: 'EntitySpec',
      });

      continue;
    }

    const targetEntity = context.entities[prop.foreignEntity];

    /*
     * DM-006
     *
     * The FK target entity MUST exist and the FK MUST be of type UID.
     * It MUST therefore contain the UID of the target entity.
     */
    if (!targetEntity) {
      violations.push({
        code: 'DM-006',
        path: `/${entityName}/properties/${propKey}/foreignEntity`,
        message:
          `Foreign entity '${prop.foreignEntity}' referenced by '${propKey}' does not exist in system context.`,
        specType: 'EntitySpec',
      });

      continue;
    }

    if (prop.type !== UID_TYPE) {
      violations.push({
        code: 'DM-006',
        path: `/${entityName}/properties/${propKey}/type`,
        message:
          `Foreign key '${propKey}' must have type 'uid' because all foreign keys reference entity UIDs.`,
        specType: 'EntitySpec',
      });
    }

    /*
     * The target entity's primary key has already been validated
     * by the entity-law pass. Check the target definition explicitly
     * so this rule remains true even when validation is used independently.
     */
    const targetPrimaryKey = targetEntity.primaryKey;
    const targetPrimaryKeyProperty =
      targetEntity.properties[targetPrimaryKey];

    if (
      !targetPrimaryKeyProperty ||
      targetPrimaryKeyProperty.type !== UID_TYPE
    ) {
      violations.push({
        code: 'DM-006',
        path: `/${entityName}/properties/${propKey}/foreignEntity`,
        message:
          `Foreign key '${propKey}' points to entity '${prop.foreignEntity}', but that entity does not have a valid UID primary key.`,
        specType: 'EntitySpec',
      });
    }
  }

  /*
   * Relationship laws.
   */
  if (entity.relationships) {
    entity.relationships.forEach((rel, index) => {
      const relPath =
        `/${entityName}/relationships[${index}]`;

      /*
       * DM-007
       *
       * Many-to-many must be represented by an explicit
       * association entity.
       */
      if (rel.type === 'manyToMany') {
        violations.push({
          code: 'DM-007',
          path: relPath,
          message:
            `Direct manyToMany relationship '${rel.name}' is illegal. Use an explicit association entity.`,
          specType: 'EntitySpec',
        });
      }

      const targetEntity = context.entities[rel.targetEntity];

      if (!targetEntity) {
        violations.push({
          code: 'DM-006',
          path: `${relPath}/targetEntity`,
          message:
            `Relationship '${rel.name}' references non-existent target entity '${rel.targetEntity}'.`,
          specType: 'EntitySpec',
        });

        return;
      }

      /*
       * The relationship FK must resolve.
       *
       * Depending on relationship direction, the FK may belong to
       * either side of the relationship. The important invariant is
       * that it is an actual FK and that its foreignEntity resolves
       * to the corresponding entity.
       */
      const localProperty = entity.properties[rel.foreignKey];
      const targetProperty = targetEntity.properties[rel.foreignKey];

      const fkCandidates = [
        {
          owner: entity,
          property: localProperty,
          ownerName: entityName,
        },
        {
          owner: targetEntity,
          property: targetProperty,
          ownerName: targetEntity.title,
        },
      ];

      const validCandidate = fkCandidates.find(
        ({ property }) =>
          property?.isForeignKey === true &&
          property.foreignEntity ===
            (property === localProperty
              ? targetEntity.title
              : entity.title)
      );

      if (!validCandidate) {
        violations.push({
          code: 'DM-006',
          path: `${relPath}/foreignKey`,
          message:
            `Relationship '${rel.name}' references foreignKey '${rel.foreignKey}', but no valid FK relationship to the target entity was found.`,
          specType: 'EntitySpec',
        });
      }
    });
  }

  return violations;
}
