"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterCompiler = void 0;
var meta_core_1 = require("@metastruct/meta-core");
var MasterCompiler = /** @class */ (function () {
    function MasterCompiler() {
        this.validator = new meta_core_1.MetaCoreValidator();
    }
    MasterCompiler.prototype.compile = function (entitySpec, uiSpec, workflowSpec) {
        var _a;
        if (!entitySpec || !entitySpec.title) {
            throw new Error("Compilation Error: Missing entity spec title.");
        }
        var properties = entitySpec.properties || {};
        var requiredList = entitySpec.required || [];
        var normalizedSchema = {};
        var fieldList = [];
        // 1. Normalize schema properties & infer execution defaults
        for (var _i = 0, _b = Object.entries(properties); _i < _b.length; _i++) {
            var _c = _b[_i], key = _c[0], prop = _c[1];
            var field = {
                key: key,
                type: prop.type || "string",
                label: prop.title || key.charAt(0).toUpperCase() + key.slice(1),
                required: requiredList.includes(key),
                defaultValue: (_a = prop.default) !== null && _a !== void 0 ? _a : null,
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
        var layoutSections = (uiSpec === null || uiSpec === void 0 ? void 0 : uiSpec.sections) || [
            {
                title: "General Details",
                fields: fieldList
            }
        ];
        // 3. Compile Workflow Transitions
        var workflowTransitions = (workflowSpec === null || workflowSpec === void 0 ? void 0 : workflowSpec.transitions) || {};
        return {
            entityName: entitySpec.title,
            version: entitySpec.version || "1.0.0",
            schema: normalizedSchema,
            layout: layoutSections,
            workflowState: {
                initialStep: workflowSpec === null || workflowSpec === void 0 ? void 0 : workflowSpec.initialStep,
                allowedTransitions: workflowTransitions
            },
            compiledAt: new Date().toISOString()
        };
    };
    return MasterCompiler;
}());
exports.MasterCompiler = MasterCompiler;
