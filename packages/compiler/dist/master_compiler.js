"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterCompiler = void 0;
const meta_core_1 = require("@metastruct/meta-core");
class MasterCompiler {
    validator;
    constructor() {
        this.validator = new meta_core_1.MetaCoreValidator();
    }
    compile(entitySpec, uiSpec, workflowSpec) {
        if (!entitySpec || !entitySpec.title) {
            throw new Error("Compilation Error: Missing entity spec title.");
        }
        const properties = entitySpec.properties || {};
        const requiredList = entitySpec.required || [];
        const normalizedSchema = {};
        const fieldList = [];
        // 1. Normalize schema properties & infer execution defaults
        for (const [key, prop] of Object.entries(properties)) {
            const field = {
                key,
                type: prop.type || "string",
                label: prop.title || key.charAt(0).toUpperCase() + key.slice(1),
                required: requiredList.includes(key),
                defaultValue: prop.default ?? null,
                validationRules: {
                    minLength: prop.minLength,
                    maxLength: prop.maxLength,
                    minimum: prop.minimum,
                    maximum: prop.maximum,
                    pattern: prop.pattern
                }
            };
            normalizedSchema[key] = field;
            fieldList.push(field);
        }
        // 2. Build organized UI layout sections
        const layoutSections = uiSpec?.sections || [
            {
                title: "General Details",
                fields: fieldList
            }
        ];
        // 3. Compile Workflow Transitions
        const workflowTransitions = workflowSpec?.transitions || {};
        return {
            entityName: entitySpec.title,
            version: entitySpec.version || "1.0.0",
            schema: normalizedSchema,
            layout: layoutSections,
            workflowState: {
                initialStep: workflowSpec?.initialStep,
                allowedTransitions: workflowTransitions
            },
            compiledAt: new Date().toISOString()
        };
    }
}
exports.MasterCompiler = MasterCompiler;
