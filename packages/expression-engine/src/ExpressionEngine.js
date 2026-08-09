import jsonata from "jsonata";
import { detectCyclicDependencies } from "./analyzer/cycleDetector";
export function extractDependenciesFromExpression(expression) {
    if (!expression || typeof expression !== "string") {
        return [];
    }
    const matches = expression.matchAll(/\$?state\.([a-zA-Z0-9_]+)/g);
    const dependencies = new Set();
    for (const match of matches) {
        if (match[1]) {
            dependencies.add(match[1]);
        }
    }
    return Array.from(dependencies);
}
export class ExpressionEngine {
    schema;
    compiledFields = new Map();
    isCompiled = false;
    constructor(schema) {
        if (schema) {
            this.schema = schema;
            this.compileSchema(schema);
        }
        else {
            this.schema = {
                $schemaVersion: "1.0.0",
                id: "empty_schema",
                title: "Empty Schema",
                fields: {},
                steps: [],
            };
        }
    }
    compileSchema(schema) {
        this.schema = schema;
        this.compiledFields.clear();
        const normalizedFields = Array.isArray(schema.fields)
            ? schema.fields
            : Object.values(schema.fields || {});
        const dependencyNodes = [];
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
            let compiledCalcRule;
            let compiledVisibilityRule;
            if (calcRuleStr) {
                try {
                    compiledCalcRule = jsonata(calcRuleStr);
                }
                catch (err) {
                    console.error(`[ExpressionEngine] Syntax error in calculationRule for field '${field.id}':`, err.message);
                }
            }
            if (visRuleStr) {
                try {
                    compiledVisibilityRule = jsonata(visRuleStr);
                }
                catch (err) {
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
            throw new Error(`[ExpressionEngine] Circular dependency detected in schema '${schema.id || "unnamed"}': ${cycleCheck.cyclePath.join(" -> ")}`);
        }
        this.isCompiled = true;
    }
    async evaluate(param1 = {}, param2) {
        let inputData = {};
        if (param2 !== undefined) {
            this.compileSchema(param1);
            inputData = param2;
        }
        else {
            inputData = param1;
            if (!this.isCompiled) {
                this.compileSchema(this.schema);
            }
        }
        const computedData = { ...inputData };
        const visibilityMap = {};
        const errors = {};
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
                    }
                    catch (err) {
                        errors[fieldId] = `Calculation Error: ${err.message || err}`;
                    }
                }
                if (compiled.compiledVisibilityRule) {
                    try {
                        const isVisible = await compiled.compiledVisibilityRule.evaluate(evalContext);
                        visibilityMap[fieldId] = Boolean(isVisible);
                    }
                    catch (err) {
                        visibilityMap[fieldId] = true;
                        errors[fieldId] = `Visibility Error: ${err.message || err}`;
                    }
                }
                else {
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
