export interface SchemaPermissions {
    read?: string[];
    write?: string[];
}
export interface SchemaField {
    id: string;
    type: "string" | "number" | "boolean" | "date" | "array" | "object";
    label: string;
    component: string;
    defaultValue?: any;
    required?: boolean;
    permissions?: SchemaPermissions;
    validationRule?: string;
    calculationRule?: string;
    visibilityRule?: string;
    placeholder?: string;
    options?: Array<{
        label: string;
        value: any;
    }>;
    itemSchema?: SchemaField;
    metadata?: Record<string, any>;
}
export interface StepConfig {
    id: string;
    title: string;
    description?: string;
    fields: string[];
    visibilityRule?: string;
}
export interface EntitySchema {
    $schemaVersion: string;
    id: string;
    title: string;
    description?: string;
    fields: Record<string, SchemaField>;
    steps: StepConfig[];
    metadata?: Record<string, any>;
}
export interface EvaluationEvent {
    timestamp: string;
    schemaId: string;
    schemaVersion: string;
    triggerField?: string;
    previousState: Record<string, any>;
    newState: Record<string, any>;
    evaluatedCalculations: string[];
    validationErrors: Record<string, string>;
    visibleFields: string[];
    visibleSteps: string[];
}
export type EngineMiddleware = (event: EvaluationEvent) => void;
//# sourceMappingURL=types.d.ts.map