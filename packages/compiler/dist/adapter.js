"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptToSystemManifest = adaptToSystemManifest;
const master_compiler_js_1 = require("./master_compiler.js");
function adaptToSystemManifest(rawManifest) {
    // If already in new shape, return directly
    if (rawManifest && rawManifest.entityName && rawManifest.schema && rawManifest.layout) {
        return rawManifest;
    }
    // Handle legacy shape (manifest.entity, manifest.ui, manifest.workflow)
    if (rawManifest && rawManifest.entity) {
        const compiler = new master_compiler_js_1.MasterCompiler();
        return compiler.compile(rawManifest.entity, rawManifest.ui, rawManifest.workflow);
    }
    throw new Error("Invalid manifest payload: Cannot adapt given object to SystemManifest.");
}
