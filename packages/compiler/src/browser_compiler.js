"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserCompiler = void 0;
var master_compiler_js_1 = require("./master_compiler.js");
var BrowserCompiler = /** @class */ (function () {
    function BrowserCompiler() {
        this.masterCompiler = new master_compiler_js_1.MasterCompiler();
    }
    BrowserCompiler.prototype.compileInMemory = function (entitySpec, uiSpec, workflowSpec) {
        return this.masterCompiler.compile(entitySpec, uiSpec, workflowSpec);
    };
    return BrowserCompiler;
}());
exports.BrowserCompiler = BrowserCompiler;
