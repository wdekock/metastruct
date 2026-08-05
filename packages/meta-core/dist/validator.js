"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaCoreValidator = exports.SYSTEM_MANIFEST_SCHEMA = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
exports.SYSTEM_MANIFEST_SCHEMA = {
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
class MetaCoreValidator {
    ajv;
    constructor() {
        this.ajv = new ajv_1.default({ allErrors: true, strict: false });
        (0, ajv_formats_1.default)(this.ajv);
        this.ajv.addSchema(exports.SYSTEM_MANIFEST_SCHEMA, "SystemManifest");
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
exports.MetaCoreValidator = MetaCoreValidator;
