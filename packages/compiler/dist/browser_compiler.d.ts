import { SystemManifest } from "./master_compiler.js";
export declare class BrowserCompiler {
    private masterCompiler;
    constructor();
    compileInMemory(entitySpec: any, uiSpec?: any, workflowSpec?: any): SystemManifest;
}
