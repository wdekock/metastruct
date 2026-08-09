// packages/expression-engine/src/engine/ExpressionEngine.ts

import jsonata from "jsonata";
import { detectCyclicDependencies, FieldDependencyNode } from "../analyzer/cycleDetector";

export interface SchemaFieldConfig {
  id: string;
  type?: "string" | "number" | "boolean" | "array" | "object";
  label?: string;
  component?: string;
  required?: boolean;
  calculationRule?: string;
  visibilityRule?: string;
  [key: string]: any;
}

export interface EntitySchema {
  $schemaVersion?: string;
  id: string;
  title?: string;
  fields: Record<string, SchemaFieldConfig> | SchemaFieldConfig[];
  steps?: Array<{
    id: string;
    title: string;
    fields: string[];
    visibilityRule?: string;
  }>;
}

export interface EvaluationResult {
  computedData: Record<string, any>;
  visibleFields: string[];
  visibilityMap: Record<string, boolean>;
  errors: Record<string, string>;
}

export interface CompiledField {
  id: string;
  config: SchemaFieldConfig;
  dependsOn: string[];
  compiledCalcRule?: jsonata.Expression;
  compiledVisibilityRule?: jsonata.Expression;
}

/**
 * Parses JSONata formula strings to extract variable references pointing to `$state.fieldName`
 */
export function extractDependenciesFromExpression(expression?: string): string[] {
  if (!expression || typeof expression !== "string") {
    return [];
  }

  // Regex matches patterns like $state.fieldName, $state.nested.field, or state.fieldName
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
      this.schema = { id: "empty_schema", fields: {} };
    }
  }

  /**
   * Compiles and validates the target schema.
   * Performs static analysis to detect cyclic dependencies across field formulas.
   */
  public compileSchema(schema: EntitySchema): void {
    this.schema = schema;
    this.compiledFields.clear();

    const normalizedFields: SchemaFieldConfig[] = Array.isArray(schema.fields)
      ? schema.fields
      : Object.values(schema.fields);

    const dependencyNodes: FieldDependencyNode[] = [];

    // Step 1: Pre-process dependencies & compile JSONata ASTs
    for (const field of normalizedFields) {
      const calcDeps = extractDependenciesFromExpression(field.calculationRule);
      const visDeps = extractDependenciesFromExpression(field.visibilityRule);

      // Merge dependencies from both rules
      const combinedDeps = Array.from(new Set([...calcDeps, ...visDeps]));

      dependencyNodes.push({
        id: field.id,
        dependsOn: combinedDeps,
      });

      let compiledCalcRule: jsonata.Expression | undefined;
      let compiledVisibilityRule: jsonata.Expression | undefined;

      if (field.calculationRule) {
        try {
          compiledCalcRule = jsonata(field.calculationRule);
        } catch (err: any) {
          console.error(`[ExpressionEngine] Syntax error in calculationRule for field '${field.id}':`, err.message);
        }
      }

      if (field.visibilityRule) {
        try {
          compiledVisibilityRule = jsonata(field.visibilityRule);
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

    // Step 2: Validate graph integrity via Cycle Detector (DFS)
    const cycleCheck = detectCyclicDependencies(dependencyNodes);
    if (cycleCheck.hasCycle) {
      throw new Error(
        `[ExpressionEngine] Circular dependency detected in schema '${schema.id}': ${cycleCheck.cyclePath.join(
          " -> "
        )}`
      );
    }

    this.isCompiled = true;
  }

  /**
   * Evaluates input form state against compiled JSONata calculation and visibility rules.
   * Performs multi-pass re-evaluation to propagate calculated dependent values.
   */
  public async evaluate(inputData: Record<string, any> = {}): Promise<EvaluationResult> {
    if (!this.isCompiled) {
      this.compileSchema(this.schema);
    }

    const computedData: Record<string, any> = { ...inputData };
    const visibilityMap: Record<string, boolean> = {};
    const errors: Record<string, string> = {};

    // Max 5 passes to ensure complex nested multi-level updates settle
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

        // 1. Evaluate Calculation Rules
        if (compiled.compiledCalcRule) {
          try {
            const calculatedVal = await compiled.compiledCalcRule.evaluate(evalContext);

            // Update state if value computed and changed
            if (calculatedVal !== undefined && computedData[fieldId] !== calculatedVal) {
              computedData[fieldId] = calculatedVal;
              hasChanged = true;
            }
          } catch (err: any) {
            errors[fieldId] = `Calculation Error: ${err.message || err}`;
          }
        }

        // 2. Evaluate Visibility Rules
        if (compiled.compiledVisibilityRule) {
          try {
            const isVisible = await compiled.compiledVisibilityRule.evaluate(evalContext);
            visibilityMap[fieldId] = Boolean(isVisible);
          } catch (err: any) {
            visibilityMap[fieldId] = true; // Fallback to visible on error
            errors[fieldId] = `Visibility Error: ${err.message || err}`;
          }
        } else {
          visibilityMap[fieldId] = true; // Default visible if no rule set
        }
      }
    }

    const visibleFields = Object.keys(visibilityMap).filter((fieldId) => visibilityMap[fieldId]);

    return {
      computedData,
      visibleFields,
      visibilityMap,
      errors,
    };
  }
}