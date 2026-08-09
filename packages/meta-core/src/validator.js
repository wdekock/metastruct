import Ajv from "ajv";
import addFormats from "ajv-formats";
export const SYSTEM_MANIFEST_SCHEMA = {
    $id: "https://metastruct.io/schemas/system-manifest.json",
    type: "object",
    required: ["entityName", "version", "schema", "layout", "workflowState", "compiledAt"],
    properties: {
        entityName: { type: "string" },
        version: { type: "string" },
        schema: {
            type: "object",
            additionalProperties: {
                type: "object",
                required: ["key", "type", "label", "required"],
                properties: {
                    key: { type: "string" },
                    type: { type: "string" },
                    label: { type: "string" },
                    required: { type: "boolean" },
                    defaultValue: { nullable: true },
                    validationRules: { type: "object" }
                }
            }
        },
        layout: {
            type: "array",
            items: {
                type: "object",
                required: ["title", "fields"],
                properties: {
                    title: { type: "string" },
                    fields: {
                        type: "array",
                        items: { $ref: "#/properties/schema/additionalProperties" }
                    }
                }
            }
        },
        workflowState: {
            type: "object",
            required: ["allowedTransitions"],
            properties: {
                initialStep: { type: "string", nullable: true },
                allowedTransitions: {
                    type: "object",
                    additionalProperties: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        },
        compiledAt: { type: "string" }
    }
};
export class MetaCoreValidator {
    ajv;
    constructor() {
        this.ajv = new Ajv({ allErrors: true, strict: false });
        addFormats(this.ajv);
        this.ajv.addSchema(SYSTEM_MANIFEST_SCHEMA, "SystemManifest");
    }
    validateManifest(manifest) {
        const validate = this.ajv.getSchema("SystemManifest");
        if (!validate) {
            throw new Error("SystemManifest schema not loaded.");
        }
        const valid = validate(manifest);
        if (!valid && validate.errors) {
            return {
                valid: false,
                errors: validate.errors.map((e) => `${e.instancePath} ${e.message}`)
            };
        }
        return { valid: true };
    }
}
