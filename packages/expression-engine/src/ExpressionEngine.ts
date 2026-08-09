import jsonata from "jsonata";
import { detectCyclicDependencies, FieldDependencyNode } from "./analyzer/cycleDetector";
import { EntitySchema, SchemaField } from "./types";

export interface EvaluationResult {
  computedData: Record<string, any>;
  values: Record<string, any>;
  visibleFields: string[];
  visibilityMap: Record<string, boolean>;
  visibility: Record<string, boolean>;
  errors: Record<string, string>;
}

export interface CompiledField {
  id: string;
  config: SchemaField;
  dependsOn: string[];
  compiledCalcRule?: jsonata.Expression;
  compiledVisibilityRule?: jsonata.Expression;
}

export function extractDependenciesFromExpression(expression?: string): string[] {
  if (!expression || typeof expression !== "string") {
    return [];
  }

  const matches = expression.matchAll(/\$?state\.([a-zA-Z0-9_]+)/g);
  const dependencies = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      dependencies.add(match[1]);
    }
  }

  return Array.from(dependencies);
}

export class ExpressionEngine {
  private schema: EntitySchema;
  private compiledFields: Map<string, CompiledField> = new Map();
  private isCompiled: boolean = false;

  constructor(schema?: EntitySchema) {
    if (schema) {
      this.schema = schema;
      this.compileSchema(schema);
    } else {
      this.schema = {
        $schemaVersion: "1.0.0",
        id: "empty_schema",
        title: "Empty Schema",
        fields: {},
        steps: [],
      };
    }
  }

  public compileSchema(schema: EntitySchema): void {
    this.schema = schema;
    this.compiledFields.clear();

    const normalizedFields: SchemaField[] = Array.isArray(schema.fields)
      ? schema.fields
      : Object.values(schema.fields || {});

    const dependencyNodes: FieldDependencyNode[] = [];

    for (const field of normalizedFields) {
      const calcRuleStr = field.calculationRule;
      const visRuleStr = field.visibilityRule;

      const calcDeps = extractDependenciesFromExpression(calcRuleStr);
      const visDeps = extractDependenciesFromExpression(visRuleStr);

      const combinedDeps = Array.from(new Set([...calcDeps, ...visDeps]));

      dependencyNodes.push({
        id: field.id,
        dependsOn: combinedDeps,
      });

      let compiledCalcRule: jsonata.Expression | undefined;
      let compiledVisibilityRule: jsonata.Expression | undefined;

      if (calcRuleStr) {
        try {
          compiledCalcRule = jsonata(calcRuleStr);
        } catch (err: any) {
          console.error(`[ExpressionEngine] Syntax error in calculationRule for field '${field.id}':`, err.message);
        }
      }

      if (visRuleStr) {
        try {
          compiledVisibilityRule = jsonata(visRuleStr);
        } catch (err: any) {
          console.error(`[ExpressionEngine] Syntax error in visibilityRule for field '${field.id}':`, err.message);
        }
      }

      this.compiledFields.set(field.id, {
        id: field.id,
        config: field,
        dependsOn: combinedDeps,
        compiledCalcRule,
        compiledVisibilityRule,
      });
    }

    const cycleCheck = detectCyclicDependencies(dependencyNodes);
    if (cycleCheck.hasCycle) {
      throw new Error(
        `[ExpressionEngine] Circular dependency detected in schema '${schema.id || "unnamed"}': ${cycleCheck.cyclePath.join(
          " -> "
        )}`
      );
    }

    this.isCompiled = true;
  }

  public async evaluate(
    param1: EntitySchema | Record<string, any> = {},
    param2?: Record<string, any>
  ): Promise<EvaluationResult> {
    let inputData: Record<string, any> = {};

    if (param2 !== undefined) {
      this.compileSchema(param1 as EntitySchema);
      inputData = param2;
    } else {
      inputData = param1 as Record<string, any>;
      if (!this.isCompiled) {
        this.compileSchema(this.schema);
      }
    }

    const computedData: Record<string, any> = { ...inputData };
    const visibilityMap: Record<string, boolean> = {};
    const errors: Record<string, string> = {};

    const MAX_EVAL_PASSES = 5;
    let hasChanged = true;
    let pass = 0;

    while (hasChanged && pass < MAX_EVAL_PASSES) {
      hasChanged = false;
      pass++;

      for (const [fieldId, compiled] of this.compiledFields.entries()) {
        const evalContext = {
          state: computedData,
          $state: computedData,
        };

        if (compiled.compiledCalcRule) {
          try {
            const calculatedVal = await compiled.compiledCalcRule.evaluate(evalContext);

            if (calculatedVal !== undefined && computedData[fieldId] !== calculatedVal) {
              computedData[fieldId] = calculatedVal;
              hasChanged = true;
            }
          } catch (err: any) {
            errors[fieldId] = `Calculation Error: ${err.message || err}`;
          }
        }

        if (compiled.compiledVisibilityRule) {
          try {
            const isVisible = await compiled.compiledVisibilityRule.evaluate(evalContext);
            visibilityMap[fieldId] = Boolean(isVisible);
          } catch (err: any) {
            visibilityMap[fieldId] = true;
            errors[fieldId] = `Visibility Error: ${err.message || err}`;
          }
        } else {
          visibilityMap[fieldId] = true;
        }
      }
    }

    const visibleFields = Object.keys(visibilityMap).filter((fieldId) => visibilityMap[fieldId]);

    return {
      computedData,
      values: computedData,
      visibleFields,
      visibilityMap,
      visibility: visibilityMap,
      errors,
    };
  }
}
