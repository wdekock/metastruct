export interface NormalizedField {
    key: string;
    type: string;
    label: string;
    required: boolean;
    defaultValue?: any;
    validationRules?: Record<string, any>;
}
export interface CompiledLayoutSection {
    title: string;
    fields: NormalizedField[];
}
export interface SystemManifest {
    entityName: string;
    version: string;
    schema: Record<string, NormalizedField>;
    layout: CompiledLayoutSection[];
    workflowState: {
        initialStep?: string;
        allowedTransitions: Record<string, string[]>;
    };
    compiledAt: string;
}
export declare class MasterCompiler {
    private validator;
    constructor();
    compile(entitySpec: any, uiSpec?: any, workflowSpec?: any): SystemManifest;
}
