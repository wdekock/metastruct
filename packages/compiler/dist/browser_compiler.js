"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserCompiler = void 0;
const master_compiler_js_1 = require("./master_compiler.js");
class BrowserCompiler {
    masterCompiler;
    constructor() {
        this.masterCompiler = new master_compiler_js_1.MasterCompiler();
    }
    compileInMemory(entitySpec, uiSpec, workflowSpec) {
        return this.masterCompiler.compile(entitySpec, uiSpec, workflowSpec);
    }
}
exports.BrowserCompiler = BrowserCompiler;
