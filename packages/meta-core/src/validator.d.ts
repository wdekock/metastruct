export declare const SYSTEM_MANIFEST_SCHEMA: {
    $id: string;
    type: string;
    required: string[];
    properties: {
        entityName: {
            type: string;
        };
        version: {
            type: string;
        };
        schema: {
            type: string;
            additionalProperties: {
                type: string;
                required: string[];
                properties: {
                    key: {
                        type: string;
                    };
                    type: {
                        type: string;
                    };
                    label: {
                        type: string;
                    };
                    required: {
                        type: string;
                    };
                    defaultValue: {
                        nullable: boolean;
                    };
                    validationRules: {
                        type: string;
                    };
                };
            };
        };
        layout: {
            type: string;
            items: {
                type: string;
                required: string[];
                properties: {
                    title: {
                        type: string;
                    };
                    fields: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                };
            };
        };
        workflowState: {
            type: string;
            required: string[];
            properties: {
                initialStep: {
                    type: string;
                    nullable: boolean;
                };
                allowedTransitions: {
                    type: string;
                    additionalProperties: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
            };
        };
        compiledAt: {
            type: string;
        };
    };
};
export declare class MetaCoreValidator {
    private ajv;
    constructor();
    validateManifest(manifest: unknown): {
        valid: boolean;
        errors?: string[];
    };
}
//# sourceMappingURL=validator.d.ts.map