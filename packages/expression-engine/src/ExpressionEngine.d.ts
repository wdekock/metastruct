import jsonata from "jsonata";
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
export declare function extractDependenciesFromExpression(expression?: string): string[];
export declare class ExpressionEngine {
    private schema;
    private compiledFields;
    private isCompiled;
    constructor(schema?: EntitySchema);
    compileSchema(schema: EntitySchema): void;
    evaluate(param1?: EntitySchema | Record<string, any>, param2?: Record<string, any>): Promise<EvaluationResult>;
}
//# sourceMappingURL=ExpressionEngine.d.ts.map