import { MasterCompiler, SystemManifest } from "./master_compiler.js";

export class BrowserCompiler {
  private masterCompiler: MasterCompiler;

  constructor() {
    this.masterCompiler = new MasterCompiler();
  }

  public compileInMemory(entitySpec: any, uiSpec?: any, workflowSpec?: any): SystemManifest {
    return this.masterCompiler.compile(entitySpec, uiSpec, workflowSpec);
  }
}
